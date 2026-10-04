"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db/neon";
import { readSession } from "@/lib/auth/session";

export async function createProjectUpdateAction(formData: FormData) {
  const session = await readSession();
  if (!session) {
    return { success: false, error: "Authentication required." };
  }

  const startupId = formData.get("startupId") as string;
  const version = (formData.get("version") as string)?.trim() || "v1.0";
  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();

  if (!startupId || !title || !content) {
    return { success: false, error: "Startup ID, title and content are required." };
  }

  // Verify ownership or admin
  const startup = (await sql`
    SELECT id, founder_id, slug, name FROM startups WHERE id = ${startupId}::uuid
  `) as { id: string; founder_id: string; slug: string; name: string }[];

  const userRole = (await sql`SELECT role FROM profiles WHERE id = ${session.userId}::uuid`) as { role: string }[];
  const isAdmin = userRole[0]?.role === "admin";

  if (!startup[0] || (startup[0].founder_id !== session.userId && !isAdmin)) {
    return { success: false, error: "Unauthorized. Only founder or admin can post updates." };
  }

  await sql`
    INSERT INTO project_updates (startup_id, author_id, version, title, content)
    VALUES (${startupId}::uuid, ${session.userId}::uuid, ${version}, ${title}, ${content})
  `;

  // Notify followers of this startup
  const followers = (await sql`
    SELECT follower_id FROM follows
    WHERE target_type = 'startup' AND target_id = ${startupId}::uuid
  `) as { follower_id: string }[];

  for (const f of followers) {
    await sql`
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES (
        ${f.follower_id}::uuid,
        'launch',
        ${startup[0].name} || ' published ' || ${version},
        ${title},
        '/startups/' || ${startup[0].slug}
      )
    `;
  }

  revalidatePath(`/startups/${startup[0].slug}`);
  revalidatePath("/dashboard/founder");
  return { success: true };
}
