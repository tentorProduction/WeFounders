import { sql } from "@/lib/db/neon";
import { AdminSidebarFrame } from "@/components/admin/sidebar-frame";

export async function AdminSidebar() {
  const rows = (await sql`
    select count(*)::int as total from startups
    where status in ('pending_approval', 'draft')
  `) as { total: number }[];

  return <AdminSidebarFrame pendingCount={rows[0]?.total ?? 0} />;
}
