import { isDatabaseConfigured, sql } from "@/lib/db/neon";
import "server-only";

export const dynamic = "force-dynamic";

function status(configured: boolean) {
  return configured ? "Configured" : "Missing";
}

type CountTable = "profiles" | "startups" | "testing_quests" | "quest_submissions";

/**
 * Postgres cannot bind a table name as a parameter, so the four reads are
 * written out by hand rather than looped over a name from the database.
 */
async function countRows(table: CountTable): Promise<number | null> {
  const rows =
    table === "profiles"
      ? await sql`select count(*)::int as total from profiles`
      : table === "startups"
        ? await sql`select count(*)::int as total from startups`
        : table === "testing_quests"
          ? await sql`select count(*)::int as total from testing_quests`
          : await sql`select count(*)::int as total from quest_submissions`;
  return (rows[0] as { total?: number } | undefined)?.total ?? null;
}

export default async function AdminSettingsPage() {
  const configured = isDatabaseConfigured();
  const services = [
    ["Database (Neon)", configured],
    ["Clerk publishable key", Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)],
    ["Clerk secret key", Boolean(process.env.CLERK_SECRET_KEY)],
    ["Session signing secret", Boolean(process.env.SESSION_SECRET)],
    ["Google Analytics consent", Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)],
    ["Transactional email", Boolean(process.env.RESEND_API_KEY)],
  ] as const;

  const totals: [string, CountTable][] = [
    ["Profiles", "profiles"],
    ["Startups", "startups"],
    ["Quests", "testing_quests"],
    ["Tester reports", "quest_submissions"],
  ];

  let counts: (number | null)[] = totals.map(() => null);
  let queryError: string | null = configured ? null : "DATABASE_URL is not set, so platform totals cannot be read.";
  if (configured) {
    try {
      counts = await Promise.all(totals.map(([, table]) => countRows(table)));
    } catch (error) {
      queryError = error instanceof Error ? error.message : "Could not read platform totals.";
    }
  }

  return <div className="space-y-6">
    <header><h1 className="text-2xl font-semibold tracking-tight text-[#F4F4F5] sm:text-3xl">Platform Settings</h1><p className="mt-1 text-sm text-[#A1A1AA]">Read-only service status and platform data checks. Secret values are never displayed.</p></header>
    {queryError && <p role="alert" className="rounded-lg border border-rose-900/70 bg-rose-950/20 p-3 text-sm text-rose-200">Could not read platform totals: {queryError}</p>}
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{totals.map(([label], index) => <div key={label} className="rounded-xl border border-[#27272A] bg-[#121215] p-4"><p className="text-sm text-[#A1A1AA]">{label}</p><p className="mt-2 text-2xl font-semibold tabular-nums text-[#F4F4F5]">{counts[index] ?? "—"}</p></div>)}</section>
    <section className="rounded-xl border border-[#27272A] bg-[#121215] p-4 sm:p-5"><h2 className="font-semibold text-[#F4F4F5]">Service configuration</h2><ul className="mt-3 divide-y divide-[#27272A]">{services.map(([name, ready]) => <li key={name} className="flex min-h-12 items-center justify-between gap-3 text-sm"><span className="text-[#D4D4D8]">{name}</span><span className={`rounded-full px-2.5 py-1 text-xs ${ready ? "bg-emerald-950/50 text-emerald-300" : "bg-amber-950/50 text-amber-200"}`}>{status(ready)}</span></li>)}</ul><p className="mt-3 text-xs text-[#666A73]">To change environment variables, update your deployment environment and redeploy. This page cannot reveal or edit secret keys.</p></section>
  </div>;
}
