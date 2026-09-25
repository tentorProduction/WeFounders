import type { QuestWithStartup } from "@/types/database";
import { getServerSupabase } from "@/lib/supabase/server";
import { reportReadFailure } from "@/lib/data/read-failure";

/**
 * Testing-quest reads (TRD §2 tables 8–9). Supabase is the only source — the
 * board is empty until a founder posts a quest for an approved startup.
 */

const QUEST_SELECT = `
  id, startup_id, title, task_instructions, target_devices, reward_description,
  max_submissions, submissions_count, status, created_at, updated_at,
  startup:startups ( id, name, slug, logo_url )
`;

/**
 * PostgREST returns an embedded to-one relation as an object, but supabase-js
 * types it as an array without generated database types. Normalise both.
 */
function toQuest(row: unknown): QuestWithStartup {
  const record = (row ?? {}) as Record<string, unknown>;
  const embedded = record.startup;
  const startup = Array.isArray(embedded) ? embedded[0] : embedded;

  return {
    ...(record as unknown as QuestWithStartup),
    startup: (startup ?? null) as QuestWithStartup["startup"],
  };
}

/** All quests for the board — paused ones included so counts stay honest. */
export async function getQuestBoard(): Promise<QuestWithStartup[]> {
  try {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase
      .from("testing_quests")
      .select(QUEST_SELECT)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map((row) => toQuest(row));
  } catch (error) {
    reportReadFailure("getQuestBoard", error);
    return [];
  }
}

export async function getQuestById(questId: string): Promise<QuestWithStartup | null> {
  if (!questId) return null;

  try {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase
      .from("testing_quests")
      .select(QUEST_SELECT)
      .eq("id", questId)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data ? toQuest(data) : null;
  } catch (error) {
    reportReadFailure("getQuestById", error);
    return null;
  }
}
