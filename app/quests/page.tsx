import { getSiteOrigin } from "@/lib/site-url";
import type { Metadata } from "next";
import { Sword } from "@/components/icons";

import { getQuestBoard } from "@/lib/data/quests";
import { countOf } from "@/lib/pluralize";
import { QuestCard } from "@/components/quests/quest-card";
import { EmptyState } from "@/components/ui/empty-state";

const baseUrl = getSiteOrigin();

export const metadata: Metadata = {
  title: "Testing Quests & Bounties",
  description:
    "Test real product betas across real devices and platforms. Founders post the task; you file the report and earn bounties and Karma.",
  alternates: { canonical: new URL("/quests", baseUrl) },
};

export const dynamic = "force-dynamic";

/** Testing Quests board (PRD §4.1 Should-Have, DESIGN.md §4.4). */
export default async function QuestsPage() {
  const quests = await getQuestBoard();

  const active = quests.filter((q) => q.status === "active");
  const openSlots = active.reduce(
    (sum, q) => sum + Math.max(0, q.max_submissions - q.submissions_count),
    0
  );

  return (
    <div className="site-container py-8 space-y-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-caption font-medium uppercase tracking-wide text-primary">
            <Sword className="h-4 w-4" weight="bold" aria-hidden />
            Bounties
          </p>
          <h1 className="mt-1 text-display font-bold tracking-tight">
            Testing Quests
          </h1>
          <p className="mt-1 max-w-xl text-body text-muted-foreground">
            Founders post a real testing task. You file the proof; the bounty —
            cash rewards or Karma — is yours when they accept it.
          </p>
        </div>
        <p className="font-mono text-caption text-muted-foreground">
          {countOf(active.length, "active quest")} · {countOf(openSlots, "open tester slot")}
        </p>
      </header>

      {quests.length === 0 ? (
        <EmptyState
          icon={Sword}
          title="No active quests"
          description="There aren't any testing quests available right now."
          hint="New quests appear when founders launch."
          action={{ label: "Explore startups", href: "/" }}
        />
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
