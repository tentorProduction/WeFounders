import { sql } from "@/lib/db/neon";
import type { AuditLogItem } from "@/types/database";
import "server-only";

export async function getAuditLogs(): Promise<AuditLogItem[]> {
  const rows = (await sql`
    SELECT a.*, p.email as admin_email, p.username as admin_username
    FROM audit_logs a
    JOIN profiles p ON a.admin_id = p.id
    ORDER BY a.created_at DESC
    LIMIT 100
  `) as unknown as AuditLogItem[];
  return rows;
}

export async function logAdminAction(adminId: string, action: string, targetType: string, targetId: string, metadata?: Record<string, unknown>) {
  await sql`
    INSERT INTO audit_logs (admin_id, action, target_type, target_id, metadata)
    VALUES (${adminId}::uuid, ${action}, ${targetType}, ${targetId}, ${JSON.stringify(metadata || {})}::jsonb)
  `;
}
