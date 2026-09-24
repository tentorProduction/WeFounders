"use client";

import { useState } from "react";
import Link from "next/link";
import { Gift, Smartphone, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import type { QuestWithStartup } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuestSubmissionModal } from "@/components/quests/quest-submission-modal";
import { StartupLogo } from "@/components/startups/startup-logo";

export interface QuestCardProps {
  quest: QuestWithStartup;
  className?: string;
}

/** Active testing-quest card for the /quests board (DESIGN.md §4.4). */
export function QuestCard({ quest, className }: QuestCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const isFull = quest.submissions_count >= quest.max_submissions;
  const isPaused = quest.status !== "active";

  return (
    <article
      className={cn(
        "flex flex-col rounded-xl border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <StartupLogo
          name={quest.startup.name}
          logoUrl={quest.startup.logo_url}
          seed={quest.startup.slug}
          size={40}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {isFull ? (
              <Badge variant="secondary">Full</Badge>
            ) : isPaused ? (
              <Badge variant="secondary">Paused</Badge>
            ) : (
              <Badge variant="verified">Active</Badge>
            )}
          </div>
          <h3 className="mt-1 text-h2 leading-snug">{quest.title}</h3>
          <p className="text-caption text-muted-foreground">
            by{" "}
            <Link
              href={`/startups/${quest.startup.slug}`}
              className="font-medium hover:text-foreground"
            >
              {quest.startup.name}
            </Link>
          </p>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-body text-muted-foreground">
        {quest.task_instructions}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-caption text-muted-foreground">
        {quest.target_devices && (
          <span className="inline-flex items-center gap-1">
            <Smartphone className="h-3.5 w-3.5" aria-hidden />
            {quest.target_devices}
          </span>
        )}
        <span className="inline-flex items-center gap-1 tabular-nums">
          <Users className="h-3.5 w-3.5" aria-hidden />
          {quest.submissions_count}/{quest.max_submissions} testers
        </span>
      </div>

      {quest.reward_description && (
        <p className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-md border border-badge-esewa/25 bg-badge-esewa/10 px-2 py-1 text-caption font-medium text-foreground">
          <Gift className="h-3.5 w-3.5 text-badge-esewa" aria-hidden />
          {quest.reward_description}
        </p>
      )}

      <Button
        className="mt-4 self-start"
        size="sm"
        disabled={isFull || isPaused}
        onClick={() => setModalOpen(true)}
      >
        {isFull ? "Quest Full" : isPaused ? "Paused" : "Accept Quest"}
      </Button>

      <QuestSubmissionModal
        questId={quest.id}
        questTitle={quest.title}
        reward={quest.reward_description}
        testerNameHint={quest.startup.name}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </article>
  );
}
