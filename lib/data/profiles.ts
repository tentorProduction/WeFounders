import type { Profile, StartupWithTags, Tag } from "@/types/database";
import { getServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { reportReadFailure } from "@/lib/data/read-failure";

/**
 * Profile reads. `getStartupsByFounder` deliberately uses the service role:
 * a founder can see their own drafts and rejected submissions, which the public
 * anon policy hides. Callers must pass the authenticated viewer's own id.
 */

const STARTUP_SELECT = `
  id, founder_id, slug, name, tagline, description, website_url,
  demo_video_url, logo_url, banner_url, stage, target_market, status,
  launch_date, upvotes_count, comments_count, waitlist_count,
  is_featured, featured_until, created_at, updated_at,
  startup_tags ( tags ( id, name, slug, category ) )
`;

function toStartup(row: unknown): StartupWithTags {
  const record = (row ?? {}) as Record<string, unknown>;
  const { startup_tags: joins, ...rest } = record;

  const tags: Tag[] = Array.isArray(joins)
    ? joins
        .map((join) => {
          const embedded = (join ?? {}) as Record<string, unknown>;
          const raw = embedded.tags;
          return (Array.isArray(raw) ? raw[0] : raw) as Record<string, unknown> | null;
        })
        .filter((tag): tag is Record<string, unknown> => Boolean(tag?.id))
        .map((tag) => ({
          id: tag.id as string,
          name: tag.name as string,
          slug: tag.slug as string,
          category: ((tag.category as string | null) ?? "industry") as Tag["category"],
        }))
    : [];

  return { ...(rest as unknown as StartupWithTags), tags };
}

export async function getStartupsByFounder(
  founderId: string
): Promise<StartupWithTags[]> {
  if (!founderId) return [];

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("startups")
      .select(STARTUP_SELECT)
      .eq("founder_id", founderId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map((row) => toStartup(row));
  } catch (error) {
    reportReadFailure("getStartupsByFounder", error);
    return [];
  }
}

export async function getProfile(userId: string): Promise<Profile | null> {
  if (!userId) return null;

  try {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return (data as Profile) ?? null;
  } catch (error) {
    reportReadFailure("getProfile", error);
    return null;
  }
}
