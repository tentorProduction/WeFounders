import { getServerSupabase } from "@/lib/supabase/server";
import { getSiteStats } from "@/lib/data/siteStats";
import { 
  Rocket, 
  Users, 
  ThumbsUp, 
  Clock, 
  CheckCircle2, 
  Plus 
} from "lucide-react";
import Link from "next/link";

export default async function AdminOverviewPage() {
  const supabase = await getServerSupabase();
  const siteStats = await getSiteStats();

  const { count: pendingCount } = await supabase
    .from("startups")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending_approval");

  const { count: todayCount } = await supabase
    .from("startups")
    .select("id", { count: "exact", head: true })
    .eq("status", "approved")
    .gte("launch_date", new Date().toISOString().split("T")[0]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-[#18181B]">Admin Overview</h1>
        <p className="text-[#71717A] mt-1 text-sm">Platform metrics and quick actions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="godly-card bg-[#FFFFFF] border border-[#E4E4E7] rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#71717A]">Pending Submissions</span>
            <Clock className="h-5 w-5 text-[#DC2626]" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-black text-[#18181B]">{pendingCount || 0}</span>
          </div>
        </div>

        <div className="godly-card bg-[#FFFFFF] border border-[#E4E4E7] rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#71717A]">Today&apos;s Launches</span>
            <Rocket className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-black text-[#18181B]">{todayCount || 0}</span>
          </div>
        </div>

        <div className="godly-card bg-[#FFFFFF] border border-[#E4E4E7] rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#71717A]">Total Waitlisted</span>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-black text-[#18181B]">{siteStats.waitlistedTesters}</span>
          </div>
        </div>

        <div className="godly-card bg-[#FFFFFF] border border-[#E4E4E7] rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#71717A]">Total Upvotes</span>
            <ThumbsUp className="h-5 w-5 text-[#DC2626]" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-black text-[#18181B]">{siteStats.totalUpvotes}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="godly-card bg-[#FFFFFF] border border-[#E4E4E7] rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-[#18181B]">Quick Actions</h3>
          <div className="grid gap-3">
            <Link href="/admin/submissions" className="flex items-center justify-between rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] p-4 hover:border-[#DC2626]/50 transition-colors">
              <div className="flex items-center gap-3 text-[#18181B]">
                <CheckCircle2 className="h-5 w-5 text-[#DC2626]" />
                <span className="font-medium">Review Submissions Queue</span>
              </div>
            </Link>
            <div className="flex items-center justify-between rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] p-4 opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-3 text-[#18181B]">
                <Plus className="h-5 w-5 text-[#71717A]" />
                <span className="font-medium">Manual Startup Entry (Coming Soon)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
