import type { Metadata } from "next";
import { Users } from "lucide-react";

import { listCollabPosts } from "@/lib/collab/store";
import { CollabBoard } from "@/components/collab/collab-board";

export const metadata: Metadata = {
  title: "Collab & Co-founder Board",
  description:
    "Find a co-founder, a founding engineer, a designer, or your first hundred beta testers — from Nepal's builder community.",
};

export const dynamic = "force-dynamic";

/** Collab & Co-founder Board (PRD §4.1 Should-Have, DESIGN.md §4.5). */
export default async function CollabPage() {
  const posts = await listCollabPosts();
  const activeCount = posts.filter((post) => post.is_active).length;

  return (
    <div className="site-container py-8 space-y-8">
      <header className="mb-6">
        <p className="flex items-center gap-2 text-caption font-medium uppercase tracking-wide text-primary">
          <Users className="h-4 w-4" aria-hidden />
          Community
        </p>
        <h1 className="mt-1 text-display font-bold tracking-tight">
          Collab &amp; Co-founder Board
        </h1>
        <p className="mt-1 max-w-xl text-body text-muted-foreground">
          Equity roles, paid gigs, and first-users calls from builders across
          Nepal. Contacts stay hidden until you choose to reveal them.
        </p>
        <p className="mt-2 text-caption text-muted-foreground">
          <span className="font-semibold tabular-nums text-foreground">
            {activeCount}
          </span>{" "}
          active listings ·{" "}
          <span className="font-semibold tabular-nums text-foreground">
            {posts.length}
          </span>{" "}
          total
        </p>
      </header>

      <CollabBoard posts={posts} />
    </div>
  );
}
