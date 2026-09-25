import type { StartupWithTags, Tag } from "@/types/database";
import { getServerSupabase } from "@/lib/supabase/server";
import { reportReadFailure } from "@/lib/data/read-failure";

/**
 * Startup reads — Supabase is the single source of truth.
 *
 * There is no fixture fallback: when the table is empty the feed renders a
 * real empty state, which is the honest thing to show on a platform that has
 * no approved launches yet. Read failures are logged and degrade to an empty
 * result so a transient backend blip can never take the whole site down with a
 * 500; the write paths in the lib stores surface errors instead.
 */

/** Columns + the tags join, shared by every read below. */
const STARTUP_SELECT = `
  id, founder_id, slug, name, tagline, description, website_url,
  demo_video_url, logo_url, banner_url, stage, target_market, status,
  launch_date, upvotes_count, comments_count, waitlist_count,
  is_featured, featured_until, created_at, updated_at,
  startup_tags ( tags ( id, name, slug, category ) )
`;

/**
 * PostgREST returns an embedded to-one relation as an object, but supabase-js
 * cannot prove that without generated database types, so it types the embed as
 * an array. Normalise both shapes here rather than casting at every call site.
 */
function asRecord(value: unknown): Record<string, unknown> {
  return (value ?? {}) as Record<string, unknown>;
}

function toTags(row: unknown): Tag[] {
  const joins = asRecord(row).startup_tags;
  if (!Array.isArray(joins)) return [];

  return joins
    .map((join) => {
      const embedded = asRecord(join).tags;
      return asRecord(Array.isArray(embedded) ? embedded[0] : embedded);
    })
    .filter((tag) => typeof tag.id === "string")
    .map((tag) => ({
      id: tag.id as string,
      name: tag.name as string,
      slug: tag.slug as string,
      // `tags.category` is free text in the database; narrow it for the UI.
      category: ((tag.category as string | null) ?? "industry") as Tag["category"],
    }));
}

function toStartup(row: unknown): StartupWithTags {
  // Drop the raw join so the result matches the `StartupWithTags` shape.
  const rest = { ...asRecord(row) };
  delete rest.startup_tags;
  return { ...(rest as unknown as StartupWithTags), tags: toTags(row) };
}

function logReadFailure(what: string, error: unknown): void {
  reportReadFailure(what, error);
}

/* ------------------------------------------------------------------ */
/* Feed & showcase                                                     */
/* ------------------------------------------------------------------ */

export interface FeedOptions {
  limit?: number;
  /** Restrict to these slugs (used by lookups that batch by slug). */
  orderBy?: "upvotes" | "newest";
}

/** Approved launches, highest upvotes first — the homepage discovery feed. */
export async function getStartupFeed(options: FeedOptions = {}): Promise<StartupWithTags[]> {
  try {
    const supabase = await getServerSupabase();

    let query = supabase
      .from("startups")
      .select(STARTUP_SELECT)
      .eq("status", "approved");

    query =
      options.orderBy === "newest"
        ? query.order("launch_date", { ascending: false })
        : query.order("upvotes_count", { ascending: false });

    if (options.limit) query = query.limit(options.limit);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row) => toStartup(row));
  } catch (error) {
    logReadFailure("getStartupFeed", error);
    return [];
  }
}

/** The promoted slot, rendered by FeaturedSpotlight. */
export async function getFeaturedStartup(): Promise<StartupWithTags | null> {
  try {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase
      .from("startups")
      .select(STARTUP_SELECT)
      .eq("status", "approved")
      .eq("is_featured", true)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const startup = toStartup(data);
    // An expired promotion must not keep the spotlight.
    if (startup.featured_until && new Date(startup.featured_until).getTime() <= Date.now()) {
      return null;
    }
    return startup;
  } catch (error) {
    logReadFailure("getFeaturedStartup", error);
    return null;
  }
}

/**
 * Single startup lookup for the showcase route (PRD Flow 1).
 * Matches slug first, then tolerates a case-insensitive slug, then the name —
 * so hand-typed URLs like /startups/Chhito still resolve.
 */
export async function getStartupBySlug(slug: string): Promise<StartupWithTags | null> {
  const needle = decodeURIComponent(slug).trim();
  if (!needle) return null;

  try {
    const supabase = await getServerSupabase();

    const { data, error } = await supabase
      .from("startups")
      .select(STARTUP_SELECT)
      .ilike("slug", needle)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (data) return toStartup(data);

    const { data: byName, error: nameError } = await supabase
      .from("startups")
      .select(STARTUP_SELECT)
      .ilike("name", needle)
      .limit(1)
      .maybeSingle();

    if (nameError) throw nameError;
    return byName ? toStartup(byName) : null;
  } catch (error) {
    logReadFailure("getStartupBySlug", error);
    return null;
  }
}

export async function getStartupById(id: string): Promise<StartupWithTags | null> {
  if (!id) return null;

  try {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase
      .from("startups")
      .select(STARTUP_SELECT)
      .eq("id", id)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data ? toStartup(data) : null;
  } catch (error) {
    logReadFailure("getStartupById", error);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Discovery helpers                                                   */
/* ------------------------------------------------------------------ */

/** Free-text search across name, tagline and description. */
export async function searchStartups(term: string, limit = 24): Promise<StartupWithTags[]> {
  const needle = term.trim().replace(/[%,()]/g, "").slice(0, 80);
  if (!needle) return [];

  try {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase
      .from("startups")
      .select(STARTUP_SELECT)
      .eq("status", "approved")
      .or(
        `name.ilike.%${needle}%,tagline.ilike.%${needle}%,description.ilike.%${needle}%`
      )
      .order("upvotes_count", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []).map((row) => toStartup(row));
  } catch (error) {
    logReadFailure("searchStartups", error);
    return [];
  }
}

/** Unique ecosystem tags — used for filter suggestions. */
export async function getAllTags(): Promise<Tag[]> {
  try {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase
      .from("tags")
      .select("id, name, slug, category")
      .order("name", { ascending: true });

    if (error) throw error;
    return (data ?? []).map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      category: (tag.category ?? "industry") as Tag["category"],
    }));
  } catch (error) {
    logReadFailure("getAllTags", error);
    return [];
  }
}
