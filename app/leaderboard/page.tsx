import type { Metadata } from "next";

import { getStartupFeed } from "@/lib/data/startups";
import { LeaderboardView } from "@/components/rankings/leaderboard-view";

export const metadata: Metadata = {
  title: "Founder Leaderboard",
  description:
    "Top ranked Nepali products by verified on-platform engagement — upvotes, opt-in waitlists and accepted testing reports.",
};

export const dynamic = "force-dynamic";

/** Public leaderboard. Rankings are computed client-side from live rows. */
export default async function LeaderboardPage() {
  const startups = await getStartupFeed();

  return <LeaderboardView startups={startups} />;
}
