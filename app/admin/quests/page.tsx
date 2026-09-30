import { createAdminClient } from "@/lib/supabase/admin";
import type { QuestWithStartup } from "@/types/database";
import { AdminQuestsClient } from "./client";

export default async function AdminQuestsPage() {
  const supabase = createAdminClient();
  const [questResult, startupResult, reportResult] = await Promise.all([
    supabase.from("testing_quests").select("*, startup:startups(id, name, slug, logo_url)").order("created_at", { ascending: false }),
    supabase.from("startups").select("id, name, slug").eq("status", "approved").order("name"),
    supabase.from("quest_submissions").select("id, quest_id, tester_name, feedback_text, rating_ux, rating_speed, proof_screenshots, device_info, founder_feedback, status, created_at").order("created_at", { ascending: false }),
  ]);

  const error = questResult.error ?? startupResult.error ?? reportResult.error;
  if (error) return <p role="alert" className="rounded-lg border border-rose-900 bg-rose-950/30 p-4 text-rose-200">Could not load quest management data: {error.message}</p>;

  const quests = (questResult.data ?? []).flatMap((row) => {
    const record = row as unknown as Record<string, unknown>;
    const relation = Array.isArray(record.startup) ? record.startup[0] : record.startup;
    if (!relation || typeof relation !== "object") return [];
    return [{ ...record, startup: relation } as unknown as QuestWithStartup];
  });

  return <AdminQuestsClient quests={quests} startups={startupResult.data ?? []} reports={reportResult.data ?? []} />;
}
