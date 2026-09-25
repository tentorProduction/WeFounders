import { getServerSupabase } from "@/lib/supabase/server";

/**
 * Single source of truth for public-facing metrics.
 * A number is displayed ONLY if it is real and verifiable.
 */
export async function getSiteStats() {
  const supabase = await getServerSupabase();
  
  // Get all approved launches
  const { data: launches, error: launchesErr } = await supabase
    .from("startups")
    .select("waitlist_count, upvotes_count")
    .eq("status", "approved");

  if (launchesErr || !launches) {
    return {
      verifiedLaunches: 0,
      waitlistedTesters: 0,
      totalUpvotes: 0
    };
  }

  const verifiedLaunches = launches.length;
  // Compute aggregate totals across all approved launches
  const waitlistedTesters = launches.reduce((acc, curr) => acc + (curr.waitlist_count || 0), 0);
  const totalUpvotes = launches.reduce((acc, curr) => acc + (curr.upvotes_count || 0), 0);

  return {
    verifiedLaunches,
    waitlistedTesters,
    totalUpvotes
  };
}
