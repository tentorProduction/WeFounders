"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyAdmin } from "@/lib/auth/admin";
import { auditedSql } from "@/lib/db/neon";
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
  const admin = await verifyAdmin();
  const sql = auditedSql(admin.userId);
  const parsed = questSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check the quest details.");
  if (questId && !idSchema.safeParse(questId).success) throw new Error("Invalid quest id.");

  const startups = (await sql`
    select id from startups where id = ${parsed.data.startupId}::uuid and status = 'approved' limit 1
  `) as { id: string }[];
  if (startups.length === 0) throw new Error("Choose a live startup for this quest.");

  const values = {
    startup_id: parsed.data.startupId,
    title: parsed.data.title,
    task_instructions: parsed.data.instructions,
    target_devices: parsed.data.targetDevices || null,
    reward_description: parsed.data.rewardDescription || null,
    max_submissions: parsed.data.maxSubmissions,
  };

  if (questId) {
    await sql`
      update testing_quests
      set startup_id         = ${values.startup_id}::uuid,
          title              = ${values.title},
          task_instructions  = ${values.task_instructions},
          target_devices     = ${values.target_devices},
          reward_description = ${values.reward_description},
          max_submissions    = ${values.max_submissions}
      where id = ${questId}::uuid
    `;
  } else {
    await sql`
      insert into testing_quests (
        startup_id, title, task_instructions, target_devices,
        reward_description, max_submissions
      )
      values (
        ${values.startup_id}::uuid,
        ${values.title},
        ${values.task_instructions},
        ${values.target_devices},
        ${values.reward_description},
        ${values.max_submissions}
      )
    `;
  }
  refreshQuests();
}

export async function setAdminQuestStatus(questId: string, status: QuestStatus) {
  const admin = await verifyAdmin();
  const sql = auditedSql(admin.userId);
  if (!idSchema.safeParse(questId).success) throw new Error("Invalid quest id.");
  if (!new Set<QuestStatus>(["active", "paused", "completed"]).has(status)) throw new Error("Invalid quest status.");
  await sql`
    update testing_quests set status = ${status}::quest_status where id = ${questId}::uuid
  `;
  refreshQuests();
}

export async function deleteAdminQuest(questId: string) {
  const admin = await verifyAdmin();
  const sql = auditedSql(admin.userId);
  if (!idSchema.safeParse(questId).success) throw new Error("Invalid quest id.");
  await sql`delete from testing_quests where id = ${questId}::uuid`;
  refreshQuests();
}

export async function reviewQuestSubmission(submissionId: string, status: "accepted" | "rejected", founderFeedback: string) {
  const admin = await verifyAdmin();
  const sql = auditedSql(admin.userId);
  if (!idSchema.safeParse(submissionId).success) throw new Error("Invalid submission id.");
  if (status !== "accepted" && status !== "rejected") throw new Error("Invalid report decision.");
  const feedback = founderFeedback.trim();
  if (feedback.length > 1000) throw new Error("Feedback must be under 1000 characters.");
  await sql`
    update quest_submissions
    set status = ${status}::submission_status, founder_feedback = ${feedback || null}
    where id = ${submissionId}::uuid
  `;
  refreshQuests();
}

