import { ProfileSkeleton, LoadingAnnouncer } from "@/components/ui/skeletons";

export default function ProfileLoading() {
  return (
    <div className="site-container space-y-6 py-8">
      <LoadingAnnouncer label="Loading your dashboard" />
      <ProfileSkeleton />
    </div>
  );
}