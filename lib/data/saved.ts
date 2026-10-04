import { sql } from "@/lib/db/neon";
import "server-only";

export async function isItemSaved(userId: string, itemType: "startup" | "quest" | "collab", itemId: string): Promise<boolean> {
  const rows = (await sql`
    SELECT id FROM saved_items
    WHERE user_id = ${userId}::uuid
      AND item_type = ${itemType}
      AND item_id = ${itemId}::uuid
    LIMIT 1
  `) as { id: string }[];
  return rows.length > 0;
}

export async function getUserSavedItems(userId: string) {
  const startups = await sql`
    SELECT s.*, 
      p.full_name as founder_name, p.username as founder_username, p.avatar_url as founder_avatar
    FROM saved_items si
    JOIN startups s ON si.item_id = s.id
    LEFT JOIN profiles p ON s.founder_id = p.id
    WHERE si.user_id = ${userId}::uuid
      AND si.item_type = 'startup'
    ORDER BY si.created_at DESC
  `;

  const quests = await sql`
    SELECT q.*, 
      s.name as startup_name, s.slug as startup_slug, s.logo_url as startup_logo
    FROM saved_items si
    JOIN testing_quests q ON si.item_id = q.id
    JOIN startups s ON q.startup_id = s.id
    WHERE si.user_id = ${userId}::uuid
      AND si.item_type = 'quest'
    ORDER BY si.created_at DESC
  `;

  const collab = await sql`
    SELECT c.*
    FROM saved_items si
    JOIN collab_posts c ON si.item_id = c.id
    WHERE si.user_id = ${userId}::uuid
      AND si.item_type = 'collab'
    ORDER BY si.created_at DESC
  `;

  return { startups, quests, collab };
}
