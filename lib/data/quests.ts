import type { QuestWithStartup } from "@/types/database";
import { raw, sql } from "@/lib/db/neon";
import { reportReadFailure } from "@/lib/data/read-failure";

/**
 * Testing-quest reads (TRD §2 tables 8–9). Neon is the only source — the board
 * is empty until a founder posts a quest for an approved startup.
 */

/**
 * The quest row plus its parent startup, joined explicitly. The previous
 * PostgREST embed could hand back an object or a one-element array; a plain
 * LEFT JOIN always returns an object, so no shape normalisation is needed.
 */
const QUEST_WITH_STARTUP = `
  select
    q.id, q.startup_id, q.title, q.task_instructions, q.target_devices,
    q.reward_description, q.max_submissions, q.submissions_count, q.status,
    q.created_at, q.updated_at,
    json_build_object(
      'id', s.id, 'name', s.name, 'slug', s.slug, 'logo_url', s.logo_url
    ) as startup
  from testing_quests q
  left join startups s on s.id = q.startup_id
`;

/** All quests for the board — paused ones included so counts stay honest. */
export async function getQuestBoard(): Promise<QuestWithStartup[]> {
  try {
    const rows = (await sql`
      ${raw(QUEST_WITH_STARTUP)}
      order by q.created_at desc
    `) as unknown as QuestWithStartup[];

    return rows;
  } catch (error) {
    reportReadFailure("getQuestBoard", error);
    return [];
  }
}

export async function getQuestById(questId: string): Promise<QuestWithStartup | null> {
  if (!questId) return null;

  try {
    const rows = (await sql`
      ${raw(QUEST_WITH_STARTUP)}
      where q.id = ${questId}::uuid
      limit 1
    `) as unknown as QuestWithStartup[];

    return rows[0] ?? null;
  } catch (error) {
    reportReadFailure("getQuestById", error);
    return null;
  }
}