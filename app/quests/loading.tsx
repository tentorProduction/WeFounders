import { QuestSkeleton, LoadingAnnouncer } from "@/components/ui/skeletons";

export default function QuestsLoading() {
  return (
    <div className="site-container space-y-6 py-8">
      <LoadingAnnouncer label="Loading quests" />
      <QuestSkeleton rows={6} />
    </div>
  );
}