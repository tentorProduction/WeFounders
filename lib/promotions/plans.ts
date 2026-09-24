/**
 * Promotion packages sold to founders (PRD §4.1 monetization, TRD §4.1,
 * deployment guide §3). Prices are whole Nepali Rupees.
 */

export type PlanTier = "featured_48h" | "weekly_7d";

export interface PromotionPlan {
  tier: PlanTier;
  label: string;
  durationHours: number;
  priceNpr: number;
  blurb: string;
  perks: string[];
}

export const PROMOTION_PLANS: PromotionPlan[] = [
  {
    tier: "featured_48h",
    label: "Featured Spotlight",
    durationHours: 48,
    priceNpr: 1500,
    blurb: "Own the top of the feed for two days",
    perks: [
      "Glowing spotlight banner at the top of the discovery feed",
      "Promoted badge on your startup card",
      "48 hours of placement, starting the moment payment clears",
    ],
  },
  {
    tier: "weekly_7d",
    label: "Weekly Power Launch",
    durationHours: 168,
    priceNpr: 3500,
    blurb: "A full week of front-page presence",
    perks: [
      "Everything in Featured Spotlight, for 7 days",
      "Pinned to the top of the feed through the weekly batch",
      "Best for launch week pushes and waitlist sprints",
    ],
  },
];

export function getPlan(tier: string): PromotionPlan | undefined {
  return PROMOTION_PLANS.find((plan) => plan.tier === tier);
}

/** "NPR 1,500" */
export function formatPlanPrice(plan: PromotionPlan): string {
  return `NPR ${new Intl.NumberFormat("en-IN").format(plan.priceNpr)}`;
}

/** "48 hours" / "7 days" */
export function formatPlanDuration(plan: PromotionPlan): string {
  return plan.durationHours >= 24
    ? `${plan.durationHours / 24} days`
    : `${plan.durationHours} hours`;
}
