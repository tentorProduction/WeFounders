import type { StartupWithTags } from "@/types/database";
import { raw, sql } from "@/lib/db/neon";
import { reportReadFailure } from "@/lib/data/read-failure";

/**
 * Profile reads.
 *
 * `getStartupsByFounder` returns more than the public feed does, because a
 * founder can see their own drafts and rejected submissions that the feed's
 * `status = 'approved'` filter hides. Neon has no row-level client at all —
 * every query here runs server-side — so visibility is the caller's
 * responsibility: callers must pass the authenticated viewer's own id.
 */

const STARTUP_WITH_TAGS = `
  select
    s.id, s.founder_id, s.slug, s.name, s.tagline, s.description,
    s.website_url, s.demo_video_url, s.logo_url, s.banner_url, s.stage,
    s.target_market, s.status, s.rejection_reason, s.launch_date,
    s.upvotes_count, s.comments_count, s.waitlist_count, s.is_featured,
    s.featured_until, s.created_at, s.updated_at,
    coalesce(
      (
        select json_agg(json_build_object(
          'id', t.id, 'name', t.name, 'slug', t.slug, 'category', t.category
        ) order by t.name)
        from startup_tags st
        join tags t on t.id = st.tag_id
        where st.startup_id = s.id
      ),
      '[]'::json
    ) as tags
  from startups s
`;

export async function getStartupsByFounder(
  founderId: string
): Promise<StartupWithTags[]> {
  if (!founderId) return [];

  try {
    const rows = (await sql`
      ${raw(STARTUP_WITH_TAGS)}
      where s.founder_id = ${founderId}::uuid
      order by s.created_at desc
    `) as unknown as StartupWithTags[];

    return rows;
  } catch (error) {
    reportReadFailure("getStartupsByFounder", error);
    return [];
  }
}