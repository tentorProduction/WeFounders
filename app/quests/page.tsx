import type { Metadata } from "next";
import { Swords } from "lucide-react";

import { getQuestBoard } from "@/lib/fixtures/quests";
import { withLocalSubmissionCounts } from "@/lib/quests/store";
import { QuestCard } from "@/components/quests/quest-card";

export const metadata: Metadata = {
  title: "Testing Quests — Wefounder",
  description:
    "Test real Nepali betas on real Nepali networks. Founders post the task; you file the report and earn NPR bounties and Karma.",
};

/** Testing Quests board (PRD §4.1 Should-Have, DESIGN.md §4.4). */
export default async function QuestsPage() {
  const quests = await withLocalSubmissionCounts(await getQuestBoard());

  const active = quests.filter((q) => q.status === "active");
  const openSlots = active.reduce(
    (sum, q) => sum + Math.max(0, q.max_submissions - q.submissions_count),
    0
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-caption font-medium uppercase tracking-wide text-primary">
            <Swords className="h-4 w-4" aria-hidden />
            Bounties
          </p>
          <h1 className="mt-1 text-display font-bold tracking-tight">
            Testing Quests
          </h1>
          <p className="mt-1 max-w-xl text-body text-muted-foreground">
            Founders post a real task on a real device or network. You file the
            proof; the bounty — NPR via eSewa/Khalti, or Karma — is yours when
            they accept it.
          </p>
        </div>
        <p className="text-caption text-muted-foreground">
          <span className="font-semibold tabular-nums text-foreground">
            {active.length}
          </span>{" "}
          active quests ·{" "}
          <span className="font-semibold tabular-nums text-foreground">
            {openSlots}
          </span>{" "}
          open tester slots
        </p>
      </header>

      {quests.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-body text-muted-foreground">
          No quests right now — founders post new ones every launch day.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </div>
      )}
    </div>
  );
}
