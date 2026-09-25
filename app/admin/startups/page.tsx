import { createAdminClient } from "@/lib/supabase/admin";
import { LiveStartupsClient } from "./client";
import type { Tag } from "@/types/database";
import type { AdminStartup, AdminStartupRow } from "../types";

function toTags(joins: AdminStartupRow["startup_tags"]): Tag[] {
  if (!Array.isArray(joins)) return [];
  return joins
    .flatMap(({ tags }) => Array.isArray(tags) ? tags.slice(0, 1) : tags ? [tags] : [])
    .map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      category: tag.category,
    }));
}

export default async function AdminStartupsPage() {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from("startups")
    .select(`
      *,
      startup_tags ( tags ( id, name, slug, category ) ),
      profiles ( email, full_name )
    `)
    .eq("status", "approved")
    .order("upvotes_count", { ascending: false });

  if (error) {
    return <div role="alert" className="rounded-lg border border-rose-900 bg-rose-950/30 p-4 text-rose-200">Error loading startups: {error.message}</div>;
  }

  const { data: tags, error: tagsError } = await supabase.from("tags").select("id, name, slug, category").order("name");
  if (tagsError) return <div role="alert" className="rounded-lg border border-rose-900 bg-rose-950/30 p-4 text-rose-200">Error loading tags: {tagsError.message}</div>;

  const rows = (data || []) as unknown as AdminStartupRow[];
  const startups: AdminStartup[] = rows.map(({ startup_tags, ...startup }) => ({
    ...startup,
    tags: toTags(startup_tags),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#F4F4F5] sm:text-3xl">Live startups</h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">Manage approved projects, tags, and activity.</p>
      </div>
      
      <LiveStartupsClient startups={startups} availableTags={tags ?? []} />
    </div>
  );
}
