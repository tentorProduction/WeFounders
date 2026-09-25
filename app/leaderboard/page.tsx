"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Trophy, Flame, ShieldCheck, ArrowUpRight } from "lucide-react";
import { STARTUP_FIXTURES } from "@/lib/fixtures/startups";
import { StartupCard } from "@/components/startups/startup-card";
import { useOptimisticUpvotes } from "@/lib/hooks/use-optimistic-upvotes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StartupWithTags } from "@/types/database";

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "all">("week");
  const { getUpvote, toggleUpvote } = useOptimisticUpvotes();

  const rankedStartups = useMemo(() => {
    const list = [...STARTUP_FIXTURES];
    if (timeframe === "week") {
      return list.sort((a, b) => b.upvotes_count - a.upvotes_count);
    } else if (timeframe === "month") {
      return list.sort((a, b) => b.waitlist_count - a.waitlist_count);
    } else {
      return list.sort((a, b) => (b.upvotes_count + b.waitlist_count) - (a.upvotes_count + a.waitlist_count));
    }
  }, [timeframe]);

  return (
    <div className="site-container py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4 text-center md:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-tiny font-semibold text-amber-600 dark:text-amber-400">
          <Trophy className="h-3.5 w-3.5 fill-current" />
          <span>Verified Founder Leaderboard</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-display font-black tracking-tight text-foreground">
              Top Ranked Nepali Products
            </h1>
            <p className="mt-1 text-body text-muted-foreground max-w-2xl">
              Ranked by real platform engagement — verified upvotes, opt-in waitlist conversions, and community testing reports.
            </p>
          </div>

          {/* Timeframe Filter Tabs */}
          <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-card p-1.5 shadow-apple-xs shrink-0 self-center md:self-auto">
            <button
              onClick={() => setTimeframe("week")}
              className={`rounded-xl px-3.5 py-1.5 text-caption font-bold transition-all ${
                timeframe === "week"
                  ? "bg-primary text-primary-foreground shadow-apple-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🔥 This Week
            </button>
            <button
              onClick={() => setTimeframe("month")}
              className={`rounded-xl px-3.5 py-1.5 text-caption font-bold transition-all ${
                timeframe === "month"
                  ? "bg-primary text-primary-foreground shadow-apple-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🚀 This Month
            </button>
            <button
              onClick={() => setTimeframe("all")}
              className={`rounded-xl px-3.5 py-1.5 text-caption font-bold transition-all ${
                timeframe === "all"
                  ? "bg-primary text-primary-foreground shadow-apple-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🏆 All-Time
            </button>
          </div>
        </div>
      </div>

      {/* Transparent Methodology Banner */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-apple-sm godly-bg-glow flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-subheading font-bold text-foreground">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <span>Transparent Methodology &amp; Anti-Spam</span>
          </div>
          <p className="text-caption text-muted-foreground max-w-2xl">
            Unlike platforms that rely on self-reported social media ARR claims, WeFounders measures verified user upvotes, double-opt-in waitlist entries, and validated proof-of-work tester reports.
          </p>
        </div>

        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link href="/about#curation">Read Curation Bar</Link>
        </Button>
      </div>

      {/* Podium Highlight (Top 3) */}
      <div className="grid gap-4 sm:grid-cols-3">
        {rankedStartups.slice(0, 3).map((startup, idx) => {
          const rankColor =
            idx === 0
              ? "from-amber-500/20 to-yellow-500/5 border-amber-500/40 text-amber-500"
              : idx === 1
              ? "from-slate-400/20 to-zinc-400/5 border-slate-400/40 text-slate-400"
              : "from-amber-700/20 to-amber-800/5 border-amber-700/40 text-amber-700";

          const medal = idx === 0 ? "🥇 #1 Champion" : idx === 1 ? "🥈 #2 Runner Up" : "🥉 #3 Spotlight";

          return (
            <div
              key={startup.id}
              className={`godly-card deck-card p-5 bg-gradient-to-b ${rankColor} border space-y-3 relative overflow-hidden`}
            >
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="font-bold text-tiny uppercase tracking-wider">
                  {medal}
                </Badge>
                <span className="font-mono font-bold text-caption text-foreground">
                  ▲ {startup.upvotes_count} Upvotes
                </span>
              </div>

              <div>
                <h3 className="text-subheading font-bold text-foreground line-clamp-1">
                  <Link href={`/startups/${startup.slug}`} className="hover:underline">
                    {startup.name}
                  </Link>
                </h3>
                <p className="text-caption text-muted-foreground line-clamp-2 mt-1">
                  {startup.tagline}
                </p>
              </div>

              <div className="pt-2 border-t border-border/50 flex items-center justify-between text-tiny">
                <span className="text-muted-foreground font-mono">
                  {startup.waitlist_count} Waitlist Users
                </span>
                <Link
                  href={`/startups/${startup.slug}`}
                  className="font-bold text-primary hover:underline flex items-center gap-1"
                >
                  View Details <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Leaderboard List */}
      <div className="space-y-3">
        <h2 className="text-heading font-bold text-foreground flex items-center gap-2">
          <Flame className="h-4 w-4 text-accent fill-accent" /> Full Ranking List ({rankedStartups.length} Startups)
        </h2>

        <div className="space-y-3">
          {rankedStartups.map((startup: StartupWithTags, index: number) => (
            <StartupCard
              key={startup.id}
              startup={startup}
              rank={index + 1}
              upvote={{
                ...getUpvote(startup.id, startup.upvotes_count),
                onToggle: () => toggleUpvote(startup.id),
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
