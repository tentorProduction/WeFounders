"use client";

import React, { useState, useMemo } from "react";
import { Search, SlidersHorizontal, Filter, X } from "lucide-react";
import { StartupCard } from "@/components/startups/startup-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STARTUP_FIXTURES } from "@/lib/fixtures/startups";
import { useOptimisticUpvotes } from "@/lib/hooks/use-optimistic-upvotes";
import type { StartupWithTags } from "@/types/database";

const CATEGORIES = [
  "All Categories",
  "Fintech",
  "AI / ML",
  "DevTools",
  "Agritech",
  "Climate",
  "Legaltech",
  "Logistics",
  "Retail",
];

const MARKETS = [
  { id: "all", label: "All Markets" },
  { id: "nepal_domestic", label: "Nepal Domestic" },
  { id: "global_export", label: "Global Export" },
];

const TECH_TAGS = [
  "Next.js",
  "AI/ML",
  "Fintech",
  "Flutter",
  "Firebase",
  "Supabase",
  "eSewa",
  "Khalti",
  "Fonepay",
  "Devanagari UI",
  "Offline First",
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedMarket, setSelectedMarket] = useState("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const { getUpvote, toggleUpvote } = useOptimisticUpvotes();

  const filteredStartups = useMemo(() => {
    return STARTUP_FIXTURES.filter((startup: StartupWithTags) => {
      // Query filter (name, tagline, description)
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesName = startup.name.toLowerCase().includes(q);
        const matchesTagline = startup.tagline.toLowerCase().includes(q);
        const matchesDesc = startup.description.toLowerCase().includes(q);
        const matchesTag = startup.tags.some((t) => t.name.toLowerCase().includes(q));
        if (!matchesName && !matchesTagline && !matchesDesc && !matchesTag) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== "All Categories") {
        const catLower = selectedCategory.toLowerCase();
        const hasCategory = startup.tags.some(
          (t) => t.name.toLowerCase().includes(catLower) || t.slug.includes(catLower)
        );
        if (!hasCategory && !startup.description.toLowerCase().includes(catLower)) {
          return false;
        }
      }

      // Market filter
      if (selectedMarket !== "all") {
        if (startup.target_market !== selectedMarket && startup.target_market !== "hybrid") {
          return false;
        }
      }

      // Tag filter
      if (selectedTag) {
        const tagLower = selectedTag.toLowerCase();
        const hasTag = startup.tags.some(
          (t) => t.name.toLowerCase() === tagLower || t.slug === tagLower
        );
        if (!hasTag) return false;
      }

      return true;
    });
  }, [query, selectedCategory, selectedMarket, selectedTag]);

  const hasActiveFilters =
    query.trim() !== "" ||
    selectedCategory !== "All Categories" ||
    selectedMarket !== "all" ||
    selectedTag !== null;

  const resetFilters = () => {
    setQuery("");
    setSelectedCategory("All Categories");
    setSelectedMarket("all");
    setSelectedTag(null);
  };

  return (
    <div className="site-container py-8 space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <div>
          <Badge variant="outline" className="mb-2 font-mono text-tiny">
            Discovery Search
          </Badge>
          <h1 className="text-display font-bold tracking-tight text-foreground">
            Search Startups &amp; Betas
          </h1>
          <p className="text-body text-muted-foreground mt-1">
            Explore {STARTUP_FIXTURES.length} products built in Nepal and for the world by category, tech stack, or keyword.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, pitch, technology (e.g., eSewa, Next.js, AI)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-2xl border border-input bg-card pl-12 pr-10 py-4 text-subheading text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring shadow-apple-sm transition-all"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-apple-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-caption font-semibold text-foreground">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <span>Filters</span>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-caption text-muted-foreground hover:text-foreground h-8 px-2"
            >
              <X className="h-3.5 w-3.5 mr-1" /> Clear all filters
            </Button>
          )}
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-xl px-3 py-1.5 text-caption font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-foreground text-background font-bold shadow-apple-xs"
                  : "bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Market & Tech Stack Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60">
          <div className="flex items-center gap-1.5">
            <span className="text-tiny font-medium text-muted-foreground mr-1">Market:</span>
            {MARKETS.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMarket(m.id)}
                className={`rounded-lg px-2.5 py-1 text-tiny font-medium transition-all ${
                  selectedMarket === m.id
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <span className="text-tiny font-medium text-muted-foreground mr-1">Tech Tag:</span>
            {TECH_TAGS.slice(0, 6).map((tag) => {
              const active = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(active ? null : tag)}
                  className={`rounded-lg px-2 py-0.5 text-tiny font-mono transition-all ${
                    active
                      ? "bg-accent text-accent-foreground font-bold"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-caption text-muted-foreground font-medium">
          Showing <span className="font-bold text-foreground">{filteredStartups.length}</span> results
          {hasActiveFilters && " matching criteria"}
        </p>
      </div>

      {/* Startup List */}
      {filteredStartups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground mb-3">
            <Filter className="h-6 w-6" />
          </div>
          <h3 className="text-subheading font-bold text-foreground">No startups found</h3>
          <p className="mt-1 text-body text-muted-foreground max-w-sm mx-auto">
            We couldn&apos;t find any startup matching your search filters. Try clearing your search query or changing filters.
          </p>
          <Button onClick={resetFilters} className="mt-4" variant="outline">
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStartups.map((startup: StartupWithTags, index: number) => (
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
      )}
    </div>
  );
}
