import Link from "next/link";
import { Rocket } from "lucide-react";
import { getServerSupabase } from "@/lib/supabase/server";
import { AdminSidebarNav } from "@/components/admin/sidebar-nav";

export async function AdminSidebar() {
  const supabase = await getServerSupabase();
  const { count } = await supabase
    .from("startups")
    .select("id", { count: "exact", head: true })
    .in("status", ["pending_approval", "draft"]);

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[#E4E4E7] bg-[#FAFAFA] md:flex">
      <div className="border-b border-[#E4E4E7] p-5">
        <Link href="/admin" className="flex items-center gap-3 rounded-md">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#B91C1C] text-white">
            <Rocket aria-hidden className="h-[18px] w-[18px]" />
          </span>
          <span className="text-base font-semibold tracking-tight text-[#18181B]">Admin</span>
        </Link>
      </div>
      <AdminSidebarNav pendingCount={count ?? 0} />
    </aside>
  );
}
