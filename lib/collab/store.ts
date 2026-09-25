import { createAdminClient } from "@/lib/supabase/admin";
import type { CollabType } from "@/types/database";
import type { CollabPostWithAuthor } from "@/lib/data/collab";

export { listCollabPosts } from "@/lib/data/collab";
export type { CollabPostWithAuthor } from "@/lib/data/collab";

/**
 * Collab board writes (TRD §2 table 11). Reads live in lib/data/collab.ts;
 * Supabase is the only store.
 */

export interface CollabPostInput {
  roleType: CollabType;
  title: string;
  description: string;
  equityOrCompensation: string | null;
  /** Normalized contact channel: wa.me link, t.me handle, or mailto. */
  contactChannel: string;
  /** Required — only authenticated viewers may post. */
  authorId: string;
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
): Promise<CollabPostWithAuthor> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("collab_posts")
    .insert({
      role_type: input.roleType,
      title: input.title,
      description: input.description,
      equity_or_compensation: input.equityOrCompensation,
      contact_channel: input.contactChannel,
      author_id: input.authorId,
      author_name: input.authorName,
      is_active: true,
    })
    .select("id, created_at")
    .single();

  if (error) throw new Error(`Could not publish that listing: ${error.message}`);

  return {
    id: data.id,
    startup_id: null,
    author_id: input.authorId,
    title: input.title,
    role_type: input.roleType,
    description: input.description,
    equity_or_compensation: input.equityOrCompensation,
    contact_channel: input.contactChannel,
    is_active: true,
    created_at: data.created_at,
    author_name: input.authorName,
    author_username:
      input.authorName.toLowerCase().replace(/[^a-z0-9]+/g, "") || "builder",
    startup_name: null,
    startup_slug: null,
  };
}
