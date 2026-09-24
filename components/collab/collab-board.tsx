"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import type { CollabType } from "@/types/database";
import { CollabCard } from "@/components/collab/collab-card";
import type { CollabPostWithAuthor } from "@/lib/fixtures/collab";
import { PostOpportunityModal } from "@/components/collab/post-opportunity-modal";

const ROLE_FILTERS: { value: CollabType | "all"; label: string }[] = [
  { value: "all", label: "All listings" },
  { value: "cofounder", label: "Looking for Co-founder" },
  { value: "founding_engineer", label: "Founding Engineer" },
  { value: "designer", label: "UI/UX Designer" },
  { value: "beta_tester", label: "Beta Testers" },
  { value: "intern", label: "Internship" },
];

/** Role-filtered collab board (DESIGN.md §4.5). */
export function CollabBoard({ posts }: { posts: CollabPostWithAuthor[] }) {
  const [filter, setFilter] = useState<CollabType | "all">("all");

  const visible =
    filter === "all"
      ? posts
      : posts.filter((post) => post.role_type === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {ROLE_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            aria-pressed={filter === value}
            className={cn(
              "rounded-full border px-3 py-1.5 text-caption font-medium transition-colors",
              filter === value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto">
          <PostOpportunityModal />
        </span>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-body text-muted-foreground">
          No listings in this category yet — be the first to post one.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((post) => (
            <CollabCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
