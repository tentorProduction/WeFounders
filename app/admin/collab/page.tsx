import { AdminPlatformTools } from "@/components/admin/platform-tools";
import { raw, sql } from "@/lib/db/neon";
import { CollabModeration, type CollabAdminPost } from "./client";

export const dynamic = "force-dynamic";

const COLLAB_ADMIN_SELECT = `
  select
    p.id, p.title, p.role_type, p.description, p.equity_or_compensation,
    p.contact_channel, p.is_active, p.created_at,
    json_build_object('name', s.name, 'slug', s.slug) as startup,
    json_build_object('full_name', pr.full_name, 'email', pr.email) as author
  from collab_posts p
  left join startups s on s.id = p.startup_id
  left join profiles pr on pr.id = p.author_id
`;

export default async function AdminCollabPage() {
  try {
    const rows = await sql`
      ${raw(COLLAB_ADMIN_SELECT)}
      order by p.created_at desc
    `;
    return <><AdminPlatformTools section="collab-review"/><CollabModeration posts={rows as unknown as CollabAdminPost[]} /></>;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return <p role="alert" className="rounded-lg border border-rose-900/70 bg-rose-950/20 p-4 text-rose-200">Could not load collab listings: {message}</p>;
  }
}


