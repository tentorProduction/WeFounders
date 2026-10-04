import { sql } from "@/lib/db/neon";
import type { ProjectUpdate } from "@/types/database";
import "server-only";

export async function getStartupUpdates(startupId: string): Promise<ProjectUpdate[]> {
  const rows = (await sql`
    SELECT * FROM project_updates
    WHERE startup_id = ${startupId}::uuid
    ORDER BY created_at DESC
  `) as unknown as ProjectUpdate[];
  return rows;
}
