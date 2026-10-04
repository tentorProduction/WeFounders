/**
 * Promotion packages for featured launch spotlights and weekly placements.
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

