import type { QuestWithStartup } from "@/types/database";

import { appendToCollection, readCollection } from "@/lib/demo-store";
import { isSupabaseConfigured } from "@/lib/supabase/environment";

/**
 * Testing-quest store (TRD §2 tables 8–9).
 *
 * Quest definitions are fixtures until the schema lands; submissions are
 * written to Supabase `quest_submissions` when configured, else to the local
 * demo store. Counts on the board reconcile from both sources.
 */

const COLLECTION = "quest-submissions";

export interface QuestSubmissionInput {
  questId: string;
  testerId: string | null;
  testerName: string;
  feedbackText: string;
  ratingUx: number; // 1–5
  ratingSpeed: number; // 1–5
  /** Screenshot file names captured client-side until Storage is wired. */
  proofScreenshots: string[];
  deviceInfo: Record<string, unknown> | null;
}

export interface StoredQuestSubmission {
  id: string;
  quest_id: string;
  tester_id: string | null;
  tester_name: string;
  feedback_text: string;
  rating_ux: number;
  rating_speed: number;
  proof_screenshots: string[];
  device_info: Record<string, unknown> | null;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

export async function addQuestSubmission(
  input: QuestSubmissionInput
): Promise<StoredQuestSubmission> {
  const record: StoredQuestSubmission = {
    id: `qs-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    quest_id: input.questId,
    tester_id: input.testerId,
    tester_name: input.testerName,
    feedback_text: input.feedbackText,
    rating_ux: input.ratingUx,
    rating_speed: input.ratingSpeed,
    proof_screenshots: input.proofScreenshots,
    device_info: input.deviceInfo,
    status: "pending",
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("quest_submissions")
        .insert({
          quest_id: record.quest_id,
          tester_id: record.tester_id,
          feedback_text: record.feedback_text,
          rating_ux: record.rating_ux,
          rating_speed: record.rating_speed,
          proof_screenshots: record.proof_screenshots,
          device_info: record.device_info,
          status: "pending",
        })
        .select()
        .single();

      if (!error && data) {
        return { ...record, ...(data as Partial<StoredQuestSubmission>) } as StoredQuestSubmission;
      }
    } catch {
      // Fall through to the local store.
    }
  }

  await appendToCollection<StoredQuestSubmission>(COLLECTION, record);
  return record;
}

/** Locally captured submissions for one quest (fixture counts live on quests). */
export async function listQuestSubmissions(
  questId: string
): Promise<StoredQuestSubmission[]> {
  const rows = await readCollection<StoredQuestSubmission>(COLLECTION);
  return rows.filter((row) => row.quest_id === questId);
}

/** Extra submissions recorded locally on top of a quest's fixture count. */
export async function extraSubmissionCount(questId: string): Promise<number> {
  return (await listQuestSubmissions(questId)).length;
}

/** Board quests with locally-submitted counts folded in. */
export async function withLocalSubmissionCounts(
  quests: QuestWithStartup[]
): Promise<QuestWithStartup[]> {
  const rows = await readCollection<StoredQuestSubmission>(COLLECTION);
  if (rows.length === 0) return quests;

  return quests.map((quest) => {
    const extra = rows.filter((row) => row.quest_id === quest.id).length;
    return extra === 0
      ? quest
      : { ...quest, submissions_count: quest.submissions_count + extra };
  });
}
