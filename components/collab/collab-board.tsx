"use client";

import { useState } from "react";
import { Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { countOf } from "@/lib/pluralize";
import type { CollabType } from "@/types/database";
import { CollabCard } from "@/components/collab/collab-card";
import type { CollabPostWithAuthor } from "@/lib/data/collab";
import { EmptyState } from "@/components/ui/empty-state";
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

  // With nothing posted, six filter chips and a "0 listings" grid read as a
  // broken board — lead with the empty state instead.
  if (posts.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No opportunities yet"
        description="Be the first founder to post one."
        hint="Share a role, a gig, or a call for your first hundred beta testers."
        actionSlot={<PostOpportunityModal />}
      />
    );
  }

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

      <p className="font-mono text-caption text-muted-foreground">
        Showing {countOf(visible.length, "listing")}
      </p>

      {visible.length === 0 ? (
        <EmptyState
          compact
          icon={Users}
          title="Nothing in this category"
          description="There are no listings with this role right now."
          action={{ label: "Show all listings", onClick: () => setFilter("all") }}
        />
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