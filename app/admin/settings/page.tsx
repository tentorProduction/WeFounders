import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function status(configured: boolean) {
  return configured ? "Configured" : "Missing";
}

export default async function AdminSettingsPage() {
  const supabase = createAdminClient();
  const [profiles, startups, quests, reports] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("startups").select("id", { count: "exact", head: true }),
    supabase.from("testing_quests").select("id", { count: "exact", head: true }),
    supabase.from("quest_submissions").select("id", { count: "exact", head: true }),
  ]);
  const queryError = [profiles, startups, quests, reports].find((result) => result.error)?.error;
  const services = [
    ["Supabase URL", Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)],
    ["Supabase public key", Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)],
    ["Supabase service key", Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)],
    ["Session signing secret", Boolean(process.env.SESSION_SECRET)],
    ["Firebase sign-in", Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)],
    ["Google Analytics consent", Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)],
    ["Transactional email", Boolean(process.env.RESEND_API_KEY)],
  ] as const;

  return <div className="space-y-6">
    <header><h1 className="text-2xl font-semibold tracking-tight text-[#F4F4F5] sm:text-3xl">Platform Settings</h1><p className="mt-1 text-sm text-[#A1A1AA]">Read-only service status and platform data checks. Secret values are never displayed.</p></header>
    {queryError && <p role="alert" className="rounded-lg border border-rose-900/70 bg-rose-950/20 p-3 text-sm text-rose-200">Could not read platform totals: {queryError.message}</p>}
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
      ["Profiles", profiles.count], ["Startups", startups.count], ["Quests", quests.count], ["Tester reports", reports.count],
    ].map(([label, count]) => <div key={label} className="rounded-xl border border-[#27272A] bg-[#121215] p-4"><p className="text-sm text-[#A1A1AA]">{label}</p><p className="mt-2 text-2xl font-semibold tabular-nums text-[#F4F4F5]">{count ?? "—"}</p></div>)}</section>
    <section className="rounded-xl border border-[#27272A] bg-[#121215] p-4 sm:p-5"><h2 className="font-semibold text-[#F4F4F5]">Service configuration</h2><ul className="mt-3 divide-y divide-[#27272A]">{services.map(([name, ready]) => <li key={name} className="flex min-h-12 items-center justify-between gap-3 text-sm"><span className="text-[#D4D4D8]">{name}</span><span className={`rounded-full px-2.5 py-1 text-xs ${ready ? "bg-emerald-950/50 text-emerald-300" : "bg-amber-950/50 text-amber-200"}`}>{status(ready)}</span></li>)}</ul><p className="mt-3 text-xs text-[#666A73]">To change environment variables, update your deployment environment and redeploy. This page cannot reveal or edit secret keys.</p></section>
  </div>;
}
