import { createAdminClient } from "@/lib/supabase/admin";
import type { CommentWithAuthor } from "@/types/database";

/**
 * Discussion threads (PRD §4.1 — "Threaded comment section with verified
 * Founder badge"). Supabase is the only source.
 *
 * Comments carry a real author: `comments.user_id` is a foreign key to
 * `profiles`, and the author fields are embedded in the select. There is no
 * anonymous or fixture path — an empty thread renders an empty state.
 *
 * Writes use the service-role client because identity comes from our own
 * verified session (see lib/auth/session.ts) rather than a Supabase auth
 * session. Callers must authorize before calling: only a signed-in viewer may
 * comment, and only the startup's founder may claim the Maker badge.
 */

const COMMENT_SELECT = `
  id, startup_id, user_id, parent_id, content, is_founder_reply, created_at, updated_at,
  author:profiles ( username, full_name, avatar_url, karma_score, role )
`;

export async function getCommentThread(startupId: string): Promise<CommentWithAuthor[]> {
  if (!startupId) return [];

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("comments")
      .select(COMMENT_SELECT)
      .eq("startup_id", startupId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return (data ?? []) as unknown as CommentWithAuthor[];
  } catch (error) {
    console.error("[comments] read failed:", error);
    return [];
  }
}

export interface NewCommentInput {
  startupId: string;
  /** Required — only authenticated viewers can post. */
  userId: string;
  content: string;
  isFounderReply: boolean;
}

export async function addComment(input: NewCommentInput): Promise<CommentWithAuthor> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("comments")
    .insert({
      startup_id: input.startupId,
      user_id: input.userId,
      content: input.content,
      is_founder_reply: input.isFounderReply,
    })
    .select(COMMENT_SELECT)
    .single();

  if (error) throw new Error(`Could not post that comment: ${error.message}`);
  return data as unknown as CommentWithAuthor;
}
