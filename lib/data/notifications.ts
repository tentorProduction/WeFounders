import { sql } from "@/lib/db/neon";
import type { NotificationItem } from "@/types/database";
import "server-only";

export async function getUserNotifications(userId: string): Promise<NotificationItem[]> {
  const rows = (await sql`
    SELECT * FROM notifications
    WHERE user_id = ${userId}::uuid
    ORDER BY created_at DESC
    LIMIT 50
  `) as unknown as NotificationItem[];
  return rows;
}

export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  const rows = (await sql`
    SELECT COUNT(*)::int as count FROM notifications
    WHERE user_id = ${userId}::uuid AND is_read = false
  `) as { count: number }[];
  return rows[0]?.count ?? 0;
}
