"use client";

import { useMemo, useState } from "react";
import {
  CalendarBlank,
  CaretUp,
  Cloud,
  CreditCard,
  Flame,
  GlobeHemisphereWest,
  MagnifyingGlass,
  RocketLaunch,
  Sparkle,
  SquaresFour,
  X,
} from "@/components/icons";

import { cn } from "@/lib/utils";
import { countOf } from "@/lib/pluralize";
import type { StartupWithTags } from "@/types/database";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FeaturedSpotlight } from "@/components/startups/featured-spotlight";
import { StartupCard } from "@/components/startups/startup-card";
import { TagPill, type TagPillTag } from "@/components/startups/tag-pill";
import { useOptimisticUpvotes } from "@/lib/hooks/use-optimistic-upvotes";

export type FeedFilter =
  | "all"
  | "nepal_domestic"
  | "global_export"
  | "ai"
  | "fintech"
  | "saas";

interface FilterOption {
  key: FeedFilter;
  label: string;
  icon: React.ComponentType<{ className?: string; weight?: "regular" | "bold" | "fill" }>;
}

const FILTERS: FilterOption[] = [
  { key: "all", label: "All Ventures", icon: SquaresFour },
  { key: "global_export", label: "Global Launches", icon: GlobeHemisphereWest },
  { key: "ai", label: "AI & Intelligence", icon: Sparkle },
  { key: "fintech", label: "Fintech & Payments", icon: CreditCard },
  { key: "saas", label: "SaaS & Infrastructure", icon: Cloud },
];

function matchesFilter(startup: StartupWithTags, filter: FeedFilter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "nepal_domestic":
      return startup.target_market === "nepal_domestic";
    case "global_export":
      return (
        startup.target_market === "global_export" ||
        startup.target_market === "hybrid"
      );
    case "ai":
      return startup.tags.some((tag) => tag.slug.includes("ai") || tag.slug.includes("ml"));
    case "fintech":
      return startup.tags.some((tag) => tag.slug.includes("fintech") || tag.slug === "esewa" || tag.slug === "khalti");
    case "saas":
      return startup.tags.some((tag) => tag.slug.includes("saas") || tag.slug.includes("devtools"));
  }
}

function matchesQuery(startup: StartupWithTags, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  const haystack = [
    startup.name,
    startup.tagline,
    startup.description,
    ...startup.tags.map((tag) => tag.name),
    ...startup.tags.map((tag) => tag.slug.replace(/-/g, " ")),
  ]
    .join(" ")
    .toLowerCase();

  return needle.split(/\s+/).every((term) => haystack.includes(term));
}

export interface DiscoveryFeedProps {
  startups: StartupWithTags[];
  featured?: StartupWithTags | null;
  batchDate: string;
  /** Stable ISO date for the batch label — passed from the server so the
   *  server and client render the same value. */
  batchDateIso: string;
  siteStats: {
    verifiedLaunches: number;
    waitlistedTesters: number;
    totalUpvotes: number;
  };
}

/** One startup record renders one card, whatever the query returns. */
function dedupeById(list: StartupWithTags[]): StartupWithTags[] {
  const seen = new Set<string>();
  return list.filter((startup) => {
    const key = startup.id || startup.slug;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function DiscoveryFeed({
  startups,
  featured = null,
  batchDate,
  batchDateIso,
  siteStats,
}: DiscoveryFeedProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FeedFilter>("all");
  const [activeTag, setActiveTag] = useState<TagPillTag | null>(null);
  const [sortBy, setSortBy] = useState<"popular" | "newest" | "waitlist">("popular");
  const { getUpvote, toggleUpvote } = useOptimisticUpvotes();

  const { verifiedLaunches, waitlistedTesters, totalUpvotes } = siteStats;





  const results = useMemo(
    () =>
      dedupeById(
        startups.filter(
          (startup) =>
            matchesFilter(startup, filter) &&
            matchesQuery(startup, query) &&
            (!activeTag || startup.tags.some((tag) => tag.slug === activeTag.slug))
        )
      ),
    [startups, filter, query, activeTag]
  );

  const spotlightVisible =
    featured !== null &&
    matchesFilter(featured, filter) &&
    matchesQuery(featured, query) &&
    (!activeTag || featured.tags.some((tag) => tag.slug === activeTag.slug));

  const feed = useMemo(() => {
    // The spotlight is an alternative presentation of the same record, so it
    // must never also appear in the feed — filtered or not. Previously the
    // featured startup was only excluded when no filter was active, which
    // rendered the same product twice as soon as a visitor searched.
    const spotlightId = spotlightVisible ? featured?.id : undefined;
    const list =
      spotlightId === undefined
        ? results
        : results.filter((startup) => startup.id !== spotlightId);

    if (sortBy === "popular") {
      return [...list].sort((a, b) => b.upvotes_count - a.upvotes_count);
    } else if (sortBy === "waitlist") {
      return [...list].sort((a, b) => b.waitlist_count - a.waitlist_count);
    } else {
      return [...list].sort(
        (a, b) =>
          new Date(b.launch_date ?? b.created_at).getTime() -
          new Date(a.launch_date ?? a.created_at).getTime()
      );
    }
  }, [results, featured, sortBy, spotlightVisible]);

  const hasFilters = filter !== "all" || query.trim() !== "" || activeTag !== null;

  function clearFilters() {
    setFilter("all");
    setQuery("");
    setActiveTag(null);
  }

  function handleTagSelect(tag: TagPillTag) {
    setActiveTag((current) => (current?.slug === tag.slug ? null : tag));
  }

  return (
    <div className="space-y-10 sm:space-y-14">
      <section className="agency-hero relative px-0 pb-8 pt-6 sm:pb-10 sm:pt-8">
        <div className="relative z-10 max-w-[820px] space-y-6 text-left">
          {/* Eyebrow */}
          <div className="glass-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#E83A30]">
            <GlobeHemisphereWest className="h-3.5 w-3.5 text-[#FF4B3E]" weight="bold" />
            <span>GLOBAL STARTUP LAUNCH PLATFORM</span>
          </div>

          <h1 className="max-w-[780px] font-archivo text-[clamp(2.5rem,6vw,4.5rem)] font-medium leading-[0.86] tracking-[-0.07em] text-[#17181B]">
            Discover new launches.
          </h1>

          {/* Subhead */}
          <p className="max-w-xl pt-2 text-[16px] leading-relaxed text-[#4F535C] sm:text-[18px]">
            Connecting early-stage founders with beta users, verified community traction, and proof-of-work engagement worldwide.
          </p>

          {/* Primary Gold Pill CTA + Secondary Outline CTA */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              asChild
              className="ink-button h-12 px-6 font-archivo text-[15px] font-semibold transition-all hover:-translate-y-0.5 hover:bg-black"
            >
              <a href="/submit">Submit Your Startup</a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="glass-pill h-12 rounded-full border-white/80 px-6 font-archivo text-[15px] font-semibold text-[#17181B] hover:bg-white"
            >
              <a href="/leaderboard">View Leaderboard</a>
            </Button>
          </div>

          {/* Real Verified Stats Ticker Bar (Stacked vertically on mobile, row on sm+) */}
          <div className="flex flex-wrap items-center gap-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#555A64]">
            <div className="glass-pill flex items-center gap-1.5 rounded-full px-3 py-2">
              <CalendarBlank className="h-3.5 w-3.5 text-[#FF4B3E]" weight="bold" />
              <span><time dateTime={batchDateIso}>{batchDate}</time> Batch</span>
            </div>

            <div className="glass-pill flex items-center gap-1.5 rounded-full px-3 py-2">
              <RocketLaunch className="h-3.5 w-3.5 text-[#FF4B3E]" weight="bold" />
              <span>{countOf(verifiedLaunches, "Live Launch")}</span>
            </div>

            <div className="glass-pill flex items-center gap-1.5 rounded-full px-3 py-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4B3E] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF4B3E]"></span>
              </span>
              <span>{countOf(waitlistedTesters, "Waitlisted Tester")}</span>
            </div>

            <div className="glass-pill flex items-center gap-1.5 rounded-full px-3 py-2">
              <CaretUp className="h-4 w-4 text-[#FF4B3E]" weight="fill" />
              <span>{countOf(totalUpvotes, "Upvote")}</span>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="relative mt-5 max-w-xl">
            <MagnifyingGlass
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666A73]"
              weight="bold"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search ventures, technologies, AI copilots, dev tools…"
              aria-label="Search ventures"
              className="glass-pill h-[52px] w-full rounded-full border-white/80 bg-white/70 pl-11 pr-10 text-[15px] font-medium text-[#17181B] placeholder:text-[#666A73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4B3E]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1 text-[#666A73] transition-colors hover:bg-[#F4F4F5] hover:text-[#17181B]"
              >
                <X className="h-4 w-4" weight="bold" aria-hidden />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Filter Tabs Bar */}
      <div
        role="group"
        aria-label="Filter ventures"
        className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {FILTERS.map(({ key, label, icon: Icon }) => {
          const active = filter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              aria-pressed={active}
              className={cn(
                "press-scale inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border px-4 text-caption font-semibold transition-all",
                active
                  ? "border-[#17181B] bg-[#17181B] text-white font-archivo font-bold shadow-sm"
                  : "border-white/80 bg-white/72 text-[#666A73] shadow-sm hover:border-[#FF4B3E]/30 hover:bg-white hover:text-[#17181B]"
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-white" : "text-[#8C9099]")} weight={active ? "fill" : "bold"} />
              {label}
            </button>
          );
        })}
      </div>

      {activeTag && (
        <div className="flex items-center justify-center gap-2">
          <span className="text-caption text-[#666A73] font-mono">
            Active Filter Tag:
          </span>
          <TagPill tag={activeTag} active onRemove={() => setActiveTag(null)} />
        </div>
      )}

      {/* Featured Spotlight */}
      {spotlightVisible && featured && (
        <section aria-label="Featured launch">
          <FeaturedSpotlight
            startup={featured}
            upvote={{
              ...getUpvote(featured.id, featured.upvotes_count),
              onToggle: () => toggleUpvote(featured.id),
            }}
          />
        </section>
      )}

      {/* Launch Feed List */}
      <section aria-label="Today's launches" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#CDD1D6] pb-4">
          <div className="flex items-baseline gap-3">
            <h2 className="font-archivo text-[clamp(1.75rem,4vw,3rem)] font-medium tracking-[-0.04em] text-[#17181B] flex items-center gap-2">
              <Flame className="h-4 w-4 text-[#FF4B3E]" weight="fill" /> Latest Community Launches
            </h2>
            <span className="text-caption text-[#666A73] font-mono">
              <time dateTime={batchDateIso}>{batchDate}</time> · {countOf(feed.length, "venture")}{hasFilters && " filtered"}
            </span>
          </div>

          {/* Real Sort Dropdown */}
          <div className="flex items-center gap-2 font-mono text-tiny">
            <span className="text-[#666A73] uppercase">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "popular" | "newest" | "waitlist")}
              className="rounded-[8px] border border-[#DADDE1] bg-[#F2F3F5] px-3 py-1.5 text-caption font-semibold text-[#17181B] focus:outline-none focus:ring-1 focus:ring-[#FF4B3E]"
            >
              <option value="popular">Top Upvoted</option>
              <option value="newest">Chronological</option>
              <option value="waitlist">Most Waitlisted</option>
            </select>
          </div>
        </div>

        {feed.length > 0 ? (
          <div className="space-y-3">
            {feed.map((startup, index) => (
              <StartupCard
                key={startup.id}
                startup={startup}
                rank={index + 1}
                activeTagSlug={activeTag?.slug ?? null}
                onSelectTag={handleTagSelect}
                upvote={{
                  ...getUpvote(startup.id, startup.upvotes_count),
                  onToggle: () => toggleUpvote(startup.id),
                }}
              />
            ))}
          </div>
        ) : startups.length === 0 ? (
          // Genuinely no launches yet — don't blame the visitor's filters.
          <EmptyState
            icon={RocketLaunch}
            title="The first launches land soon"
            description="WeFounders opens with a curated batch. Be in it — submit your beta and we'll get it in front of early adopters worldwide."
            action={{ label: "Submit your startup", href: "/submit" }}
          />
        ) : (
          <EmptyState
            icon={MagnifyingGlass}
            title="No ventures match your filters"
            description="Modify your search keywords or clear your category selection."
            action={{ label: "Clear all filters", onClick: clearFilters }}
          />
        )}
      </section>
    </div>
  );
}

