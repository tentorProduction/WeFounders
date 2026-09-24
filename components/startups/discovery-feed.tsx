"use client";

import { useMemo, useState } from "react";
import { Search, X, ChevronDown } from "lucide-react";

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
  { key: "all", label: "All" },
  { key: "nepal_domestic", label: "Made for Nepal" },
  { key: "global_export", label: "Built for World" },
  { key: "ai", label: "AI" },
  { key: "fintech", label: "Fintech" },
  { key: "saas", label: "SaaS" },
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
      {/* Hero Section (Section 9 Spec) */}
      <section className="text-center py-4 sm:py-6">
        <h1 className="mx-auto max-w-[760px] text-display font-extrabold tracking-tight text-foreground sm:text-display">
          Discover the Next Big Things<br className="hidden sm:inline" />{" "}
          <span className="text-accent">Built in Nepal &amp; for the World</span>
        </h1>
        <p className="mx-auto mt-3 max-w-[640px] text-body text-text-secondary leading-relaxed">
          Nepal&apos;s startup launchpad — discover, test, vote, and support products built by founders in Nepal and beyond.
        </p>

        {/* Product Discovery Search (Section 10 Spec) */}
        <div className="relative mx-auto mt-6 max-w-lg">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search startups, founders, technologies…"
            aria-label="Search startups"
            className="h-11 w-full rounded-xl border border-border bg-card pl-11 pr-10 text-body shadow-sm transition-all placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1 text-text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>

        {/* Filter Bar (Section 11 Spec) */}
        <div
          role="group"
          aria-label="Filter startups"
          className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                  "press-scale inline-flex h-8 shrink-0 cursor-pointer items-center justify-center rounded-full border px-3.5 text-meta font-medium transition-all",
                  active
                    ? "border-accent bg-accent text-white shadow-sm font-semibold"
                    : "border-border bg-card text-foreground hover:border-border-strong hover:bg-surface-hover"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {activeTag && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="text-meta text-text-muted">
              Filter tag:
            </span>
            <TagPill tag={activeTag} active onRemove={() => setActiveTag(null)} />
          </div>
        )}
      </section>

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

      {/* Launch Feed (Section 15 Spec) */}
      <section aria-label="Today's launches" className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-baseline gap-3">
            <h2 className="text-heading font-bold text-foreground">Today&apos;s Launches</h2>
            <span className="text-meta text-text-muted font-mono">
              {batchDate} · {feed.length} {feed.length === 1 ? "startup" : "startups"}{hasFilters && " matched"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-meta text-text-muted">Sort:</span>
            <button
              type="button"
              onClick={() => setSortBy(sortBy === "popular" ? "newest" : "popular")}
              className="inline-flex items-center gap-1 text-meta font-medium text-foreground hover:text-accent focus:outline-none"
            >
              {sortBy === "popular" ? "Popular" : "Newest"}
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
          <div className="editorial-card p-10 text-center border-dashed">
            <p className="text-heading font-semibold text-foreground">
              No startups match your search
            </p>
            <p className="mt-1 text-body text-text-muted">
              Try a different keyword or clear your filters to see all launches.
            </p>
            <Button
              className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
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
