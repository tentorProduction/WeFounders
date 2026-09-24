"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getQuestById } from "@/lib/fixtures/quests";
import { addQuestSubmission } from "@/lib/quests/store";
import { getViewer } from "@/lib/auth/viewer";
// Type/initial value live outside this "use server" module — see the file.
import type { QuestSubmissionActionState } from "@/lib/action-state";

/**
 * Quest proof submission (PRD §4.1, TRD §2 table 9, DESIGN.md §4.4).
 *
 * Screenshots are described by name only for now — binary upload lands with
 * Supabase Storage (TODO below). The action stays safe against oversized or
 * forged payloads via the zod schema.
 */

const submissionSchema = z.object({
  questId: z.string().min(1),
  testerName: z.string().trim().min(2).max(40),
  feedbackText: z.string().trim().min(20).max(2000),
  ratingUx: z.number().int().min(1).max(5),
  ratingSpeed: z.number().int().min(1).max(5),
  proofScreenshots: z.array(z.string().max(255)).max(6),
  deviceInfo: z.record(z.string(), z.unknown()).nullable(),
});

export async function submitQuestProofAction(
  _prevState: QuestSubmissionActionState,
  formData: FormData
): Promise<QuestSubmissionActionState> {
  const parsed = submissionSchema.safeParse({
    questId: String(formData.get("questId") ?? ""),
    testerName: String(formData.get("testerName") ?? ""),
    feedbackText: String(formData.get("feedbackText") ?? ""),
    ratingUx: Number(formData.get("ratingUx") ?? 3),
    ratingSpeed: Number(formData.get("ratingSpeed") ?? 3),
    proofScreenshots: JSON.parse(String(formData.get("proofScreenshots") ?? "[]")) as string[],
    deviceInfo: {
      // Snapshot of the tester's environment — small and useful for founders.
      platform: String(formData.get("devicePlatform") ?? "") || null,
      screen: String(formData.get("deviceScreen") ?? "") || null,
      connection: String(formData.get("deviceConnection") ?? "") || null,
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

  const viewer = await getViewer();

  // TODO(P1): upload screenshot binaries to Supabase Storage and store URLs.
  await addQuestSubmission({
    questId: quest.id,
    testerId: viewer.userId,
    testerName: parsed.data.testerName,
    feedbackText: parsed.data.feedbackText,
    ratingUx: parsed.data.ratingUx,
    ratingSpeed: parsed.data.ratingSpeed,
    proofScreenshots: parsed.data.proofScreenshots,
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
