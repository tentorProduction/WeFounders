import type { CollabPost } from "@/types/database";
import { getServerSupabase } from "@/lib/supabase/server";
import { reportReadFailure } from "@/lib/data/read-failure";

/**
 * Collab & co-founder board reads (TRD §2 table 11).
 *
 * Listings link optionally to a startup, and the author's display name is
 * denormalized onto the row at write time so the board renders without needing
 * a profiles join (profiles are readable, but a join per card is wasteful).
 */

export type CollabPostWithAuthor = CollabPost & {
  author_name: string;
  author_username: string;
  /** Linked startup name when the listing is attached to a launch. */
  startup_name: string | null;
  startup_slug: string | null;
};

const COLLAB_SELECT = `
  id, startup_id, author_id, author_name, role_type, title, description,
  equity_or_compensation, contact_channel, is_active, created_at,
  startup:startups ( name, slug )
`;

/**
 * PostgREST returns an embedded to-one relation as an object, but supabase-js
 * types it as an array without generated database types. Normalise both.
 */
function toCollabPost(row: unknown): CollabPostWithAuthor {
  const record = (row ?? {}) as Record<string, unknown>;
  const embedded = record.startup;
  const startup = (Array.isArray(embedded) ? embedded[0] : embedded) as
    | { name: string; slug: string }
    | null
    | undefined;
  // Drop the raw join so the result matches the `CollabPostWithAuthor` shape.
  const rest = { ...record };
  delete rest.startup;
  const authorName = (record.author_name as string | null) ?? "WeFounders builder";

  return {
    ...(rest as unknown as CollabPost),
    author_name: authorName,
    author_username: authorName.toLowerCase().replace(/[^a-z0-9]+/g, "") || "builder",
    startup_name: startup?.name ?? null,
    startup_slug: startup?.slug ?? null,
  };
}

/** Board listings — active first, then newest. */
export async function listCollabPosts(): Promise<CollabPostWithAuthor[]> {
  try {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase
      .from("collab_posts")
      .select(COLLAB_SELECT)
      .order("is_active", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map((row) => toCollabPost(row));
  } catch (error) {
    reportReadFailure("listCollabPosts", error);
    return [];
  }
}
