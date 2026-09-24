import type { StartupWithTags, Tag } from "@/types/database";

/**
 * Demo dataset for the discovery feed (PRD §4.1).
 *
 * TODO(schema): once `supabase/schema.sql` is provisioned, swap
 * getStartupFeed()/getFeaturedStartup() for Supabase queries — the feed UI
 * doesn't need to change.
 */

function makeTag(name: string, slug: string, category: Tag["category"]): Tag {
  return { id: `tag-${slug}`, name, slug, category };
}

const TAGS = {
  fintech: makeTag("Fintech", "fintech", "industry"),
  agritech: makeTag("Agritech", "agritech", "industry"),
  climate: makeTag("Climate", "climate", "industry"),
  legaltech: makeTag("Legaltech", "legaltech", "industry"),
  logistics: makeTag("Logistics", "logistics", "industry"),
  retail: makeTag("Retail", "retail", "industry"),
  ai: makeTag("AI/ML", "ai-ml", "stack"),
  devtools: makeTag("DevTools", "devtools", "stack"),
  nextjs: makeTag("Next.js", "next-js", "stack"),
  supabase: makeTag("Supabase", "supabase", "stack"),
  firebase: makeTag("Firebase", "firebase", "stack"),
  flutter: makeTag("Flutter", "flutter", "stack"),
  esewa: makeTag("eSewa", "esewa", "payment"),
  khalti: makeTag("Khalti", "khalti", "payment"),
  fonepay: makeTag("Fonepay", "fonepay", "payment"),
  sparrow: makeTag("Sparrow SMS", "sparrow-sms", "telecom"),
  ntc: makeTag("NTC/Ncell Ready", "ntc-ncell", "telecom"),
  devanagari: makeTag("Devanagari UI", "devanagari-ui", "industry"),
  offline: makeTag("Offline First", "offline-first", "industry"),
};

type FixtureInput = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  stage: StartupWithTags["stage"];
  market: StartupWithTags["target_market"];
  upvotes: number;
  waitlist: number;
  comments: number;
  tags: Tag[];
  isFeatured?: boolean;
  launchDate?: string;
  /** Founder-supplied YouTube or Loom walkthrough (parsed by lib/video.ts). */
  demoVideoUrl?: string;
};

function makeStartup(input: FixtureInput): StartupWithTags {
  const launchDate = input.launchDate ?? "2026-09-22";

  return {
    id: input.id,
    founder_id: `founder-${input.slug}`,
    slug: input.slug,
    name: input.name,
    tagline: input.tagline,
    description: input.description,
    website_url: input.websiteUrl,
    demo_video_url: input.demoVideoUrl ?? null,
    logo_url: "",
    banner_url: null,
    stage: input.stage,
    target_market: input.market,
    status: "approved",
    launch_date: launchDate,
    upvotes_count: input.upvotes,
    comments_count: input.comments,
    waitlist_count: input.waitlist,
    is_featured: Boolean(input.isFeatured),
    featured_until: null,
    created_at: `${launchDate}T04:15:00Z`, // 10:00 NPT
    updated_at: `${launchDate}T04:15:00Z`,
    tags: input.tags,
  };
}

export const STARTUP_FIXTURES: StartupWithTags[] = [
  makeStartup({
    id: "st-chhito",
    slug: "chhito",
    name: "Chhito",
    tagline: "Same-day delivery routing built for Kathmandu's galli network",
    description:
      "Route optimisation and COD reconciliation for small delivery fleets. Handles NTC/Ncell reachability, cash-on-delivery ledgering and Khalti settlement for riders across the Valley.",
    websiteUrl: "https://chhito.dev",
    stage: "launched",
    market: "nepal_domestic",
    upvotes: 112,
    waitlist: 88,
    comments: 26,
    tags: [TAGS.logistics, TAGS.khalti, TAGS.ntc, TAGS.nextjs],
  }),
  makeStartup({
    id: "st-sajhapay",
    slug: "sajhapay",
    name: "SajhaPay",
    tagline: "One-click recurring billing for Nepali freelancers and micro-businesses",
    description:
      "Generate invoices, collect subscriptions over eSewa and Khalti, and auto-reconcile with your bank khata. Built for freelancers billing foreign clients and shops running monthly sajha subscriptions.",
    websiteUrl: "https://sajhapay.dev",
    stage: "public_beta",
    market: "nepal_domestic",
    upvotes: 84,
    waitlist: 320,
    comments: 18,
    tags: [TAGS.fintech, TAGS.esewa, TAGS.khalti, TAGS.nextjs, TAGS.supabase],
    isFeatured: true,
    demoVideoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
  }),
  makeStartup({
    id: "st-lekhani",
    slug: "lekhani",
    name: "Lekhani",
    tagline: "Bilingual AI writing copilot for Nepali and English",
    description:
      "Draft, translate and tone-shift between Nepali and English without losing meaning. Trained on Devanagari typography rules so output is publish-ready for Nepali media houses.",
    websiteUrl: "https://lekhani.dev",
    stage: "public_beta",
    market: "global_export",
    upvotes: 76,
    waitlist: 402,
    comments: 31,
    tags: [TAGS.ai, TAGS.devanagari, TAGS.nextjs],
    demoVideoUrl:
      "https://www.loom.com/share/473fad25ebd24b5ea8091503253dfecf",
  }),
  makeStartup({
    id: "st-agridristi",
    slug: "agridristi",
    name: "AgriDristi",
    tagline: "AI pest detection for Terai paddy farmers — works offline over 3G",
    description:
      "Point your phone at a sick paddy leaf and get an instant diagnosis in Nepali. Runs fully offline on low-end Android, syncs when network returns, and escalates to Krishi experts over Sparrow SMS.",
    websiteUrl: "https://agridristi.dev",
    stage: "public_beta",
    market: "nepal_domestic",
    upvotes: 67,
    waitlist: 210,
    comments: 22,
    tags: [TAGS.agritech, TAGS.ai, TAGS.offline, TAGS.devanagari, TAGS.sparrow],
  }),
  makeStartup({
    id: "st-sunwai",
    slug: "sunwai",
    name: "Sunwai",
    tagline: "Nepali speech-to-text API for BPOs and call centres",
    description:
      "Transcribe Nepali and Nepanglish calls in real time, score agent quality automatically, and export compliance-ready transcripts for Kathmandu's growing BPO industry.",
    websiteUrl: "https://sunwai.dev",
    stage: "closed_alpha",
    market: "hybrid",
    upvotes: 63,
    waitlist: 87,
    comments: 12,
    tags: [TAGS.ai, TAGS.devtools, TAGS.supabase],
  }),
  makeStartup({
    id: "st-kothakotha",
    slug: "kothakotha",
    name: "KothaKotha",
    tagline: "Verified room and flat listings with a map that loads on 2G",
    description:
      "No brokers, no fake photos. Landlord identity checks, lightweight map tiles that work on 2G, and eSewa token payments to reserve a room for 48 hours.",
    websiteUrl: "https://kothakotha.dev",
    stage: "public_beta",
    market: "nepal_domestic",
    upvotes: 58,
    waitlist: 143,
    comments: 19,
    tags: [TAGS.esewa, TAGS.flutter, TAGS.offline],
  }),
  makeStartup({
    id: "st-himalaya-analytics",
    slug: "himalaya-analytics",
    name: "Himalaya Analytics",
    tagline: "Retail analytics for kirana stores from the POS they already own",
    description:
      "Plug in your existing billing printer or POS and see which SKUs actually move, what to reorder before Dashain, and which customers are running a khata tab.",
    websiteUrl: "https://himalaya-analytics.dev",
    stage: "public_beta",
    market: "nepal_domestic",
    upvotes: 47,
    waitlist: 119,
    comments: 9,
    tags: [TAGS.retail, TAGS.esewa, TAGS.supabase],
    launchDate: "2026-09-21",
  }),
  makeStartup({
    id: "st-p2p-nepal",
    slug: "p2p-nepal",
    name: "P2P Nepal",
    tagline: "Track and trade recyclable plastic with the kolektas in your ward",
    description:
      "Weigh, log and sell recyclable plastic directly to verified reprocessors. Ward-level leaderboards, Fonepay payouts, and a QR scanner tested on low-end Android phones.",
    websiteUrl: "https://p2pnepal.dev",
    stage: "closed_alpha",
    market: "nepal_domestic",
    upvotes: 41,
    waitlist: 96,
    comments: 14,
    tags: [TAGS.climate, TAGS.fonepay, TAGS.firebase, TAGS.offline],
    launchDate: "2026-09-21",
  }),
  makeStartup({
    id: "st-shabdakit",
    slug: "shabdakit",
    name: "ShabdaKit",
    tagline: "Devanagari-first i18n toolkit for web apps",
    description:
      "Type-safe translation keys, plural rules and font-loading presets tuned for Devanagari. Ships as an npm package for Next.js and Astro teams building bilingual products.",
    websiteUrl: "https://shabdakit.dev",
    stage: "concept",
    market: "global_export",
    upvotes: 35,
    waitlist: 61,
    comments: 7,
    tags: [TAGS.devtools, TAGS.devanagari, TAGS.nextjs],
  }),
  makeStartup({
    id: "st-nyaya-ai",
    slug: "nyaya-ai",
    name: "NyayaAI",
    tagline: "Nepali-first legal research assistant for advocates and courts",
    description:
      "Search Nepali statutes and precedent decisions in either language, get citation-backed summaries, and draft applications with the correct Nepal Government formatting.",
    websiteUrl: "https://nyayaai.dev",
    stage: "concept",
    market: "nepal_domestic",
    upvotes: 29,
    waitlist: 54,
    comments: 11,
    tags: [TAGS.legaltech, TAGS.ai, TAGS.devanagari, TAGS.supabase],
  }),
];

/** Feed = today's approved launches, newest + most upvoted first. */
export async function getStartupFeed(): Promise<StartupWithTags[]> {
  return [...STARTUP_FIXTURES].sort((a, b) => b.upvotes_count - a.upvotes_count);
}

/** The promoted slot rendered by FeaturedSpotlight. */
export async function getFeaturedStartup(): Promise<StartupWithTags | null> {
  return STARTUP_FIXTURES.find((startup) => startup.is_featured) ?? null;
}

/**
 * Single startup lookup for the showcase route (PRD Flow 1).
 * Matches on slug first, then id, and finally tolerates a case-insensitive
 * slug so hand-typed URLs like /startups/Chhito still resolve.
 */
export async function getStartupBySlug(
  slug: string,
): Promise<StartupWithTags | null> {
  const needle = decodeURIComponent(slug).trim().toLowerCase();

  return (
    STARTUP_FIXTURES.find((startup) => startup.slug === needle) ??
    STARTUP_FIXTURES.find((startup) => startup.id === needle) ??
    STARTUP_FIXTURES.find((startup) => startup.name.toLowerCase() === needle) ??
    null
  );
}

export async function getStartupById(
  id: string,
): Promise<StartupWithTags | null> {
  return STARTUP_FIXTURES.find((startup) => startup.id === id) ?? null;
}

/** Unique ecosystem tags across the feed — used for filter suggestions. */
export function getAllTags(): Tag[] {
  const seen = new Map<string, Tag>();
  for (const startup of STARTUP_FIXTURES) {
    for (const tag of startup.tags) {
      if (!seen.has(tag.slug)) seen.set(tag.slug, tag);
    }
  }
  return [...seen.values()];
}
