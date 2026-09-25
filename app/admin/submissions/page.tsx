import { getServerSupabase } from "@/lib/supabase/server";
import { SubmissionsClient } from "./client";
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

export default async function SubmissionsPage() {
  const supabase = await getServerSupabase();
  
  const { data, error } = await supabase
    .from("startups")
    .select(`
      *,
      startup_tags ( tags ( id, name, slug, category ) ),
      profiles ( email, full_name )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="text-red-500">Error loading submissions: {error.message}</div>;
  }

  const rows = (data || []) as unknown as AdminStartupRow[];
  const startups: AdminStartup[] = rows.map(({ startup_tags, ...startup }) => ({
    ...startup,
    tags: toTags(startup_tags),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-[#18181B]">Submissions Queue</h1>
        <p className="text-[#71717A] mt-1 text-sm">Review, schedule, and approve new startups.</p>
      </div>
      
      <SubmissionsClient submissions={startups} />
    </div>
  );
}
