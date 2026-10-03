import { Clock, Rocket, ThumbsUp, Users } from "lucide-react";
import { OverviewActions } from "@/components/admin/overview-actions";
import { getSiteStats } from "@/lib/data/siteStats";
import { sql } from "@/lib/db/neon";

function utcDayRange() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  return { start: start.toISOString(), end: new Date(start.valueOf() + 86_400_000).toISOString() };
}

export default async function AdminOverviewPage() {
  const { start, end } = utcDayRange();

  const [siteStats, pendingRows, todayRows] = await Promise.all([
    getSiteStats(),
    sql`
      select count(*)::int as total from startups
      where status in ('pending_approval', 'draft')
    `,
    sql`
      select count(*)::int as total from startups
      where status = 'approved' and launch_date >= ${start} and launch_date < ${end}
    `,
  ]);

  const pendingCount = (pendingRows[0] as { total?: number } | undefined)?.total ?? 0;
  const todayCount = (todayRows[0] as { total?: number } | undefined)?.total ?? 0;

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
