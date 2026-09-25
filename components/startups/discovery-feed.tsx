"use client";

import { useMemo, useState } from "react";
import { Search, X, Rocket, Calendar, Flame, Award } from "lucide-react";

import { cn } from "@/lib/utils";
import type { StartupWithTags } from "@/types/database";
import { Button } from "@/components/ui/button";
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
}

const FILTERS: FilterOption[] = [
  { key: "all", label: "All Ventures" },
  { key: "nepal_domestic", label: "Made for Nepal 🇳🇵" },
  { key: "global_export", label: "Built for World 🌍" },
  { key: "ai", label: "AI & Intelligence" },
  { key: "fintech", label: "Fintech & Payments" },
  { key: "saas", label: "SaaS & Infrastructure" },
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
  siteStats: {
    verifiedLaunches: number;
    waitlistedTesters: number;
    totalUpvotes: number;
  };
}

export function DiscoveryFeed({
  startups,
  featured = null,
  batchDate,
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
      startups.filter(
        (startup) =>
          matchesFilter(startup, filter) &&
          matchesQuery(startup, query) &&
          (!activeTag || startup.tags.some((tag) => tag.slug === activeTag.slug))
      ),
    [startups, filter, query, activeTag]
  );

  const spotlightVisible =
    featured !== null &&
    matchesFilter(featured, filter) &&
    matchesQuery(featured, query) &&
    (!activeTag || featured.tags.some((tag) => tag.slug === activeTag.slug));

  const feed = useMemo(() => {
    // When a search query or filter is active, include all matching ventures in the feed (including featured)
    const hasSearchOrFilter = query.trim() !== "" || activeTag !== null || filter !== "all";
    const list = hasSearchOrFilter
      ? results
      : results.filter((startup) => startup.id !== featured?.id);

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
  }, [results, featured, sortBy, query, activeTag, filter]);

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
    <div className="space-y-8">
      {/* Spec-Compliant Hero Section */}
      <section className="relative rounded-[10px] border border-[#E4E4E7] bg-[#FFFFFF] p-8 sm:p-12 shadow-md text-center godly-bg-glow">
        <div className="relative z-10 space-y-5">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(220,38,38,0.18)] bg-[#FAFAFA] px-3.5 py-1 text-tiny font-mono font-bold uppercase tracking-widest text-[#DC2626]">
            <Award className="h-3.5 w-3.5 text-[#DC2626]" />
            <span>NEPAL&apos;S STARTUP LAUNCH PLATFORM</span>
          </div>

          {/* Archivo Display Headline */}
          <h1 className="mx-auto max-w-4xl text-display font-archivo font-bold tracking-tight text-[#18181B] sm:text-display">
            Launch your startup in front of <span className="text-[#DC2626]">Nepal&apos;s builders</span>
          </h1>

          {/* Subhead */}
          <p className="mx-auto max-w-2xl text-body text-[#71717A] leading-relaxed">
            Connecting early-stage founders with beta users, verified community traction, and proof-of-work engagement across Nepal and global export markets.
          </p>

          {/* Primary Gold Pill CTA + Secondary Outline CTA */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              asChild
              className="bg-[#DC2626] text-[#FAFAFA] hover:bg-[#B91C1C] font-archivo font-semibold rounded-[10px] px-6 py-5 shadow-sm transition-all hover:-translate-y-0.5"
            >
              <a href="/submit">Submit Your Startup</a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-[#E4E4E7] bg-[#FAFAFA] text-[#18181B] hover:bg-[#F4F4F5] font-archivo font-medium rounded-[10px] px-6 py-5"
            >
              <a href="/leaderboard">View Leaderboard</a>
            </Button>
          </div>

          {/* Real Verified Stats Ticker Bar (Stacked vertically on mobile, row on sm+) */}
          <div className="pt-3 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 sm:gap-3 text-tiny font-mono text-[#71717A]">
            <div className="flex items-center gap-1.5 rounded-[10px] border border-[#E4E4E7] bg-[#FAFAFA] px-3 py-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#DC2626]" />
              <span><time dateTime={new Date().toISOString()}>{batchDate}</time> Batch</span>
            </div>

            <div className="flex items-center gap-1.5 rounded-[10px] border border-[#E4E4E7] bg-[#FAFAFA] px-3 py-1.5">
              <Rocket className="h-3.5 w-3.5 text-[#DC2626]" />
              <span>{verifiedLaunches} Verified Launches</span>
            </div>

            <div className="flex items-center gap-1.5 rounded-[10px] border border-[#E4E4E7] bg-[#FAFAFA] px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DC2626] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DC2626]"></span>
              </span>
              <span>{waitlistedTesters} Waitlisted Testers</span>
            </div>

            <div className="flex items-center gap-1.5 rounded-[10px] border border-[#E4E4E7] bg-[#FAFAFA] px-3 py-1.5">
              <span>▲ {totalUpvotes} Upvotes</span>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="relative mx-auto mt-4 max-w-xl">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717A]"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search ventures, technologies, eSewa, AI copilots…"
              aria-label="Search ventures"
              className="h-11 w-full rounded-[10px] border border-[#E4E4E7] bg-[#FAFAFA] pl-11 pr-10 text-body font-medium shadow-sm transition-all text-[#18181B] placeholder:text-[#71717A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1 text-[#71717A] transition-colors hover:bg-[#F4F4F5] hover:text-[#18181B]"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Filter Tabs Bar */}
      <div
        role="group"
        aria-label="Filter ventures"
        className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {FILTERS.map(({ key, label }) => {
          const active = filter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              aria-pressed={active}
              className={cn(
                "press-scale inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border px-4 text-caption font-semibold transition-all",
                active
                  ? "border-[#DC2626] bg-[#DC2626] text-[#FAFAFA] font-archivo font-bold shadow-sm"
                  : "border-[#E4E4E7] bg-[#FFFFFF] text-[#71717A] hover:border-[rgba(220,38,38,0.2)] hover:text-[#18181B]"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {activeTag && (
        <div className="flex items-center justify-center gap-2">
          <span className="text-caption text-[#71717A] font-mono">
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
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#E4E4E7] pb-3">
          <div className="flex items-baseline gap-3">
            <h2 className="text-heading font-archivo font-bold text-[#18181B] flex items-center gap-2">
              <Flame className="h-4 w-4 text-[#DC2626]" /> Latest Community Launches
            </h2>
            <span className="text-caption text-[#71717A] font-mono">
              <time dateTime={new Date().toISOString()}>{batchDate}</time> · {feed.length} {feed.length === 1 ? "venture" : "ventures"}{hasFilters && " filtered"}
            </span>
          </div>

          {/* Real Sort Dropdown */}
          <div className="flex items-center gap-2 font-mono text-tiny">
            <span className="text-[#71717A] uppercase">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "popular" | "newest" | "waitlist")}
              className="rounded-[8px] border border-[#E4E4E7] bg-[#FAFAFA] px-3 py-1.5 text-caption font-semibold text-[#18181B] focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
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
          <div className="godly-card border-dashed border-[#E4E4E7] bg-[#FFFFFF] p-12 text-center">
            <Rocket className="mx-auto h-8 w-8 text-[#DC2626]" aria-hidden />
            <p className="mt-3 text-subheading font-bold text-[#18181B]">
              The first launches land soon
            </p>
            <p className="mx-auto mt-1 max-w-md text-body text-[#71717A]">
              WeFounders opens with a curated batch. Be in it — submit your beta
              and we&apos;ll get it in front of Nepal&apos;s builders.
            </p>
            <Button
              asChild
              className="mt-4 bg-[#DC2626] font-archivo font-semibold text-[#FAFAFA] hover:bg-[#B91C1C]"
              size="sm"
            >
              <a href="/submit">Submit your startup</a>
            </Button>
          </div>
        ) : (
          <div className="godly-card border-dashed border-[#E4E4E7] bg-[#FFFFFF] p-12 text-center">
            <p className="text-subheading font-bold text-[#18181B]">
              No ventures match your active search filter
            </p>
            <p className="mt-1 text-body text-[#71717A]">
              Modify your search keywords or clear your category selection.
            </p>
            <Button
              className="mt-4 bg-[#DC2626] font-archivo font-semibold text-[#FAFAFA] hover:bg-[#B91C1C]"
              size="sm"
              onClick={clearFilters}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
