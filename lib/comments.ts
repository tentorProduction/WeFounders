import { raw, sql } from "@/lib/db/neon";
import type { CommentWithAuthor } from "@/types/database";

/**
 * Discussion threads (PRD §4.1 — "Threaded comment section with verified
 * Founder badge"). Neon is the only source.
 *
 * Comments carry a real author: `comments.user_id` is a foreign key to
 * `profiles`, joined explicitly below. There is no anonymous or fixture path —
 * an empty thread renders an empty state.
 *
 * Writes are server-side and identity comes from the signed-in viewer (see
 * lib/auth/viewer.ts). Callers must authorize before calling: only a signed-in
 * viewer may comment, and only the startup's founder may claim the Maker badge.
 */

const COMMENT_SELECT = `
  select
    c.id, c.startup_id, c.user_id, c.parent_id, c.content,
    c.is_founder_reply, c.created_at, c.updated_at,
    json_build_object(
      'id', p.id,
      'username', p.username,
      'full_name', p.full_name,
      'avatar_url', p.avatar_url,
      'karma_score', p.karma_score,
      'role', p.role
    ) as author
  from comments c
  left join profiles p on p.id = c.user_id
`;

export async function getCommentThread(startupId: string): Promise<CommentWithAuthor[]> {
  if (!startupId) return [];

  try {
    const rows = (await sql`
      ${raw(COMMENT_SELECT)}
      where c.startup_id = ${startupId}::uuid
      order by c.created_at asc
    `) as unknown as CommentWithAuthor[];

    return rows;
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
  const rows = (await sql`
    insert into comments (startup_id, user_id, content, is_founder_reply)
    values (
      ${input.startupId}::uuid,
      ${input.userId}::uuid,
      ${input.content},
      ${input.isFounderReply}
    )
    returning id, startup_id, user_id, parent_id, content,
              is_founder_reply, created_at, updated_at
  `) as Record<string, unknown>[];

  const inserted = rows[0];
  if (!inserted) throw new Error("Could not post that comment.");

  // Re-read through the join so the caller gets the same shape as a list read.
  const withAuthor = (await sql`
    ${raw(COMMENT_SELECT)}
    where c.id = ${inserted.id as string}::uuid
    limit 1
  `) as unknown as CommentWithAuthor[];

  const comment = withAuthor[0];
  if (!comment) throw new Error("Could not post that comment.");
  return comment;
}