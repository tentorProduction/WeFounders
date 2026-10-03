import { SearchResultsSkeleton, LoadingAnnouncer } from "@/components/ui/skeletons";

export default function SearchLoading() {
  return (
    <div className="site-container space-y-6 py-8">
      <LoadingAnnouncer label="Loading search results" />
      <div aria-hidden className="h-9 w-72 rounded-full bg-[#E7E9ED]" />
      <div aria-hidden className="h-14 w-full rounded-2xl bg-[#E7E9ED]" />
      <SearchResultsSkeleton />
    </div>
  );
}