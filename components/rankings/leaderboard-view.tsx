"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CaretUp, Flame, ShieldCheck, Trophy } from "@/components/icons";

import { cn } from "@/lib/utils";
import { countOf } from "@/lib/pluralize";
import { StartupCard } from "@/components/startups/startup-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useOptimisticUpvotes } from "@/lib/hooks/use-optimistic-upvotes";
import type { StartupWithTags } from "@/types/database";

export interface LeaderboardViewProps {
  startups: StartupWithTags[];
}

const TIMEFRAMES = [
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "all", label: "All Time" },
] as const;

type Timeframe = (typeof TIMEFRAMES)[number]["id"];

export function LeaderboardView({ startups }: LeaderboardViewProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("week");
  const { getUpvote, toggleUpvote } = useOptimisticUpvotes();

  const rankedStartups = useMemo(() => {
    const list = [...startups];
    if (timeframe === "week") {
      return list.sort((a, b) => b.upvotes_count - a.upvotes_count);
    }
    if (timeframe === "month") {
      return list.sort((a, b) => b.waitlist_count - a.waitlist_count);
    }
    return list.sort(
      (a, b) =>
        b.upvotes_count + b.waitlist_count - (a.upvotes_count + a.waitlist_count)
    );
  }, [startups, timeframe]);

  const total = rankedStartups.length;
  // A podium only makes sense once there is a field to podium. With one or two
  // products a three-column trophy display would dwarf the actual ranking.
  const showPodium = total >= 3;
  const podium = showPodium ? rankedStartups.slice(0, 3) : [];
  const fullList = showPodium ? rankedStartups.slice(3) : rankedStartups;

  return (
    <div className="site-container space-y-8 py-8 sm:space-y-10">
      <header className="space-y-3">
        <Badge variant="outline" className="gap-1.5 font-mono text-tiny">
          <Trophy className="h-3.5 w-3.5 text-primary" weight="fill" aria-hidden />
          Verified Founder Leaderboard
        </Badge>
        <h1 className="text-display font-bold tracking-tight text-foreground">
          Top Ranked Products
        </h1>
        <p className="max-w-2xl text-body text-muted-foreground">
          Ranked by real platform engagement — verified upvotes, opt-in waitlist
          conversions, and community testing reports.
        </p>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Timeframe tabs */}
        <div
          role="group"
          aria-label="Ranking timeframe"
          className="flex items-center gap-1 self-start rounded-full border border-border bg-card p-1 shadow-apple-xs"
        >
          {TIMEFRAMES.map((option) => {
            const active = timeframe === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setTimeframe(option.id)}
                aria-pressed={active}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-caption font-semibold transition-colors",
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <p className="font-mono text-caption text-muted-foreground">
          {countOf(total, "startup")} ranked
        </p>
      </div>

      {/* Public methodology */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-[16px] border border-[#DADDE1] bg-[#FFFFFF] p-5 md:flex-row md:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-subheading font-archivo font-bold text-[#17181B]">
            <ShieldCheck className="h-5 w-5 shrink-0 text-[#FF4B3E]" weight="fill" aria-hidden />
            <span>How Ranking Works</span>
          </div>
          <p className="max-w-3xl text-caption leading-relaxed text-[#666A73]">
            Every ranking on WeFounders is calculated in real time using verified
            on-platform engagement metrics (community upvotes, double opt-in waitlist
            requests, and validated testing quest reports). Zero self-reported ARR
            claims; 100% transparent proof-of-work.
          </p>
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="shrink-0 rounded-full"
        >
          <Link href="/about#curation">Read our curation standard</Link>
        </Button>
      </div>

      {total === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No launches ranked yet"
          description="The leaderboard fills up as soon as the first launches are approved."
          hint="Founders who publish here get ranked by verified engagement, not self-reported numbers."
          action={{ label: "Submit your startup", href: "/submit" }}
        />
      ) : (
        <>
          {/* Top 3 — restrained, equal weight */}
          {showPodium && (
            <section aria-label="Top ranked products" className="grid gap-3 sm:grid-cols-3">
              {podium.map((startup, index) => (
                <Link
                  key={startup.id}
                  href={`/startups/${startup.slug}`}
                  className="godly-card deck-card group flex flex-col justify-between gap-4 p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-heading font-bold tabular-nums text-[#17181B]">
                      #{index + 1}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-tiny text-muted-foreground">
                      <CaretUp className="h-3.5 w-3.5 text-[#FF4B3E]" weight="fill" />
                      {countOf(startup.upvotes_count, "upvote")}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="truncate text-subheading font-bold text-foreground group-hover:text-primary">
                      {startup.name}
                    </h3>
                    <p className="line-clamp-2 text-caption text-muted-foreground">
                      {startup.tagline}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/60 pt-3 text-tiny text-muted-foreground">
                    <span className="font-mono">
                      {countOf(startup.waitlist_count, "waitlist")}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-primary">
                      View <ArrowUpRight className="h-3 w-3" aria-hidden />
                    </span>
                  </div>
                </Link>
              ))}
            </section>
          )}

          {/* Full ranking */}
          <section
              aria-label={showPodium ? "Full ranking" : "Current standings"}
              className="space-y-4"
            >
            <h2 className="flex items-center gap-2 text-heading font-bold text-foreground">
              <Flame className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              {showPodium ? "Full Ranking" : "Current Standings"}
              <span className="font-mono text-caption font-normal text-muted-foreground">
                ({countOf(fullList.length, "startup")})
              </span>
            </h2>

            {fullList.length > 0 ? (
              <div className="space-y-3">
                {fullList.map((startup, index) => (
                  <StartupCard
                    key={startup.id}
                    startup={startup}
                    rank={index + (showPodium ? 4 : 1)}
                    upvote={{
                      ...getUpvote(startup.id, startup.upvotes_count),
                      onToggle: () => toggleUpvote(startup.id),
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-[16px] border border-dashed border-border bg-card p-8 text-center text-caption text-muted-foreground">
                The top three are shown above. More founders are joining soon.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}