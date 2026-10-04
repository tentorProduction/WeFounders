import { platformSetting } from "@/lib/platform";
import { sql } from "@/lib/db/neon";
import type { CollabType } from "@/types/database";
import type { CollabPostWithAuthor } from "@/lib/data/collab";

export { listCollabPosts } from "@/lib/data/collab";
export type { CollabPostWithAuthor } from "@/lib/data/collab";

/**
 * Collab board writes (TRD §2 table 11). Reads live in lib/data/collab.ts;
 * Neon is the only store.
 */

export interface CollabPostInput {
  category:string;company:string;skills:string[];location:string;experience:string;remote:boolean;
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
  const rows = (await sql`
    insert into collab_posts (
      role_type, title, description, equity_or_compensation,
      contact_channel, author_id, author_name, is_active, approval_status,category,company_name,skills,location,experience,is_remote
    )
    values (
      ${input.roleType},
      ${input.title},
      ${input.description},
      ${input.equityOrCompensation},
      ${input.contactChannel},
      ${input.authorId}::uuid,
      ${input.authorName},
      true, ${(await platformSetting('moderation_rules')).require_collab_approval===false?'approved':'pending'},${input.category},${input.company},${input.skills}::text[],${input.location},${input.experience},${input.remote}
    )
    returning id, created_at
  `) as unknown as { id: string; created_at: string }[];

  const inserted = rows[0];
  if (!inserted) {
    throw new Error("Could not publish that listing.");
  }

  return {
    category:input.category,company_name:input.company,skills:input.skills,location:input.location,experience:input.experience,is_remote:input.remote,
    id: inserted.id,
    startup_id: null,
    author_id: input.authorId,
    title: input.title,
    role_type: input.roleType,
    description: input.description,
    equity_or_compensation: input.equityOrCompensation,
    contact_channel: input.contactChannel,
    is_active: true,
    created_at: inserted.created_at,
    author_name: input.authorName,
    author_username:
      input.authorName.toLowerCase().replace(/[^a-z0-9]+/g, "") || "builder",
    startup_name: null,
    startup_slug: null,
  };
}
