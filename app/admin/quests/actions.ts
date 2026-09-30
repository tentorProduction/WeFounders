"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { QuestStatus } from "@/types/database";

const idSchema = z.string().uuid();
const questSchema = z.object({
  startupId: z.string().uuid(),
  title: z.string().trim().min(3).max(120),
  instructions: z.string().trim().min(20).max(10000),
  targetDevices: z.string().trim().max(200),
  rewardDescription: z.string().trim().max(240),
  maxSubmissions: z.number().int().min(1).max(500),
});

function refreshQuests() {
  revalidatePath("/admin/quests");
  revalidatePath("/quests");
}

export type AdminQuestInput = z.infer<typeof questSchema>;

export async function saveAdminQuest(input: AdminQuestInput, questId?: string) {
  await verifyAdmin();
  const parsed = questSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check the quest details.");
  if (questId && !idSchema.safeParse(questId).success) throw new Error("Invalid quest id.");

  const supabase = createAdminClient();
  const { data: startup, error: startupError } = await supabase
    .from("startups").select("id").eq("id", parsed.data.startupId).eq("status", "approved").maybeSingle();
  if (startupError) throw new Error(`Could not verify startup: ${startupError.message}`);
  if (!startup) throw new Error("Choose a live startup for this quest.");

  const values = {
    startup_id: parsed.data.startupId,
    title: parsed.data.title,
    task_instructions: parsed.data.instructions,
    target_devices: parsed.data.targetDevices || null,
    reward_description: parsed.data.rewardDescription || null,
    max_submissions: parsed.data.maxSubmissions,
  };
  const query = questId
    ? supabase.from("testing_quests").update(values).eq("id", questId)
    : supabase.from("testing_quests").insert(values);
  const { error } = await query;
  if (error) throw new Error(`Could not save quest: ${error.message}`);
  refreshQuests();
}

export async function setAdminQuestStatus(questId: string, status: QuestStatus) {
  await verifyAdmin();
  if (!idSchema.safeParse(questId).success) throw new Error("Invalid quest id.");
  if (!new Set<QuestStatus>(["active", "paused", "completed"]).has(status)) throw new Error("Invalid quest status.");
  const { error } = await createAdminClient().from("testing_quests").update({ status }).eq("id", questId);
  if (error) throw new Error(`Could not update quest status: ${error.message}`);
  refreshQuests();
}

export async function deleteAdminQuest(questId: string) {
  await verifyAdmin();
  if (!idSchema.safeParse(questId).success) throw new Error("Invalid quest id.");
  const { error } = await createAdminClient().from("testing_quests").delete().eq("id", questId);
  if (error) throw new Error(`Could not delete quest: ${error.message}`);
  refreshQuests();
}

export async function reviewQuestSubmission(submissionId: string, status: "accepted" | "rejected", founderFeedback: string) {
  await verifyAdmin();
  if (!idSchema.safeParse(submissionId).success) throw new Error("Invalid submission id.");
  if (status !== "accepted" && status !== "rejected") throw new Error("Invalid report decision.");
  const feedback = founderFeedback.trim();
  if (feedback.length > 1000) throw new Error("Feedback must be under 1000 characters.");
  const { error } = await createAdminClient().from("quest_submissions").update({ status, founder_feedback: feedback || null }).eq("id", submissionId);
  if (error) throw new Error(`Could not review report: ${error.message}`);
  refreshQuests();
}
