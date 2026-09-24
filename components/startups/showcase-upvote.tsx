"use client";

import { cn } from "@/lib/utils";
import { UpvoteButton } from "@/components/startups/upvote-button";
import { useOptimisticUpvotes } from "@/lib/hooks/use-optimistic-upvotes";

export interface ShowcaseUpvoteProps {
  startupId: string;
  count: number;
  size?: "default" | "lg";
  label?: string;
  className?: string;
}

/**
 * Prominent upvote for the startup showcase hero (DESIGN.md §4.2) — same
 * optimistic engine as the feed, so votes stay in sync across the site.
 */
export function ShowcaseUpvote({
  startupId,
  count,
  size = "lg",
  label,
  className,
}: ShowcaseUpvoteProps) {
  const { getUpvote, toggleUpvote } = useOptimisticUpvotes();
  const view = getUpvote(startupId, count);

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      {label && (
        <span className="text-tiny font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      )}
      <UpvoteButton
        size={size}
        count={view.count}
        voted={view.voted}
        pending={view.pending}
        onToggle={() => toggleUpvote(startupId)}
      />
    </div>
  );
}
