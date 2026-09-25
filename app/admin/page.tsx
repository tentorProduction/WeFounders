import { Clock, Rocket, ThumbsUp, Users } from "lucide-react";
import { OverviewActions } from "@/components/admin/overview-actions";
import { getSiteStats } from "@/lib/data/siteStats";
import { createAdminClient } from "@/lib/supabase/admin";

function nptDayRange() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kathmandu", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const start = new Date(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), -5, -45));
  return { start: start.toISOString(), end: new Date(start.valueOf() + 86_400_000).toISOString() };
}

export default async function AdminOverviewPage() {
  const supabase = createAdminClient();
  const [siteStats, pendingResult, todayResult] = await Promise.all([
    getSiteStats(),
    supabase.from("startups").select("id", { count: "exact", head: true }).in("status", ["pending_approval", "draft"]),
    (() => {
      const { start, end } = nptDayRange();
      return supabase.from("startups").select("id", { count: "exact", head: true }).eq("status", "approved").gte("launch_date", start).lt("launch_date", end);
    })(),
  ]);
  if (pendingResult.error) throw new Error(`Could not load pending submissions: ${pendingResult.error.message}`);
  if (todayResult.error) throw new Error(`Could not load today’s launches: ${todayResult.error.message}`);
  const pendingCount = pendingResult.count ?? 0;
  const todayCount = todayResult.count ?? 0;

  const metrics = [
    { label: "Pending Submissions", value: pendingCount, icon: Clock, iconClass: "text-[#FACC15]" },
    { label: "Today's Launches", value: todayCount, icon: Rocket, iconClass: "text-emerald-400" },
    { label: "Total Waitlisted", value: siteStats.waitlistedTesters, icon: Users, iconClass: "text-sky-400" },
    { label: "Total Upvotes", value: siteStats.totalUpvotes, icon: ThumbsUp, iconClass: "text-[#FACC15]" },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#A1A1AA]">WeFounders operations</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#F4F4F5] sm:text-3xl">Admin overview</h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">Launch activity and items that need review.</p>
      </div>

      <section aria-label="Platform metrics" className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, iconClass }) => (
          <article key={label} className="rounded-xl border border-[#27272A] bg-[#121215] p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-xs font-medium leading-snug text-[#A1A1AA] sm:text-sm">{label}</h2>
              <Icon aria-hidden className={`h-4 w-4 shrink-0 sm:h-5 sm:w-5 ${iconClass}`} />
            </div>
            <p className="mt-4 text-3xl font-semibold tabular-nums text-[#F4F4F5] sm:text-4xl">{value.toLocaleString()}</p>
          </article>
        ))}
      </section>

      <OverviewActions pendingCount={pendingCount} />
    </div>
  );
}
