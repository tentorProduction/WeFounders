import { StartupCardSkeleton, LoadingAnnouncer } from "@/components/ui/skeletons";

/** Homepage feed skeleton — mirrors the real card height so nothing jumps. */
export default function HomeLoading() {
  return (
    <div className="site-container space-y-6 py-8">
      <LoadingAnnouncer label="Loading launches" />
      <div aria-hidden className="h-[220px] w-full rounded-[34px] bg-[#E7E9ED]" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <StartupCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}