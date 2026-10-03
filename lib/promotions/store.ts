import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlan, type PlanTier } from "@/lib/promotions/plans";
import { getStartupById } from "@/lib/data/startups";
import type { PaymentProvider, Promotion, StartupWithTags } from "@/types/database";

/**
 * Promotions ledger (TRD §2 table 12, TRD §4 payment flows).
 *
 * Records a `pending` promotion when the founder starts checkout, then flips it
 * to `completed` — and activates the startup's featured placement — only after
 * the gateway callback has been verified. Supabase is the only store.
 *
 * Every write here goes through the service-role client: the ledger must not be
 * forgeable from a browser, so no insert/update policy exists for it and only
 * verified gateway callbacks (which run server-side) may move money state.
 */

function makeReference(slug: string): string {
  return `promo-${slug.slice(0, 12)}-${randomUUID()}`;
}

function expiryOf(promotion: Promotion): Date | null {
  const plan = getPlan(promotion.plan_tier);
  if (!plan || !promotion.verified_at) return null;
  return new Date(
    new Date(promotion.verified_at).getTime() + plan.durationHours * 3_600_000
  );
}

export interface CreatePromotionInput {
  startupId: string;
  founderId: string;
  planTier: PlanTier;
  amountNpr: number;
  provider: PaymentProvider;
}

export async function createPendingPromotion(
  input: CreatePromotionInput
): Promise<Promotion> {
  // The ledger price comes from the tier, never from the caller: both gateway
  // callbacks compare the verified amount against this row, so a caller-supplied
  // amount would let a founder buy a 7-day placement for less.
  const plan = getPlan(input.planTier);
  if (!plan || plan.priceNpr !== input.amountNpr) {
    throw new Error("Promotion amount does not match its plan tier.");
  }

  const slug = (await getStartupById(input.startupId))?.slug ?? "startup";
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("promotions")
    .insert({
      startup_id: input.startupId,
      founder_id: input.founderId,
      amount_npr: plan.priceNpr,
      provider: input.provider,
      reference_id: makeReference(slug),
      plan_tier: input.planTier,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw new Error(`Could not open a payment record: ${error.message}`);
  return data as Promotion;
}

export async function getPromotionByReference(
  referenceId: string
): Promise<Promotion | null> {
  if (!referenceId) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .eq("reference_id", referenceId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[promotions] lookup failed:", error);
    return null;
  }
  return (data as Promotion) ?? null;
}

/** Bind a gateway intent to exactly one pending promotion before redirecting. */
export async function bindPaymentIntent(referenceId: string, pidx: string): Promise<void> {
  if (!referenceId || referenceId.length > 100 || !pidx || pidx.length > 160) {
    throw new Error("Invalid payment intent.");
  }
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("promotions")
    .update({ payment_intent_id: pidx })
    .eq("reference_id", referenceId)
    .eq("provider", "khalti")
    .eq("status", "pending")
    .is("payment_intent_id", null)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(`Could not attach payment intent: ${error.message}`);
  if (!data) throw new Error("Payment intent could not be attached to this promotion.");
}

/**
 * Mark a verified payment as completed and activate the startup's featured
 * placement until the plan's duration elapses. Idempotent: an already
 * completed promotion is returned unchanged.
 */
export async function completePromotion(
  referenceId: string,
  transactionId: string | null,
  provider: PaymentProvider,
): Promise<Promotion | null> {
  const promotion = await getPromotionByReference(referenceId);
  if (!promotion || promotion.provider !== provider || promotion.status !== "pending") return null;

  const supabase = createAdminClient();
  const plan = getPlan(promotion.plan_tier);
  if (!plan) {
    // Never grant a guessed duration for a tier we do not recognise.
    console.error(`[promotions] unknown plan tier "${promotion.plan_tier}" for ${referenceId}`);
    return null;
  }
  const verifiedAt = new Date().toISOString();
  const until = new Date(
    Date.now() + plan.durationHours * 3_600_000
  ).toISOString();

  const { data, error } = await supabase
    .from("promotions")
    .update({
      status: "completed",
      transaction_id: transactionId ?? promotion.transaction_id,
      verified_at: verifiedAt,
    })
    .eq("reference_id", referenceId)
    .eq("provider", provider)
    .eq("status", "pending")
    .select()
    .maybeSingle();

  if (error) {
    console.error("[promotions] could not complete promotion:", error);
    return null;
  }
  if (!data) return getPromotionByReference(referenceId);

  const { error: featureError } = await supabase
    .from("startups")
    .update({ is_featured: true, featured_until: until })
    .eq("id", promotion.startup_id);

  if (featureError) {
    // The payment is recorded; the placement can be retried by an operator.
    console.error("[promotions] could not activate featured slot:", featureError);
  }

  return data as Promotion;
}

export async function failPromotion(referenceId: string): Promise<void> {
  const promotion = await getPromotionByReference(referenceId);
  if (!promotion || promotion.status === "completed") return;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("promotions")
    .update({ status: "failed" })
    .eq("reference_id", referenceId);

  if (error) console.error("[promotions] could not mark promotion failed:", error);
}

/** The latest promotion row for a startup (any status), if any. */
export async function getLatestPromotion(
  startupId: string
): Promise<Promotion | null> {
  if (!startupId) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .eq("startup_id", startupId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[promotions] latest lookup failed:", error);
    return null;
  }
  return (data as Promotion) ?? null;
}

export interface ActiveFeatured {
  promotion: Promotion;
  startup: StartupWithTags;
  until: Date;
}

/** The completed, unexpired promotion that currently owns the spotlight. */
export async function getActiveFeatured(): Promise<ActiveFeatured | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .eq("status", "completed")
    .order("verified_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[promotions] featured lookup failed:", error);
    return null;
  }

  const promotion = (data as Promotion) ?? null;
  if (!promotion) return null;

  const until = expiryOf(promotion);
  if (!until || until.getTime() <= Date.now()) return null;

  const startup = await getStartupById(promotion.startup_id);
  if (!startup) return null;

  return { promotion, startup, until };
}
