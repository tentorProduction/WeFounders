import type { CollabType } from "@/types/database";

import { appendToCollection, readCollection } from "@/lib/demo-store";
import type { CollabPostWithAuthor } from "@/lib/fixtures/collab";
import { isSupabaseConfigured } from "@/lib/supabase/environment";

/**
 * Collab board store (TRD §2 table 10).
 *
 * Writes go to Supabase `collab_posts` when configured, else the local demo
 * store (`.data/collab.json` — gitignored, in-memory fallback on read-only
 * filesystems). Reads merge store posts with the fixture board so nothing
 * posted during the demo ever disappears.
 */

const COLLECTION = "collab";

export interface CollabPostInput {
  roleType: CollabType;
  title: string;
  description: string;
  equityOrCompensation: string | null;
  /** Normalized contact channel: wa.me link, t.me handle, or mailto. */
  contactChannel: string;
  authorId: string | null;
  authorName: string;
}

export interface StoredCollabPost {
  id: string;
  role_type: CollabType;
  title: string;
  description: string;
  equity_or_compensation: string | null;
  contact_channel: string;
  is_active: boolean;
  author_id: string | null;
  author_name: string;
  created_at: string;
}

/**
 * Normalize a contact input into a safe, directly-openable channel.
 * Accepts phone numbers (WhatsApp), @handles / t.me links (Telegram), and
 * emails (mailto). Anything else is rejected.
 */
export function normalizeContactChannel(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  // mailto / https URLs are taken as-is when they point somewhere sane.
  if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(value)) return value;

  if (/^https:\/\/(wa\.me\/\+?\d{8,15}|t\.me\/[A-Za-z0-9_]{4,32})\/?$/i.test(value)) {
    return value.toLowerCase();
  }

  // Bare phone → WhatsApp deep link.
  const phone = value.replace(/[\s()-]/g, "");
  if (/^\+?\d{8,15}$/.test(phone)) {
    return `https://wa.me/${phone.replace(/^\+/, "")}`;
  }

  // @handle or bare telegram username → t.me link.
  const handle = value.replace(/^@/, "");
  if (/^(t\.me\/)?[A-Za-z0-9_]{4,32}$/.test(handle) && /[A-Za-z]/.test(handle)) {
    return `https://t.me/${handle}`;
  }

  // Bare email → mailto.
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return `mailto:${value}`;
  }

  return null;
}

export async function addCollabPost(
  input: CollabPostInput
): Promise<StoredCollabPost> {
  const record: StoredCollabPost = {
    id: `cb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role_type: input.roleType,
    title: input.title,
    description: input.description,
    equity_or_compensation: input.equityOrCompensation,
    contact_channel: input.contactChannel,
    is_active: true,
    author_id: input.authorId,
    author_name: input.authorName,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("collab_posts")
        .insert({
          role_type: record.role_type,
          title: record.title,
          description: record.description,
          equity_or_compensation: record.equity_or_compensation,
          contact_channel: record.contact_channel,
          author_id: record.author_id,
          is_active: true,
        })
        .select()
        .single();

      if (!error && data) {
        return { ...record, ...(data as Partial<StoredCollabPost>) } as StoredCollabPost;
      }
    } catch {
      // Fall through to the local store — never lose a listing to an outage.
    }
  }

  await appendToCollection<StoredCollabPost>(COLLECTION, record);
  return record;
}

/** Fixture board merged with locally/Supabase-posted listings (newest first). */
export async function listCollabPosts(): Promise<CollabPostWithAuthor[]> {
  const fixtures = await import("@/lib/fixtures/collab").then(
    (mod) => mod.getCollabBoard()
  );

  let stored: StoredCollabPost[] = [];

  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("collab_posts")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        stored = data.map((row) => ({
          ...(row as StoredCollabPost),
          author_name:
            (row as StoredCollabPost).author_name ?? "Wefounder builder",
        }));
      }
    } catch {
      // Fall through to the local store.
    }
  }

  if (stored.length === 0) {
    stored = await readCollection<StoredCollabPost>(COLLECTION);
  }

  // Store rows aren't attached to a startup; fixtures may be.
  const merged: CollabPostWithAuthor[] = stored.map((row) => ({
    ...row,
    // Demo-mode posts have no signed-in author; keep the row shape strict.
    author_id: row.author_id ?? "demo-author",
    author_username: `demo-${row.id.slice(-6)}`,
    startup_id: null,
    startup_name: null,
    startup_slug: null,
  }));

  return [...merged, ...fixtures].sort((a, b) => {
    if (a.is_active !== b.is_active) return Number(b.is_active) - Number(a.is_active);
    return b.created_at.localeCompare(a.created_at);
  });
}
