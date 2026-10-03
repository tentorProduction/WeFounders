import { sql } from "@/lib/db/neon";

/**
 * Quest submission store (TRD §2 table 9).
 *
 * Neon `quest_submissions` is the only store. `testing_quests` and
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
  // The driver serialises a JS array to Postgres array-literal syntax, so
  // `proof_screenshots` (text[]) binds directly; an object binds as JSON text,
  // which `jsonb` then parses.
  const proofScreenshots = input.proofScreenshots ?? [];
  const deviceInfo = input.deviceInfo ?? null;

  const rows = (await sql`
    insert into quest_submissions (
      quest_id, tester_id, tester_name, feedback_text,
      rating_ux, rating_speed, proof_screenshots, device_info, status
    )
    values (
      ${input.questId}::uuid,
      ${input.testerId}::uuid,
      ${input.testerName},
      ${input.feedbackText},
      ${input.ratingUx},
      ${input.ratingSpeed},
      ${proofScreenshots},
      ${deviceInfo}::jsonb,
      'pending'
    )
    returning
      id, quest_id, tester_id, tester_name, feedback_text, rating_ux,
      rating_speed, proof_screenshots, device_info, founder_feedback,
      status, created_at
  `) as unknown as StoredQuestSubmission[];

  const inserted = rows[0];
  if (!inserted) throw new Error("Could not file that report.");
  return inserted;
}

/** Submissions filed against one quest, newest first. */
export async function listQuestSubmissions(
  questId: string
): Promise<StoredQuestSubmission[]> {
  if (!questId) return [];

  try {
    const rows = (await sql`
      select
        id, quest_id, tester_id, tester_name, feedback_text, rating_ux,
        rating_speed, proof_screenshots, device_info, founder_feedback,
        status, created_at
      from quest_submissions
      where quest_id = ${questId}::uuid
      order by created_at desc
    `) as unknown as StoredQuestSubmission[];

    return rows;
  } catch (error) {
    console.error("[quests] submission read failed:", error);
    return [];
  }
}