"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db/neon";
import { readSession } from "@/lib/auth/session";

export async function toggleFollowAction(targetType: "startup" | "user", targetId: string) {
  const session = await readSession();
  if (!session) {
    return { success: false, error: "Please sign in to follow." };
  }

  const existing = (await sql`
    SELECT id FROM follows
    WHERE follower_id = ${session.userId}::uuid
      AND target_type = ${targetType}
      AND target_id = ${targetId}::uuid
    LIMIT 1
  `) as { id: string }[];

  if (existing.length > 0) {
    await sql`
      DELETE FROM follows
      WHERE id = ${existing[0].id}::uuid
    `;
    if (targetType === "startup") {
      await sql`
        UPDATE startups
        SET followers_count = GREATEST(0, followers_count - 1)
        WHERE id = ${targetId}::uuid
      `;
    } else {
      await sql`
        UPDATE profiles
        SET followers_count = GREATEST(0, followers_count - 1)
        WHERE id = ${targetId}::uuid
      `;
      await sql`
        UPDATE profiles
        SET following_count = GREATEST(0, following_count - 1)
        WHERE id = ${session.userId}::uuid
      `;
    }
    revalidatePath("/following");
    return { success: true, following: false };
  } else {
    await sql`
      INSERT INTO follows (follower_id, target_type, target_id)
      VALUES (${session.userId}::uuid, ${targetType}, ${targetId}::uuid)
    `;
    if (targetType === "startup") {
      await sql`
        UPDATE startups
        SET followers_count = followers_count + 1
        WHERE id = ${targetId}::uuid
      `;
      // Create notification for startup founder
      const startup = (await sql`SELECT founder_id, name FROM startups WHERE id = ${targetId}::uuid`) as { founder_id: string; name: string }[];
      if (startup[0] && startup[0].founder_id !== session.userId) {
        await sql`
          INSERT INTO notifications (user_id, type, title, message, link)
          VALUES (
            ${startup[0].founder_id}::uuid,
            'follower',
            'New follower on ' || ${startup[0].name},
            ${session.name || "A builder"} || ' started following your startup.',
            '/startups/' || ${targetId}
          )
        `;
      }
    } else {
      await sql`
        UPDATE profiles
        SET followers_count = followers_count + 1
        WHERE id = ${targetId}::uuid
      `;
      await sql`
        UPDATE profiles
        SET following_count = following_count + 1
        WHERE id = ${session.userId}::uuid
      `;
      if (targetId !== session.userId) {
        await sql`
          INSERT INTO notifications (user_id, type, title, message, link)
          VALUES (
            ${targetId}::uuid,
            'follower',
            'New follower',
            ${session.name || "A community member"} || ' started following you.',
            '/profile/' || ${session.userId}
          )
        `;
      }
    }
    revalidatePath("/following");
    return { success: true, following: true };
  }
}
