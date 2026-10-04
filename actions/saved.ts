"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db/neon";
import { readSession } from "@/lib/auth/session";

export async function toggleSaveAction(itemType: "startup" | "quest" | "collab", itemId: string) {
  const session = await readSession();
  if (!session) {
    return { success: false, error: "Please sign in to save items." };
  }

  const existing = (await sql`
    SELECT id FROM saved_items
    WHERE user_id = ${session.userId}::uuid
      AND item_type = ${itemType}
      AND item_id = ${itemId}::uuid
    LIMIT 1
  `) as { id: string }[];

  if (existing.length > 0) {
    await sql`
      DELETE FROM saved_items
      WHERE id = ${existing[0].id}::uuid
    `;
    revalidatePath("/saved");
    return { success: true, saved: false };
  } else {
    await sql`
      INSERT INTO saved_items (user_id, item_type, item_id)
      VALUES (${session.userId}::uuid, ${itemType}, ${itemId}::uuid)
    `;
    revalidatePath("/saved");
    return { success: true, saved: true };
  }
}
