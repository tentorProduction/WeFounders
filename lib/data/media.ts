import type { StartupMedia } from "@/types/database";
import { getServerSupabase } from "@/lib/supabase/server";
import { reportReadFailure } from "@/lib/data/read-failure";

/**
 * Startup gallery reads (screenshots + demo videos) from Supabase Storage,
 * surfaced through the `startup_media` table. Rows are uploaded by founders to
 * the public `startup-media` bucket at `<user-id>/<startup-id>/<file>`.
 */

const MEDIA_SELECT = "id, startup_id, media_url, media_type, caption, display_order, created_at";

export async function getStartupMedia(startupId: string): Promise<StartupMedia[]> {
  if (!startupId) return [];

  try {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase
      .from("startup_media")
      .select(MEDIA_SELECT)
      .eq("startup_id", startupId)
      .order("display_order", { ascending: true });

    if (error) throw error;
    return (data ?? []) as StartupMedia[];
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
    const supabase = await getServerSupabase();
    const { data, error } = await supabase
      .from("startups")
      .select("demo_video_url")
      .eq("id", startupId)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data?.demo_video_url ?? null;
  } catch (error) {
    reportReadFailure("getStartupVideoUrl", error);
    return null;
  }
}
