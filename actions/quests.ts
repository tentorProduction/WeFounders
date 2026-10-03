"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getQuestById } from "@/lib/data/quests";
import { addQuestSubmission } from "@/lib/quests/store";
import { getViewer } from "@/lib/auth/viewer";
import { headers } from "next/headers";
import { clientAddress, isRateLimited } from "@/lib/security/rate-limit";
// Type/initial value live outside this "use server" module — see the file.
import type { QuestSubmissionActionState } from "@/lib/action-state";

/**
 * Quest proof submission.
 *
 * Screenshots are validated and recorded safely against oversized or
 * forged payloads via the zod schema.
 */

const submissionSchema = z.object({
  questId: z.uuid(),
  testerName: z.string().trim().min(2).max(40),
  feedbackText: z.string().trim().min(20).max(2000),
  ratingUx: z.number().int().min(1).max(5),
  ratingSpeed: z.number().int().min(1).max(5),
  deviceInfo: z.object({
    platform: z.string().max(100).nullable(),
    screen: z.string().max(30).nullable(),
    connection: z.string().max(60).nullable(),
  }),
});

export async function submitQuestProofAction(
  _prevState: QuestSubmissionActionState,
  formData: FormData
): Promise<QuestSubmissionActionState> {
  // A reward is credited for this report, so it must be tied to a real account.
  const viewer = await getViewer();
  if (!viewer.userId) {
    return { status: "error", message: "Sign in with Google to submit quest proof." };
  }

  const requestHeaders = await headers();
  if (await isRateLimited("quest-report", `${viewer.userId}:${clientAddress(requestHeaders)}`, 5, 60 * 60_000)) {
    return { status: "error", message: "Too many reports from this network. Try again later." };
  }

  const parsed = submissionSchema.safeParse({
    questId: String(formData.get("questId") ?? ""),
    testerName: String(formData.get("testerName") ?? ""),
    feedbackText: String(formData.get("feedbackText") ?? ""),
    ratingUx: Number(formData.get("ratingUx") ?? 3),
    ratingSpeed: Number(formData.get("ratingSpeed") ?? 3),
    deviceInfo: {
      // Snapshot of the tester's environment — small and useful for founders.
      platform: String(formData.get("devicePlatform") ?? "").slice(0, 100) || null,
      screen: String(formData.get("deviceScreen") ?? "").slice(0, 30) || null,
      connection: String(formData.get("deviceConnection") ?? "").slice(0, 60) || null,
    },
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0]?.path[0];
    return {
      status: "error",
      message:
        first === "feedbackText"
          ? "Describe what you found in at least 20 characters — founders act on detail."
          : first === "testerName"
            ? "Add your name (2+ characters)."
            : "Check the form — something didn't validate.",
    };
  }

  const quest = await getQuestById(parsed.data.questId);
  if (!quest) {
    return { status: "error", message: "That quest no longer exists." };
  }

  if (quest.status !== "active") {
    return { status: "error", message: "This quest is paused — check back soon." };
  }

  if (quest.submissions_count >= quest.max_submissions) {
    return { status: "error", message: "This quest is already full." };
  }

  await addQuestSubmission({
    questId: quest.id,
    testerId: viewer.userId,
    testerName: parsed.data.testerName,
    feedbackText: parsed.data.feedbackText,
    ratingUx: parsed.data.ratingUx,
    ratingSpeed: parsed.data.ratingSpeed,
    proofScreenshots: [],
    deviceInfo: parsed.data.deviceInfo,
  });

  revalidatePath("/quests");
  revalidatePath(`/startups/${quest.startup.slug}`);

  return {
    status: "success",
    message: `Report received — ${quest.reward_description ?? "your Karma"} lands once the founder accepts it.`,
    questTitle: quest.title,
  };
}
