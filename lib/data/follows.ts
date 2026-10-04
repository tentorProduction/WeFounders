import { sql } from "@/lib/db/neon";
import "server-only";

export async function isFollowing(followerId: string, targetType: "startup" | "user", targetId: string): Promise<boolean> {
  const rows = (await sql`
    SELECT id FROM follows
    WHERE follower_id = ${followerId}::uuid
      AND target_type = ${targetType}
      AND target_id = ${targetId}::uuid
    LIMIT 1
  `) as { id: string }[];
  return rows.length > 0;
}

export async function getFollowersCount(targetType: "startup" | "user", targetId: string): Promise<number> {
  const rows = (await sql`
    SELECT COUNT(*)::int as count FROM follows
    WHERE target_type = ${targetType}
      AND target_id = ${targetId}::uuid
  `) as { count: number }[];
  return rows[0]?.count ?? 0;
}

export async function getFollowedStartups(userId: string) {
  return await sql`
    SELECT s.*, 
      p.full_name as founder_name, p.username as founder_username, p.avatar_url as founder_avatar
    FROM follows f
    JOIN startups s ON f.target_id = s.id
    LEFT JOIN profiles p ON s.founder_id = p.id
    WHERE f.follower_id = ${userId}::uuid
      AND f.target_type = 'startup'
    ORDER BY f.created_at DESC
  `;
}
