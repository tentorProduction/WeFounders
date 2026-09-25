import Link from "next/link";
import { 
  LayoutDashboard, 
  Inbox, 
  Rocket, 
  Target, 
  Handshake, 
  Settings 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getServerSupabase } from "@/lib/supabase/server";

export async function AdminSidebar() {
  const supabase = await getServerSupabase();
  const { count: pendingCount } = await supabase
    .from("startups")
    .select("id", { count: "exact", head: true })
    .in("status", ["pending_approval", "draft"]); // or just pending_approval

  return (
    <aside className="w-64 border-r border-[#E4E4E7] bg-[#FAFAFA] hidden md:flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-[#E4E4E7]">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#DC2626] text-[#FAFAFA]">
            <Rocket className="h-5 w-5" />
          </div>
          <span className="font-archivo font-bold text-[#18181B] text-lg">Admin Panel</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <Link href="/admin" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-[#71717A] hover:bg-[#FFFFFF] hover:text-[#18181B] transition-colors">
          <LayoutDashboard className="h-4 w-4" />
          Overview
        </Link>
        <Link href="/admin/submissions" className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-[#71717A] hover:bg-[#FFFFFF] hover:text-[#18181B] transition-colors">
          <div className="flex items-center gap-3">
            <Inbox className="h-4 w-4" />
            Submissions
          </div>
          {pendingCount ? (
            <Badge variant="outline" className="border-[#DC2626]/30 text-[#DC2626] bg-[#DC2626]/10 px-1.5 min-w-[20px] text-center">
              {pendingCount}
            </Badge>
          ) : null}
        </Link>
        <Link href="/admin/startups" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-[#71717A] hover:bg-[#FFFFFF] hover:text-[#18181B] transition-colors">
          <Rocket className="h-4 w-4" />
          Live Startups
        </Link>
        <Link href="/admin/quests" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-[#71717A] hover:bg-[#FFFFFF] hover:text-[#18181B] transition-colors">
          <Target className="h-4 w-4" />
          Quests &amp; Bounties
        </Link>
        <Link href="/admin/collab" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-[#71717A] hover:bg-[#FFFFFF] hover:text-[#18181B] transition-colors">
          <Handshake className="h-4 w-4" />
          Collab &amp; Gigs
        </Link>
        <Link href="/admin/settings" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-[#71717A] hover:bg-[#FFFFFF] hover:text-[#18181B] transition-colors">
          <Settings className="h-4 w-4" />
          Platform Settings
        </Link>
      </nav>
    </aside>
  );
}
