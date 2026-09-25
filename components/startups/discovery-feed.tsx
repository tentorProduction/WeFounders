"use client";

import { useMemo, useState } from "react";
import { Search, X, ChevronDown, Rocket, Calendar, Flame, Award } from "lucide-react";

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
      {/* Auralis Clean Paper Workflow — Hero Section */}
      <section className="relative rounded-lg border border-[#322A1F] bg-card p-8 sm:p-12 shadow-sm text-center godly-bg-glow">
        <div className="relative z-10 space-y-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#B98A45]/30 bg-[#322A1F]/60 px-3.5 py-1 text-tiny font-mono font-bold text-[#FFE8B8]">
            <Award className="h-3.5 w-3.5 text-[#B98A45]" />
            <span>Nepal Premier Startup Launch &amp; Discovery Hub</span>
          </div>

          {/* Main Title */}
          <h1 className="mx-auto max-w-3xl text-display font-medium tracking-tight text-foreground sm:text-display">
            Build and Launch <span className="text-[#B98A45]">High-Impact Tech Ventures</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-xl text-body text-muted-foreground leading-relaxed">
            Connecting early-stage founders with beta users, verified community traction, and proof-of-work engagement across Nepal and global markets.
          </p>

          {/* Stats Ticker Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-tiny font-mono text-muted-foreground">
            <div className="flex items-center gap-1.5 rounded-lg border border-[#322A1F] bg-background/80 px-3 py-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#B98A45]" />
              <span>{batchDate} Batch</span>
            </div>

            <div className="flex items-center gap-1.5 rounded-lg border border-[#322A1F] bg-background/80 px-3 py-1.5">
              <Rocket className="h-3.5 w-3.5 text-[#B98A45]" />
              <span>{startups.length} Verified Ventures</span>
            </div>

            <div className="flex items-center gap-1.5 rounded-lg border border-[#322A1F] bg-background/80 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B98A45] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B98A45]"></span>
              </span>
              <span>1,850+ Active Testers</span>
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
              placeholder="Search ventures, technologies, eSewa, AI copilots…"
              aria-label="Search ventures"
              className="h-12 w-full rounded-lg border border-[#322A1F] bg-background pl-11 pr-10 text-body font-medium shadow-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A45]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
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
                "press-scale inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border px-4 text-caption font-semibold transition-all",
                active
                  ? "border-[#B98A45] bg-[#B98A45] text-[#15171C] font-bold shadow-sm"
                  : "border-[#322A1F] bg-card text-muted-foreground hover:border-[#B98A45]/50 hover:text-foreground"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {activeTag && (
        <div className="flex items-center justify-center gap-2">
          <span className="text-caption text-muted-foreground font-mono">
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
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#322A1F] pb-3">
          <div className="flex items-baseline gap-3">
            <h2 className="text-heading font-bold text-foreground flex items-center gap-2">
              <Flame className="h-4 w-4 text-[#B98A45]" /> Curated Launch Feed
            </h2>
            <span className="text-caption text-muted-foreground font-mono">
              {batchDate} · {feed.length} {feed.length === 1 ? "venture" : "ventures"}{hasFilters && " filtered"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-caption text-muted-foreground font-mono">Sort By:</span>
            <button
              type="button"
              onClick={() => setSortBy(sortBy === "popular" ? "newest" : "popular")}
              className="inline-flex items-center gap-1 text-caption font-semibold text-foreground hover:text-[#B98A45] focus:outline-none"
            >
              {sortBy === "popular" ? "Highest Engagement" : "Chronological"}
              <ChevronDown className="h-3.5 w-3.5 text-[#B98A45]" />
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
              No ventures match your active search filter
            </p>
            <p className="mt-1 text-body text-muted-foreground">
              Modify your search keywords or clear your category selection.
            </p>
            <Button
              className="mt-4 bg-[#B98A45] text-[#15171C] font-bold"
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
