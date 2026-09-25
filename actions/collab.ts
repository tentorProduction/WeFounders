"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { addCollabPost, normalizeContactChannel } from "@/lib/collab/store";
import { getViewer } from "@/lib/auth/viewer";
// Type/initial value live outside this "use server" module — see the file.
import type { CollabPostActionState } from "@/lib/action-state";

/**
 * Post a collab/co-founder opportunity (PRD §4.1, TRD §2 table 11,
 * DESIGN.md §4.5). Requires a signed-in viewer; the author is taken from the
 * verified session, never from the form.
 */

const collabSchema = z.object({
  roleType: z.enum([
    "cofounder",
    "founding_engineer",
    "designer",
    "beta_tester",
    "intern",
  ]),
  title: z.string().trim().min(10).max(150),
  description: z.string().trim().min(40).max(2000),
  equityOrCompensation: z.string().trim().max(120),
  contactRaw: z.string().trim().max(200),
});

export async function postOpportunityAction(
  _prevState: CollabPostActionState,
  formData: FormData
): Promise<CollabPostActionState> {
  const parsed = collabSchema.safeParse({
    roleType: String(formData.get("roleType") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    equityOrCompensation: String(formData.get("equityOrCompensation") ?? ""),
    contactRaw: String(formData.get("contactRaw") ?? ""),
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0]?.path[0];
    return {
      status: "error",
      message:
        first === "title"
          ? "Give the listing a clear title (10+ characters)."
          : first === "description"
            ? "Describe the role in at least 40 characters."
            : first === "roleType"
              ? "Pick a role type."
              : "Check the form — something didn't validate.",
    };
  }

  const contact = normalizeContactChannel(parsed.data.contactRaw);
  if (!contact) {
    return {
      status: "error",
      message:
        "Contact must be a phone number (WhatsApp), @telegram handle, or email.",
    };
  }

  const viewer = await getViewer();
  if (!viewer.userId) {
    return {
      status: "error",
      message: "Sign in with Google to post an opportunity.",
    };
  }

  try {
    await addCollabPost({
      roleType: parsed.data.roleType,
      title: parsed.data.title,
      description: parsed.data.description,
      equityOrCompensation: parsed.data.equityOrCompensation || null,
      contactChannel: contact,
      authorId: viewer.userId,
      authorName: viewer.fullName ?? viewer.email?.split("@")[0] ?? "WeFounders builder",
    });
  } catch (error) {
    console.error("[collab] post failed:", error);
    return { status: "error", message: "We couldn't publish that. Please try again." };
  }

  revalidatePath("/collab");

  return {
    status: "success",
    message: "Listing posted — it's live on the board.",
  };
}
