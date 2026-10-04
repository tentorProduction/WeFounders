import { AdminPlatformTools } from "@/components/admin/platform-tools";
import { sql } from "@/lib/db/neon";
import type { QuestWithStartup } from "@/types/database";
import { AdminQuestsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminQuestsPage() {
  try {
    const [quests, startups, reports] = await Promise.all([
      sql`
        select
          q.*,
          json_build_object(
            'id', s.id, 'name', s.name, 'slug', s.slug, 'logo_url', s.logo_url
          ) as startup
        from testing_quests q
        left join startups s on s.id = q.startup_id
        order by q.created_at desc
      `,
      sql`
        select id, name, slug from startups
        where status = 'approved'
        order by name asc
      `,
      sql`
        select id, quest_id, tester_name, feedback_text, rating_ux,
               rating_speed, proof_screenshots, device_info,
               founder_feedback, status, created_at
        from quest_submissions
        order by created_at desc
      `,
    ]);

    return (
      <><AdminPlatformTools section="quest-review"/><AdminQuestsClient
        quests={quests as unknown as QuestWithStartup[]}
        startups={startups as { id: string; name: string; slug: string }[]}
        reports={reports as never[]}
      /></>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return (
      <p role="alert" className="rounded-lg border border-rose-900 bg-rose-950/30 p-4 text-rose-200">
        Could not load quest management data: {message}
      </p>
    );
  }
}
