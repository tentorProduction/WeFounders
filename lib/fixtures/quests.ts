import type { QuestWithStartup } from "@/types/database";

import { getStartupBySlug } from "@/lib/fixtures/startups";

/**
 * Active testing-quest fixtures for the /quests board (PRD §4.1 "Should Have",
 * TRD §2 table 8, DESIGN.md §4.4).
 *
 * TODO(schema): once `supabase/schema.sql` is provisioned, read
 * `testing_quests` joined with `startups` instead.
 */

interface QuestFixtureInput {
  id: string;
  /** Slug of the startup that posted the quest. */
  startup: string;
  title: string;
  task_instructions: string;
  target_devices: string | null;
  reward_description: string | null;
  status?: "active" | "paused" | "completed";
  max_submissions: number;
  submissions_count: number;
  daysAgo: number;
}

export const QUEST_FIXTURES: QuestFixtureInput[] = [
  {
    id: "q-sajhapay-khalti-sandbox",
    startup: "sajhapay",
    title: "Run a full Khalti subscription cycle in sandbox",
    task_instructions:
      "Create a test subscription, pay it with the Khalti sandbox wallet, and confirm the invoice flips to Paid and the ledger row reconciles. Note any stall longer than 30 seconds.",
    target_devices: "Any browser · Ncell 4G or 3G",
    reward_description: "NPR 200 via Khalti",
    max_submissions: 20,
    submissions_count: 13,
    daysAgo: 1,
  },
  {
    id: "q-chhito-route-2g",
    startup: "chhito",
    title: "Stress-test rider routing on 2G in the Valley core",
    task_instructions:
      "Throttle to Slow 2G and reassign three deliveries across Kalimati–Baneshwor–Thamel. Screenshot the ETA drift and flag any route that silently drops a stop.",
    target_devices: "Android 10+ · NTC 4G fallback",
    reward_description: "NPR 300 via eSewa + 50 Karma",
    max_submissions: 15,
    submissions_count: 15,
    daysAgo: 2,
  },
  {
    id: "q-lekhani-tone-shift",
    startup: "lekhani",
    title: "Break the Nepali ↔ English tone-shift",
    task_instructions:
      "Shift three paragraphs of formal news copy to casual tone and back. Report every place where transliterated Roman Nepali leaks into the Devanagari output.",
    target_devices: "Any modern browser",
    reward_description: "50 Karma",
    max_submissions: 30,
    submissions_count: 21,
    daysAgo: 3,
  },
  {
    id: "q-agridristi-offline-redmi",
    startup: "agridristi",
    title: "Offline leaf diagnosis on a low-end Android",
    task_instructions:
      "With airplane mode on, diagnose five healthy and five diseased leaves on a Redmi 9A-class device. Report detection accuracy and how legible the Nepali labels feel for older farmers.",
    target_devices: "Android 8–11 · offline only",
    reward_description: "NPR 150 via Khalti",
    max_submissions: 12,
    submissions_count: 4,
    daysAgo: 4,
  },
  {
    id: "q-kothakotha-2g-map",
    startup: "kothakotha",
    title: "Hunt for broken listings on 2G outside the Ring Road",
    task_instructions:
      "Browse Kathmandu Valley room listings on a throttled 2G connection. Flag listings whose photos fail, prices render as NaN, or the landlord verification badge lies.",
    target_devices: "Android or iOS · 2G throttle",
    reward_description: "NPR 100 via eSewa",
    status: "paused",
    max_submissions: 25,
    submissions_count: 9,
    daysAgo: 5,
  },
  {
    id: "q-p2p-weighin-qr",
    startup: "p2p-nepal",
    title: "Scan the QR weigh-in at a real sabzi stall",
    task_instructions:
      "Use the QR weigh-in flow at any local vegetable stall and time it end to end. Screenshot the receipt and tell us whether the vendor could read the Nepali summary.",
    target_devices: "Android 9+ · camera required",
    reward_description: "50 Karma",
    max_submissions: 18,
    submissions_count: 2,
    daysAgo: 6,
  },
];

const now = Date.now();
const DAY_MS = 86_400_000;

/** All quests for the board — paused ones included so counts stay honest. */
export async function getQuestBoard(): Promise<QuestWithStartup[]> {
  const quests: QuestWithStartup[] = [];

  for (const fixture of QUEST_FIXTURES) {
    const startup = await getStartupBySlug(fixture.startup);
    if (!startup) continue;

    quests.push({
      id: fixture.id,
      startup_id: startup.id,
      title: fixture.title,
      task_instructions: fixture.task_instructions,
      target_devices: fixture.target_devices,
      reward_description: fixture.reward_description,
      status: fixture.status ?? "active",
      max_submissions: fixture.max_submissions,
      submissions_count: fixture.submissions_count,
      created_at: new Date(now - fixture.daysAgo * DAY_MS).toISOString(),
      updated_at: new Date(now - fixture.daysAgo * DAY_MS).toISOString(),
      startup: {
        id: startup.id,
        name: startup.name,
        slug: startup.slug,
        logo_url: startup.logo_url,
      },
    });
  }

  return quests;
}

export async function getQuestById(
  questId: string
): Promise<QuestWithStartup | null> {
  const board = await getQuestBoard();
  return board.find((quest) => quest.id === questId) ?? null;
}
