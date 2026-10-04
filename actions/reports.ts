"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db/neon";
import { readSession } from "@/lib/auth/session";

export async function submitReportAction(
  targetType: "startup" | "comment" | "user" | "quest" | "collab",
  targetId: string,
  reason: string,
  details?: string
) {
  const session = await readSession();
  if (!session) {
    return { success: false, error: "Please sign in to submit a report." };
  }

  await sql`
    INSERT INTO reports (reporter_id, target_type, target_id, reason, details)
    VALUES (${session.userId}::uuid, ${targetType}, ${targetId}::uuid, ${reason}, ${details || null})
  `;

  return { success: true };
}

export async function resolveReportAction(reportId: string, status: "reviewed" | "dismissed" | "actioned") {
  const session = await readSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const user = (await sql`SELECT role FROM profiles WHERE id = ${session.userId}::uuid`) as { role: string }[];
  if (user[0]?.role !== "admin") {
    return { success: false, error: "Admin only." };
  }

  await sql`
    UPDATE reports
    SET status = ${status}
    WHERE id = ${reportId}::uuid
  `;

  await sql`
    INSERT INTO audit_logs (admin_id, action, target_type, target_id, metadata)
    VALUES (${session.userId}::uuid, 'RESOLVE_REPORT', 'report', ${reportId}, ${JSON.stringify({ status })}::jsonb)
  `;

  revalidatePath("/admin/reports");
  return { success: true };
}
