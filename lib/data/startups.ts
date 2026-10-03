import type { StartupWithTags, Tag } from "@/types/database";
import { raw, sql } from "@/lib/db/neon";
import { reportReadFailure } from "@/lib/data/read-failure";

/**
 * Startup reads — Neon Postgres is the single source of truth.
 *
 * There is no fixture fallback: when the table is empty the feed renders a
 * real empty state, which is the honest thing to show on a platform that has
 * no approved launches yet. Read failures are logged and degrade to an empty
 * result so a transient backend blip can never take the whole site down with a
 * 500; the write paths in the lib stores surface errors instead.
 */

/**
 * The startup row plus its tags, aggregated in one round trip.
 *
 * `coalesce(json_agg(...), '[]')` keeps `tags` an array even when a startup has
 * none — the previous PostgREST embed could return null here, which the UI had
 * to defend against.
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

function logReadFailure(what: string, error: unknown): void {
  reportReadFailure(what, error);
}

/* ------------------------------------------------------------------ */
/* Feed & showcase                                                     */
/* ------------------------------------------------------------------ */

export interface FeedOptions {
  limit?: number;
  orderBy?: "upvotes" | "newest";
}

/** Approved launches, highest upvotes first — the homepage discovery feed. */
export async function getStartupFeed(options: FeedOptions = {}): Promise<StartupWithTags[]> {
  try {
    const order =
      options.orderBy === "newest"
        ? "order by s.launch_date desc"
        : "order by s.upvotes_count desc";
    const limit = options.limit ?? 200;

    const rows = await sql`
      ${raw(STARTUP_WITH_TAGS)}
      where s.status = 'approved'
      ${raw(order)}
      limit ${limit}
    `;
    return rows as unknown as StartupWithTags[];
  } catch (error) {
    logReadFailure("getStartupFeed", error);
    return [];
  }
}

/** The promoted slot, rendered by FeaturedSpotlight. */
export async function getFeaturedStartup(): Promise<StartupWithTags | null> {
  try {
    const rows = (await sql`
      ${raw(STARTUP_WITH_TAGS)}
      where s.status = 'approved' and s.is_featured = true
      limit 1
    `) as unknown as StartupWithTags[];

    const startup = rows[0] ?? null;
    if (!startup) return null;

    // An expired promotion must not keep the spotlight.
    if (startup.featured_until && new Date(startup.featured_until).getTime() <= Date.now()) {
      return null;
    }
    return startup;
  } catch (error) {
    logReadFailure("getFeaturedStartup", error);
    return null;
  }
}

/**
 * Single startup lookup for the showcase route (PRD Flow 1).
 * Matches slug first, then tolerates a case-insensitive slug, then the name —
 * so hand-typed URLs like /startups/Chhito still resolve.
 */
export async function getStartupBySlug(slug: string): Promise<StartupWithTags | null> {
  const needle = decodeURIComponent(slug).trim();
  if (!needle) return null;

  try {
    // A lone `%` or `_` would act as a wildcard in ILIKE and match everything.
    const pattern = `%${needle.replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`;

    const rows = (await sql`
      ${raw(STARTUP_WITH_TAGS)}
      where lower(s.slug) like lower(${pattern})
      limit 1
    `) as unknown as StartupWithTags[];

    if (rows[0]) return rows[0];

    const byName = (await sql`
      ${raw(STARTUP_WITH_TAGS)}
      where lower(s.name) like lower(${pattern})
      limit 1
    `) as unknown as StartupWithTags[];

    return byName[0] ?? null;
  } catch (error) {
    logReadFailure("getStartupBySlug", error);
    return null;
  }
}

export async function getStartupById(id: string): Promise<StartupWithTags | null> {
  if (!id) return null;

  try {
    const rows = (await sql`
      ${raw(STARTUP_WITH_TAGS)}
      where s.id = ${id}::uuid
      limit 1
    `) as unknown as StartupWithTags[];

    return rows[0] ?? null;
  } catch (error) {
    logReadFailure("getStartupById", error);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Discovery helpers                                                   */
/* ------------------------------------------------------------------ */

/** Free-text search across name, tagline and description. */
export async function searchStartups(term: string, limit = 24): Promise<StartupWithTags[]> {
  const needle = term.trim().replace(/[%,()]/g, "").slice(0, 80);
  if (!needle) return [];

  try {
    const pattern = `%${needle.replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`;

    const rows = (await sql`
      ${raw(STARTUP_WITH_TAGS)}
      where s.status = 'approved'
        and (
          s.name ilike ${pattern}
          or s.tagline ilike ${pattern}
          or s.description ilike ${pattern}
        )
      order by s.upvotes_count desc
      limit ${limit}
    `) as unknown as StartupWithTags[];

    return rows;
  } catch (error) {
    logReadFailure("searchStartups", error);
    return [];
  }
}

/** Unique ecosystem tags — used for filter suggestions. */
export async function getAllTags(): Promise<Tag[]> {
  try {
    const rows = (await sql`
      select id, name, slug, coalesce(category, 'industry') as category
      from tags
      order by name asc
    `) as unknown as Tag[];

    return rows;
  } catch (error) {
    logReadFailure("getAllTags", error);
    return [];
  }
}