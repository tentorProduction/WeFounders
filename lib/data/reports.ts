import { sql } from "@/lib/db/neon";
import type { ReportItem } from "@/types/database";
import "server-only";

export async function getAllReports(): Promise<ReportItem[]> {
  const rows = (await sql`
    SELECT r.*, p.username as reporter_username, p.email as reporter_email
    FROM reports r
    JOIN profiles p ON r.reporter_id = p.id
    ORDER BY r.created_at DESC
    LIMIT 100
  `) as unknown as ReportItem[];
  return rows;
}
