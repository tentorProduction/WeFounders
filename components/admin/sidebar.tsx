import { createAdminClient } from "@/lib/supabase/admin";
import { AdminSidebarFrame } from "@/components/admin/sidebar-frame";

export async function AdminSidebar() {
  const supabase = createAdminClient();
  const { count } = await supabase
    .from("startups")
    .select("id", { count: "exact", head: true })
    .in("status", ["pending_approval", "draft"]);

  return <AdminSidebarFrame pendingCount={count ?? 0} />;
}
