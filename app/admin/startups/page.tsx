import { raw, sql } from "@/lib/db/neon";
import { LiveStartupsClient } from "./client";
import type { Tag } from "@/types/database";
import type { AdminStartup } from "../types";

export const dynamic = "force-dynamic";

/** Approved launches with their tags and founder contact, in one round trip. */
const ADMIN_STARTUPS_SELECT = `
  select
    s.*,
    coalesce(
      (
        select json_agg(json_build_object(
          'id', t.id, 'name', t.name, 'slug', t.slug, 'category', t.category
        ) order by t.name)
        from startup_tags st
        join tags t on t.id = st.tag_id
        where st.startup_id = s.id
      ),
      '[]'::json
    ) as tags,
    json_build_object(
      'email', p.email, 'full_name', p.full_name
    ) as profiles
  from startups s
  left join profiles p on p.id = s.founder_id
`;

function errorPanel(message: string) {
  return (
    <div role="alert" className="rounded-lg border border-rose-900 bg-rose-950/30 p-4 text-rose-200">
      {message}
    </div>
  );
}

export default async function AdminStartupsPage() {
  try {
    const [rows, tagRows] = await Promise.all([
      sql`
        ${raw(ADMIN_STARTUPS_SELECT)}
        where s.status = 'approved'
        order by s.upvotes_count desc
      `,
      sql`
        select id, name, slug, coalesce(category, 'industry') as category
        from tags
        order by name asc
      `,
    ]);

    const startups = rows as unknown as AdminStartup[];
    const availableTags = tagRows as unknown as Tag[];

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#F4F4F5] sm:text-3xl">Live startups</h1>
          <p className="mt-1 text-sm text-[#A1A1AA]">Manage approved projects, tags, and activity.</p>
        </div>

        <LiveStartupsClient startups={startups} availableTags={availableTags} />
      </div>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorPanel(`Error loading startups: ${message}`);
  }
}