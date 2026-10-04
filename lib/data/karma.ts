import { sql } from "@/lib/db/neon";
import type { KarmaTransaction } from "@/types/database";
import "server-only";

export async function getUserKarmaHistory(userId: string): Promise<KarmaTransaction[]> {
  const rows = (await sql`
    SELECT * FROM karma_ledger
    WHERE user_id = ${userId}::uuid
    ORDER BY created_at DESC
  `) as unknown as KarmaTransaction[];
  return rows;
}

export async function awardKarma(
  userId: string,
  amount: number,
  reason: string,
  sourceType: string,
  sourceId?: string
) {
  await sql`
    INSERT INTO karma_ledger (user_id, amount, reason, source_type, source_id)
    VALUES (${userId}::uuid, ${amount}, ${reason}, ${sourceType}, ${sourceId ? `${sourceId}::uuid` : null})
  `;

  await sql`
    UPDATE profiles
    SET karma_score = karma_score + ${amount}
    WHERE id = ${userId}::uuid
  `;

  await sql`
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      ${userId}::uuid,
      'karma',
      '+' || ${amount} || ' Karma Earned',
      ${reason},
      '/karma'
    )
  `;
}
