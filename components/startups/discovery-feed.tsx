"use client";

import { useMemo, useState } from "react";
import { Search, X, ChevronDown, Rocket, Calendar, Flame, Trophy } from "lucide-react";

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
  { key: "all", label: "🔥 All Launches" },
  { key: "nepal_domestic", label: "🇳🇵 Made for Nepal" },
  { key: "global_export", label: "🌍 Built for World" },
  { key: "ai", label: "🤖 AI & ML" },
  { key: "fintech", label: "💳 Fintech & eSewa" },
  { key: "saas", label: "⚡ SaaS & DevTools" },
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
  /** Pre-formatted on the server to avoid hydration mismatch. */
  batchDate: string;
}

export function DiscoveryFeed({
  startups,
  featured = null,
  batchDate,
}: DiscoveryFeedProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FeedFilter>("all");
  const [activeTag, setActiveTag] = useState<TagPillTag | null>(null);
  const [sortBy, setSortBy] = useState<"popular" | "newest">("popular");
  const { getUpvote, toggleUpvote } = useOptimisticUpvotes();

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
    const list = results.filter((startup) => startup.id !== featured?.id);
    if (sortBy === "popular") {
      return [...list].sort((a, b) => b.upvotes_count - a.upvotes_count);
    }
    return list;
  }, [results, featured, sortBy]);

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
      {/* Microlaunch.net Inspired Hero Section */}
      <section className="relative rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-apple-md overflow-hidden text-center godly-bg-glow">
        <div className="absolute -top-12 -left-12 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-tiny font-semibold text-purple-600 dark:text-purple-400">
            <Trophy className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            <span>Nepal&apos;s #1 Tech Launch &amp; Beta Platform</span>
          </div>

          {/* Main Title */}
          <h1 className="mx-auto max-w-3xl text-display font-black tracking-tight text-foreground sm:text-display">
            The Launch Platform for <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-500 bg-clip-text text-transparent">World-Class Startups</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-xl text-body text-muted-foreground leading-relaxed">
            Discover, test, upvote, and support next-generation products built by founders in Nepal and for the world.
          </p>

          {/* Stats Ticker Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-tiny font-medium text-muted-foreground">
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1 shadow-apple-xs">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>{batchDate} Batch</span>
            </div>

            <div className="flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1 shadow-apple-xs">
              <Rocket className="h-3.5 w-3.5 text-purple-500" />
              <span>{startups.length} Products Launched</span>
            </div>

            <div className="flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1 shadow-apple-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>1,850+ Daily Builders</span>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="relative mx-auto mt-6 max-w-xl">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search startups, founders, eSewa, Next.js, AI…"
              aria-label="Search startups"
              className="h-12 w-full rounded-2xl border border-input bg-background pl-11 pr-10 text-body font-medium shadow-apple-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
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
        aria-label="Filter startups"
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
                "press-scale inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-2xl border px-4 text-caption font-semibold transition-all",
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-apple-xs font-bold"
                  : "border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {activeTag && (
        <div className="flex items-center justify-center gap-2">
          <span className="text-caption text-muted-foreground font-medium">
            Active Tag Filter:
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
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-baseline gap-3">
            <h2 className="text-heading font-bold text-foreground flex items-center gap-2">
              <Flame className="h-4 w-4 text-accent fill-accent" /> Today&apos;s Launches
            </h2>
            <span className="text-caption text-muted-foreground font-mono">
              {batchDate} · {feed.length} {feed.length === 1 ? "startup" : "startups"}{hasFilters && " matched"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-caption text-muted-foreground font-medium">Sort:</span>
            <button
              type="button"
              onClick={() => setSortBy(sortBy === "popular" ? "newest" : "popular")}
              className="inline-flex items-center gap-1 text-caption font-semibold text-foreground hover:text-primary focus:outline-none"
            >
              {sortBy === "popular" ? "🔥 Most Upvoted" : "⚡ Newest First"}
              <ChevronDown className="h-3.5 w-3.5" aria-hidden />
            </button>
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
        ) : (
          <div className="godly-card p-12 text-center border-dashed">
            <p className="text-subheading font-bold text-foreground">
              No startups match your search criteria
            </p>
            <p className="mt-1 text-body text-muted-foreground">
              Try a different keyword or clear your active filters.
            </p>
            <Button
              className="mt-4"
              size="sm"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
