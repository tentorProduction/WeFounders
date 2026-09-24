import type { StartupMedia } from "@/types/database";

import { getStartupBySlug } from "@/lib/fixtures/startups";

/**
 * Gallery fixtures for the showcase pages (DESIGN.md §4.2).
 *
 * `media_url` is intentionally empty: the gallery renders a designed
 * placeholder panel until real screenshots are uploaded to Supabase Storage —
 * so the carousel works offline and never shows a broken image.
 */

interface MediaFixture {
  caption: string;
  mediaType?: StartupMedia["media_type"];
}

export const MEDIA_FIXTURES: Record<string, MediaFixture[]> = {
  sajhapay: [
    { caption: "Recurring invoice dashboard" },
    { caption: "eSewa checkout handoff" },
    { caption: "Khalti settlement ledger" },
    { caption: "Bank khata auto-reconciliation" },
  ],
  chhito: [
    { caption: "Rider route board (Valley)" },
    { caption: "COD reconciliation sheet" },
    { caption: "Khalti rider payout screen" },
  ],
  agridristi: [
    { caption: "Offline leaf diagnosis in Nepali" },
    { caption: "Pest history per plot" },
    { caption: "Sparrow SMS expert escalation" },
  ],
  lekhani: [
    { caption: "Bilingual draft editor" },
    { caption: "Tone-shift controls (Nepali ↔ English)" },
  ],
  "p2p-nepal": [
    { caption: "QR weigh-in scanner" },
    { caption: "Ward-level leaderboard" },
  ],
  kothakotha: [
    { caption: "2G-friendly map listings" },
    { caption: "Landlord verification flow" },
  ],
};

const DEFAULT_MEDIA: MediaFixture[] = [
  { caption: "Product walkthrough" },
  { caption: "Core workflow" },
];

export async function getStartupMedia(slug: string): Promise<StartupMedia[]> {
  const items = MEDIA_FIXTURES[slug] ?? DEFAULT_MEDIA;

  return items.map((item, index) => ({
    id: `${slug}-media-${index + 1}`,
    startup_id: slug,
    media_url: "",
    media_type: item.mediaType ?? "image",
    caption: item.caption,
    display_order: index,
    created_at: "2026-09-22T04:15:00Z",
  }));
}

/**
 * Optional YouTube/Loom demo — rendered as the first carousel slide.
 * Founders supply this in the submission wizard; the value is stored on
 * `startups.demo_video_url` and parsed by lib/video.ts at render time.
 */
export async function getStartupVideoUrl(slug: string): Promise<string | null> {
  const startup = await getStartupBySlug(slug);
  return startup?.demo_video_url ?? null;
}
