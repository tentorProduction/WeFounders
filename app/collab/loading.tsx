import { CollabSkeleton, LoadingAnnouncer } from "@/components/ui/skeletons";

export default function CollabLoading() {
  return (
    <div className="site-container space-y-6 py-8">
      <LoadingAnnouncer label="Loading opportunities" />
      <CollabSkeleton rows={6} />
    </div>
  );
}