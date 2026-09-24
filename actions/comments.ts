"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getViewer, isFounderViewer } from "@/lib/auth/viewer";
import { addComment } from "@/lib/comments";
import { getStartupBySlug } from "@/lib/fixtures/startups";
// Type lives outside this "use server" module — see the file.
import type { CommentActionState } from "@/lib/action-state";

/** Post a comment (or a founder reply) on a startup's discussion thread. */

const commentSchema = z.object({
  slug: z.string().min(1),
  authorName: z.string().trim().min(2).max(40),
  content: z.string().trim().min(2).max(1200),
  asFounder: z.boolean().optional(),
});

export async function postCommentAction(
  _prevState: CommentActionState,
  formData: FormData
): Promise<CommentActionState> {
  const parsed = commentSchema.safeParse({
    slug: String(formData.get("slug") ?? ""),
    authorName: String(formData.get("authorName") ?? ""),
    content: String(formData.get("content") ?? ""),
    asFounder: formData.get("asFounder") === "on",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Add your name (2+ characters) and a comment before posting.",
    };
  }

  const startup = await getStartupBySlug(parsed.data.slug);
  if (!startup) {
    return { status: "error", message: "That startup no longer exists." };
  }

  const viewer = await getViewer();
  // Founder replies are only marked as such for the verified owner.
  const isFounderReply = isFounderViewer(
    viewer,
    startup,
    parsed.data.asFounder === true
  );

  await addComment({
    startupId: startup.id,
    authorName: parsed.data.authorName,
    content: parsed.data.content,
    isFounderReply,
    userId: viewer.userId,
  });

  revalidatePath(`/startups/${startup.slug}`);

  return { status: "success", message: "Posted." };
}
