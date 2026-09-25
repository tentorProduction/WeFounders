"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getViewer, isFounderViewer } from "@/lib/auth/viewer";
import { addComment } from "@/lib/comments";
import { getStartupBySlug } from "@/lib/data/startups";
// Type lives outside this "use server" module — see the file.
import type { CommentActionState } from "@/lib/action-state";

/**
 * Post a comment (or a founder reply) on a startup's discussion thread.
 *
 * The author is the signed-in viewer — there is no name field to spoof and no
 * anonymous posting. The Maker/Founder badge is only applied when the viewer
 * actually owns the startup.
 */

const commentSchema = z.object({
  slug: z.string().min(1),
  content: z.string().trim().min(2).max(1200),
  asFounder: z.boolean().optional(),
});

export async function postCommentAction(
  _prevState: CommentActionState,
  formData: FormData
): Promise<CommentActionState> {
  const parsed = commentSchema.safeParse({
    slug: String(formData.get("slug") ?? ""),
    content: String(formData.get("content") ?? ""),
    asFounder: formData.get("asFounder") === "on",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Write a comment before posting.",
    };
  }

  const viewer = await getViewer();
  if (!viewer.userId) {
    return {
      status: "error",
      message: "Sign in with Google to join the discussion.",
    };
  }

  const startup = await getStartupBySlug(parsed.data.slug);
  if (!startup) {
    return { status: "error", message: "That startup no longer exists." };
  }

  // Founder replies are only marked as such for the verified owner.
  const isFounderReply =
    parsed.data.asFounder === true && isFounderViewer(viewer, startup);

  try {
    await addComment({
      startupId: startup.id,
      userId: viewer.userId,
      content: parsed.data.content,
      isFounderReply,
    });
  } catch (error) {
    console.error("[comments] post failed:", error);
    return { status: "error", message: "We couldn't post that. Please try again." };
  }

  revalidatePath(`/startups/${startup.slug}`);

  return { status: "success", message: "Posted." };
}
