import type { CollabPost, CollabType } from "@/types/database";

/**
 * Collab & co-founder board fixtures (TRD §2 table 10, DESIGN.md §4.5).
 *
 * TODO(schema): once `supabase/schema.sql` is provisioned, read
 * `collab_posts` joined with `profiles` instead. Store-submitted posts are
 * persisted through lib/collab/store (demo-safe, same as the waitlist).
 */

export type CollabPostWithAuthor = CollabPost & {
  author_name: string;
  author_username: string;
  /** Linked startup name when the listing is attached to a launch. */
  startup_name: string | null;
  startup_slug: string | null;
};

interface CollabFixtureInput {
  id: string;
  title: string;
  role_type: CollabType;
  description: string;
  equity_or_compensation: string | null;
  /** WhatsApp link, Telegram handle, or mailto — rendered as a direct trigger. */
  contact_channel: string;
  is_active?: boolean;
  startup?: { name: string; slug: string } | null;
  author_name: string;
  author_username: string;
  daysAgo: number;
}

export const COLLAB_FIXTURES: CollabFixtureInput[] = [
  {
    id: "cb-sajhapay-founding-engineer",
    title: "Founding engineer to own the eSewa/Khalti billing core",
    role_type: "founding_engineer",
    description:
      "SajhaPay reconciles thousands of micro-subscriptions across two wallets and a bank. You'd own the payment rails end to end — idempotent webhooks, settlement ledgers, and the boring reliability work that keeps freelancers paid. TypeScript + Postgres; prior fintech experience welcome but not required.",
    equity_or_compensation: "2–4% equity · or NPR 60,000/mo",
    contact_channel: "https://wa.me/9779812345678",
    startup: { name: "SajhaPay", slug: "sajhapay" },
    author_name: "Sunita Maharjan",
    author_username: "sunita",
    daysAgo: 1,
  },
  {
    id: "cb-lekhani-cofounder",
    title: "Co-founder (growth) for a bilingual AI writing tool",
    role_type: "cofounder",
    description:
      "Lekhani writes publish-ready Nepali for media houses. The model works; distribution doesn't exist yet. Looking for a co-founder who has sold to Nepali newsrooms or agencies and can own pricing, partnerships and the launch funnel.",
    equity_or_compensation: "30–40% equity (real, vesting)",
    contact_channel: "t.me/lekhani_ai",
    startup: { name: "Lekhani", slug: "lekhani" },
    author_name: "Nikita Rana",
    author_username: "nikitarana",
    daysAgo: 2,
  },
  {
    id: "cb-chhito-designer",
    title: "UI/UX reviewer for rider-mode flows",
    role_type: "designer",
    description:
      "Our rider route board works, but riders still miss stops in the sun. Need a designer to audit the 4 core flows (accept, navigate, deliver, reconcile) on mid-range Androids and hand us a prioritized fix list — not a 40-page deck.",
    equity_or_compensation: "NPR 15,000 fixed per audit",
    contact_channel: "mailto:founders@chhito.example.com",
    startup: { name: "Chhito", slug: "chhito" },
    author_name: "Prabin Tamang",
    author_username: "prabin",
    daysAgo: 2,
  },
  {
    id: "cb-agridristi-beta-testers",
    title: "Beta testers in Chitwan & Terai — offline crop diagnosis",
    role_type: "beta_tester",
    description:
      "AgriDrishti diagnoses crop disease offline in Nepali. We need farmers and agri-extension folks around Chitwan to test on real plots with real network holes. 15 minutes per week; you keep the free subscription.",
    equity_or_compensation: "Free Pro subscription + NPR 50 top-up per report",
    contact_channel: "https://wa.me/9779845000111",
    startup: { name: "AgriDrishti", slug: "agridristi" },
    author_name: "Deepak Chaudhary",
    author_username: "deepakc",
    daysAgo: 3,
  },
  {
    id: "cb-kothakotha-intern",
    title: "Frontend intern — map listings that survive 2G",
    role_type: "intern",
    description:
      "KothaKotha lists rooms across the Valley on throttled networks. You'd ship real UI weekly: virtualized listing feeds, offline-tolerant image loading, and the landlord verification flow. Great first job for a 3rd-year CS student.",
    equity_or_compensation: "NPR 12,000/mo stipend · remote",
    contact_channel: "t.me/kothakotha_jobs",
    startup: { name: "KothaKotha", slug: "kothakotha" },
    author_name: "Bhawana Shrestha",
    author_username: "bhawana",
    daysAgo: 4,
  },
  {
    id: "cb-p2p-nepal-cofounder",
    title: "Technical co-founder for a marketplace that pays in QR",
    role_type: "cofounder",
    description:
      "P2P Nepal connects sabzi vendors to ward-level buyers with QR weigh-ins. Non-technical founder with vendor relationships across 6 wards needs an engineer who wants to own the entire product. This is a ground-floor, sweat-equity role.",
    equity_or_compensation: "50% equity split",
    contact_channel: "mailto:hello@p2pnepal.example.com",
    startup: null,
    author_name: "Ramesh Karki",
    author_username: "ramesh",
    daysAgo: 5,
  },
  {
    id: "cb-sajhapay-closed",
    title: "Community moderator (closed)",
    role_type: "beta_tester",
    description:
      "Filled within a day via the board — keeping the listing visible so new founders see what a closed post looks like.",
    equity_or_compensation: null,
    contact_channel: "mailto:community@sajhapay.example.com",
    startup: { name: "SajhaPay", slug: "sajhapay" },
    author_name: "Sunita Maharjan",
    author_username: "sunita",
    is_active: false,
    daysAgo: 8,
  },
];

const now = Date.now();
const DAY_MS = 86_400_000;

/** Board listings — active posts first, newest first. */
export async function getCollabBoard(): Promise<CollabPostWithAuthor[]> {
  return COLLAB_FIXTURES.map((fixture) => ({
    id: fixture.id,
    startup_id: fixture.startup?.slug ?? null,
    author_id: `author-${fixture.author_username}`,
    title: fixture.title,
    role_type: fixture.role_type,
    description: fixture.description,
    equity_or_compensation: fixture.equity_or_compensation,
    contact_channel: fixture.contact_channel,
    is_active: fixture.is_active ?? true,
    created_at: new Date(now - fixture.daysAgo * DAY_MS).toISOString(),
    author_name: fixture.author_name,
    author_username: fixture.author_username,
    startup_name: fixture.startup?.name ?? null,
    startup_slug: fixture.startup?.slug ?? null,
  })).sort(
    (a, b) =>
      Number(b.is_active) - Number(a.is_active) ||
      b.created_at.localeCompare(a.created_at)
  );
}
