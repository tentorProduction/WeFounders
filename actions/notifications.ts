"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db/neon";
import { readSession } from "@/lib/auth/session";

export async function markNotificationReadAction(notificationId: string) {
  const session = await readSession();
  if (!session) return { success: false };

  await sql`
    UPDATE notifications
    SET is_read = true
    WHERE id = ${notificationId}::uuid AND user_id = ${session.userId}::uuid
  `;
  revalidatePath("/notifications");
  return { success: true };
}

export async function markAllNotificationsReadAction() {
  const session = await readSession();
  if (!session) return { success: false };

  await sql`
    UPDATE notifications
    SET is_read = true
    WHERE user_id = ${session.userId}::uuid
  `;
  revalidatePath("/notifications");
  return { success: true };
}
