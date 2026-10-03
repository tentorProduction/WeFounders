import type { CollabPost } from "@/types/database";
import { raw, sql } from "@/lib/db/neon";
import { reportReadFailure } from "@/lib/data/read-failure";

/**
 * Collab & co-founder board reads (TRD §2 table 11).
 *
 * Listings link optionally to a startup, and the author's display name is
 * denormalized onto the row at write time so the board renders without needing
 * to expose private profile rows to anonymous database clients.
 */

export type CollabPostWithAuthor = CollabPost & {
  author_name: string;
  author_username: string;
  /** Linked startup name when the listing is attached to a launch. */
  startup_name: string | null;
  startup_slug: string | null;
};

/** The listing row joined to its optional parent startup. */
const COLLAB_WITH_STARTUP = `
  select
    p.id, p.startup_id, p.author_id, p.role_type, p.title, p.description,
    p.equity_or_compensation, p.contact_channel, p.is_active, p.created_at,
    coalesce(p.author_name, 'WeFounders builder') as author_name,
    s.name as startup_name,
    s.slug as startup_slug
  from collab_posts p
  left join startups s on s.id = p.startup_id
`;

/** Board listings — active first, then newest. */
export async function listCollabPosts(): Promise<CollabPostWithAuthor[]> {
  try {
    const rows = (await sql`
      ${raw(COLLAB_WITH_STARTUP)}
      where p.is_active=true and p.approval_status='approved'
      order by p.is_active desc, p.created_at desc
    `) as unknown as CollabPostWithAuthor[];

    return rows.map((row) => {
      const authorName = row.author_name || "WeFounders builder";
      return {
        ...row,
        author_name: authorName,
        author_username:
          authorName.toLowerCase().replace(/[^a-z0-9]+/g, "") || "builder",
      };
    });
  } catch (error) {
    reportReadFailure("listCollabPosts", error);
    return [];
  }
}
