import { raw, sql } from "@/lib/db/neon";
import { SubmissionsClient } from "./client";
import type { AdminStartup } from "../types";

/** Every submission regardless of status, newest first. */
const ADMIN_SUBMISSIONS_SELECT = `
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

export default async function SubmissionsPage() {
  try {
    const rows = await sql`
      ${raw(ADMIN_SUBMISSIONS_SELECT)}
      order by s.created_at desc
    `;

    const startups = rows as unknown as AdminStartup[];

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#F4F4F5] sm:text-3xl">Submissions queue</h1>
          <p className="mt-1 text-sm text-[#A1A1AA]">Review, schedule, and approve founder submissions.</p>
        </div>

        <SubmissionsClient submissions={startups} />
      </div>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return (
      <div role="alert" className="rounded-lg border border-rose-900 bg-rose-950/30 p-4 text-rose-200">
        Error loading submissions: {message}
      </div>
    );
  }
}