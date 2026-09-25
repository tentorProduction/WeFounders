import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Quest submission store (TRD §2 table 9).
 *
 * Supabase `quest_submissions` is the only store. `testing_quests` and
 * `startups.submissions_count` are maintained by database triggers, so the
 * board never needs to add up local rows to know how full a quest is.
 */

export interface QuestSubmissionInput {
  questId: string;
  testerId: string | null;
  testerName: string;
  feedbackText: string;
  ratingUx: number; // 1–5
  ratingSpeed: number; // 1–5
  /** Public Storage URLs for the tester's proof screenshots. */
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
  founder_feedback: string | null;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

export async function addQuestSubmission(
  input: QuestSubmissionInput
): Promise<StoredQuestSubmission> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("quest_submissions")
    .insert({
      quest_id: input.questId,
      tester_id: input.testerId,
      tester_name: input.testerName,
      feedback_text: input.feedbackText,
      rating_ux: input.ratingUx,
      rating_speed: input.ratingSpeed,
      proof_screenshots: input.proofScreenshots,
      device_info: input.deviceInfo,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw new Error(`Could not file that report: ${error.message}`);
  return data as StoredQuestSubmission;
}

/** Submissions filed against one quest, newest first. */
export async function listQuestSubmissions(
  questId: string
): Promise<StoredQuestSubmission[]> {
  if (!questId) return [];

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("quest_submissions")
      .select("*")
      .eq("quest_id", questId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as StoredQuestSubmission[];
  } catch (error) {
    console.error("[quests] submission read failed:", error);
    return [];
  }
}
