import type { StartupMedia } from "@/types/database";
import { raw, sql } from "@/lib/db/neon";
import { reportReadFailure } from "@/lib/data/read-failure";

/**
 * Startup gallery reads (screenshots + demo videos).
 *
 * Media lives in an object store and only the URL is kept here, surfaced
 * through the `startup_media` table — so moving the database to Neon changes
 * nothing about how the gallery resolves.
 */

const MEDIA_SELECT = "id, startup_id, media_url, media_type, caption, display_order, created_at";

export async function getStartupMedia(startupId: string): Promise<StartupMedia[]> {
  if (!startupId) return [];

  try {
    const rows = await sql`
      select ${raw(MEDIA_SELECT)}
      from startup_media
      where startup_id = ${startupId}::uuid
      order by display_order asc
    `;

    return rows as unknown as StartupMedia[];
  } catch (error) {
    reportReadFailure("getStartupMedia", error);
    return [];
  }
}

/**
 * Optional YouTube/Loom demo — rendered as the first carousel slide.
 * The value lives on `startups.demo_video_url` and is parsed by lib/video.ts.
 */
export async function getStartupVideoUrl(startupId: string): Promise<string | null> {
  if (!startupId) return null;

  try {
    const rows = (await sql`
      select demo_video_url from startups where id = ${startupId}::uuid limit 1
    `) as { demo_video_url: string | null }[];

    return rows[0]?.demo_video_url ?? null;
  } catch (error) {
    reportReadFailure("getStartupVideoUrl", error);
    return null;
  }
}
