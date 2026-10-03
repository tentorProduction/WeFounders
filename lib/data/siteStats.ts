import { sql } from "@/lib/db/neon";

/**
 * Single source of truth for public-facing metrics.
 * A number is displayed ONLY if it is real and verifiable.
 *
 * Aggregated in the database rather than by pulling every row into memory and
 * reducing in JS — the same numbers, one row transferred.
 */
export async function getSiteStats() {
  try {
    const rows = (await sql`
      select
        count(*)::int                                  as verified_launches,
        coalesce(sum(waitlist_count), 0)::int          as waitlisted_testers,
        coalesce(sum(upvotes_count), 0)::int          as total_upvotes
      from startups
      where status = 'approved'
    `) as {
      verified_launches: number;
      waitlisted_testers: number;
      total_upvotes: number;
    }[];

    const row = rows[0];
    return {
      verifiedLaunches: row?.verified_launches ?? 0,
      waitlistedTesters: row?.waitlisted_testers ?? 0,
      totalUpvotes: row?.total_upvotes ?? 0,
    };
  } catch (error) {
    console.error("[siteStats] read failed:", error);
    return { verifiedLaunches: 0, waitlistedTesters: 0, totalUpvotes: 0 };
  }
}