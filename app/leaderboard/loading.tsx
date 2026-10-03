import { LeaderboardSkeleton, LoadingAnnouncer } from "@/components/ui/skeletons";

export default function LeaderboardLoading() {
  return (
    <div className="site-container space-y-6 py-8">
      <LoadingAnnouncer label="Loading leaderboard" />
      <div aria-hidden className="h-10 w-64 rounded-full bg-[#E7E9ED]" />
      <LeaderboardSkeleton />
    </div>
  );
}