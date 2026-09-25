import { appendToCollection, readCollection } from "@/lib/demo-store";
import { isSupabaseConfigured } from "@/lib/supabase/environment";
import type { CommentWithAuthor } from "@/types/database";

/**
 * Discussion threads (PRD §4.1 — "Threaded comment section with verified
 * Founder badge"). Fixture threads ship for the demo startups; new comments go
 * to Supabase when configured, otherwise to the local demo store.
 */

const COLLECTION = "comments";

interface StoredComment {
  id: string;
  startup_id: string;
  content: string;
  author_name: string;
  is_founder_reply: boolean;
  created_at: string;
}

function fixtureComment(input: {
  id: string;
  startupId: string;
  content: string;
  author: string;
  username: string;
  karma: number;
  isFounder?: boolean;
  createdAt: string;
}): CommentWithAuthor {
  return {
    id: input.id,
    startup_id: input.startupId,
    user_id: `user-${input.username}`,
    parent_id: null,
    content: input.content,
    is_founder_reply: Boolean(input.isFounder),
    created_at: input.createdAt,
    updated_at: input.createdAt,
    author: {
      username: input.username,
      full_name: input.author,
      avatar_url: null,
      karma_score: input.karma,
      role: input.isFounder ? "founder" : "user",
    },
  };
}

const COMMENT_FIXTURES: Record<string, CommentWithAuthor[]> = {
  sajhapay: [
    fixtureComment({
      id: "c-sajhapay-1",
      startupId: "st-sajhapay",
      content:
        "Tested the Khalti sandbox flow on Ncell 4G — the redirect came back fine but the invoice status stayed Pending for ~40 seconds. Is that polling interval configurable?",
      author: "Rohit Shrestha",
      username: "rohitbuilds",
      karma: 40,
      createdAt: "2026-09-22T02:15:00Z",
    }),
    fixtureComment({
      id: "c-sajhapay-2",
      startupId: "st-sajhapay",
      content:
        "Great catch — we poll every 30s and show an optimistic state now. Shipping a fix for the invoice badge tonight. Thank you!",
      author: "Sunita Maharjan",
      username: "sunita",
      karma: 320,
      isFounder: true,
      createdAt: "2026-09-22T03:02:00Z",
    }),
    fixtureComment({
      id: "c-sajhapay-3",
      startupId: "st-sajhapay",
      content:
        "Would love Fonepay QR support for retail khatas. Most of the shops near me only accept QR payments.",
      author: "Bikash Adhikari",
      username: "bikash",
      karma: 18,
      createdAt: "2026-09-22T05:41:00Z",
    }),
  ],
  chhito: [
    fixtureComment({
      id: "c-chhito-1",
      startupId: "st-chhito",
      content:
        "Used the rider app through the Balaju–Kalimati route. Routing is solid, but COD reconciliation should let me attach a photo of the cash receipt.",
      author: "Anita Gurung",
      username: "anitag",
      karma: 65,
      createdAt: "2026-09-22T01:20:00Z",
    }),
    fixtureComment({
      id: "c-chhito-2",
      startupId: "st-chhito",
      content:
        "Receipt photos are in this week's build. Meanwhile you can add a note per delivery — tell us if that is enough for your ledger.",
      author: "Prabin Tamang",
      username: "prabin",
      karma: 210,
      isFounder: true,
      createdAt: "2026-09-22T01:55:00Z",
    }),
  ],
  agridristi: [
    fixtureComment({
      id: "c-agridristi-1",
      startupId: "st-agridristi",
      content:
        "Ran it on a Redmi 9A with no internet for 3 hours — detection still worked. The Nepali labels are clear but the font is a bit small for older farmers.",
      author: "Sita Yadav",
      username: "sitay",
      karma: 52,
      createdAt: "2026-09-22T00:35:00Z",
    }),
    fixtureComment({
      id: "c-agridristi-2",
      startupId: "st-agridristi",
      content:
        "Thank you — bumping the base font size in Settings and adding a Devanagari font scale option in the next alpha.",
      author: "Deepak Chaudhary",
      username: "deepakc",
      karma: 180,
      isFounder: true,
      createdAt: "2026-09-22T01:10:00Z",
    }),
  ],
  lekhani: [
    fixtureComment({
      id: "c-lekhani-2",
      startupId: "st-lekhani",
      content:
        "Thanks Nikita! We are tuning our Devanagari tokenizer to lock English technical terms in place during translation.",
      author: "Roman Neupane",
      username: "romann",
      karma: 195,
      isFounder: true,
      createdAt: "2026-09-21T15:20:00Z",
    }),
  ],
  sunwai: [
    fixtureComment({
      id: "c-sunwai-1",
      startupId: "st-sunwai",
      content:
        "Does the speech-to-text model support mixed Nepanglish audio clips with customer service background noise?",
      author: "Subash Devkota",
      username: "subashd",
      karma: 44,
      createdAt: "2026-09-22T04:10:00Z",
    }),
    fixtureComment({
      id: "c-sunwai-2",
      startupId: "st-sunwai",
      content:
        "Yes! We trained specifically on BPO telephony audio with background noise and multi-dialect code switching.",
      author: "Anish Shakya",
      username: "anishs",
      karma: 150,
      isFounder: true,
      createdAt: "2026-09-22T04:45:00Z",
    }),
  ],
  kothakotha: [
    fixtureComment({
      id: "c-kothakotha-1",
      startupId: "st-kothakotha",
      content:
        "Is the 48-hour room reservation deposit fully refundable if the room doesn't match the listing images?",
      author: "Pema Lama",
      username: "pemalama",
      karma: 38,
      createdAt: "2026-09-22T03:30:00Z",
    }),
    fixtureComment({
      id: "c-kothakotha-2",
      startupId: "st-kothakotha",
      content:
        "100% auto-refunded via eSewa if you flag a discrepancy within 24 hours of your scheduled visit.",
      author: "Saurav Bhattarai",
      username: "sauravb",
      karma: 210,
      isFounder: true,
      createdAt: "2026-09-22T04:00:00Z",
    }),
  ],
  "himalaya-analytics": [
    fixtureComment({
      id: "c-himalaya-1",
      startupId: "st-himalaya-analytics",
      content:
        "Tested with a thermal receipt printer at our shop in Patan. Reorder alerts for Dashain peak worked seamlessly!",
      author: "Ramesh Shrestha",
      username: "rameshs",
      karma: 60,
      createdAt: "2026-09-21T16:15:00Z",
    }),
  ],
  "p2p-nepal": [
    fixtureComment({
      id: "c-p2p-1",
      startupId: "st-p2p-nepal",
      content:
        "Love the Fonepay instant payout feature for local plastic collectors. Are ward leaderboards public?",
      author: "Kabita Thapa",
      username: "kabitat",
      karma: 29,
      createdAt: "2026-09-21T17:00:00Z",
    }),
  ],
  shabdakit: [
    fixtureComment({
      id: "c-shabdakit-1",
      startupId: "st-shabdakit",
      content:
        "Super clean i18n API! Finally a proper Devanagari pluralization helper for Next.js app router.",
      author: "Aashish Sharma",
      username: "aashishs",
      karma: 88,
      createdAt: "2026-09-22T02:00:00Z",
    }),
  ],
  "nyaya-ai": [
    fixtureComment({
      id: "c-nyaya-1",
      startupId: "st-nyaya-ai",
      content:
        "Are Supreme Court precedent citations cross-referenced with official Nepal Gazette publications?",
      author: "Advocate Karki",
      username: "advkarki",
      karma: 110,
      createdAt: "2026-09-22T05:00:00Z",
    }),
    fixtureComment({
      id: "c-nyaya-2",
      startupId: "st-nyaya-ai",
      content:
        "Yes, every legal summary links directly to the verified Gazette PDF page and court record number.",
      author: "Archana Karki",
      username: "archanak",
      karma: 230,
      isFounder: true,
      createdAt: "2026-09-22T05:30:00Z",
    }),
  ],
};

function storedToComment(row: StoredComment): CommentWithAuthor {
  return {
    id: row.id,
    startup_id: row.startup_id,
    user_id: null,
    parent_id: null,
    content: row.content,
    is_founder_reply: row.is_founder_reply,
    created_at: row.created_at,
    updated_at: row.created_at,
    author: {
      username: row.author_name.toLowerCase().replace(/[^a-z0-9]+/g, ""),
      full_name: row.author_name,
      avatar_url: null,
      karma_score: 0,
      role: row.is_founder_reply ? "founder" : "user",
    },
  };
}

/** Fixture thread + anything captured locally, oldest first. */
export async function getCommentThread(
  slug: string,
  startupId: string
): Promise<CommentWithAuthor[]> {
  const fixtureItems = COMMENT_FIXTURES[slug] ?? [];

  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("comments")
        .select(
          "id, startup_id, user_id, parent_id, content, is_founder_reply, created_at, updated_at, author:profiles(username, full_name, avatar_url, karma_score, role)"
        )
        .eq("startup_id", startupId)
        .order("created_at", { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data as unknown as CommentWithAuthor[];
      }
    } catch {
      // Fall through to fixtures + local demo store.
    }
  }

  const stored = await readCollection<StoredComment>(COLLECTION);
  const localItems = stored
    .filter((row) => row.startup_id === startupId)
    .map(storedToComment);

  return [...fixtureItems, ...localItems].sort((a, b) =>
    a.created_at.localeCompare(b.created_at)
  );
}

export interface NewCommentInput {
  startupId: string;
  authorName: string;
  content: string;
  isFounderReply: boolean;
  userId?: string | null;
}

export async function addComment(
  input: NewCommentInput
): Promise<CommentWithAuthor> {
  const authorName = input.authorName.trim();

  if (isSupabaseConfigured() && input.userId) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("comments")
        .insert({
          startup_id: input.startupId,
          user_id: input.userId,
          content: input.content,
          is_founder_reply: input.isFounderReply,
        })
        .select("id, startup_id, user_id, parent_id, content, is_founder_reply, created_at, updated_at")
        .single();

      if (!error && data) {
        return {
          ...(data as CommentWithAuthor),
          author: {
            username: authorName.toLowerCase().replace(/[^a-z0-9]+/g, ""),
            full_name: authorName,
            avatar_url: null,
            karma_score: 0,
            role: input.isFounderReply ? "founder" : "user",
          },
        };
      }
    } catch {
      // Fall through to the local demo store.
    }
  }

  const row: StoredComment = {
    id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    startup_id: input.startupId,
    content: input.content,
    author_name: authorName,
    is_founder_reply: input.isFounderReply,
    created_at: new Date().toISOString(),
  };

  await appendToCollection<StoredComment>(COLLECTION, row);

  return storedToComment(row);
}
