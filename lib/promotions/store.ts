import { randomUUID } from "node:crypto";
import { sql } from "@/lib/db/neon";
import { getPlan, type PlanTier } from "@/lib/promotions/plans";
import { getStartupById } from "@/lib/data/startups";
import type { PaymentProvider, Promotion, StartupWithTags } from "@/types/database";

/**
 * Promotions ledger (TRD §2 table 12, TRD §4 payment flows).
 *
 * Records a `pending` promotion when the founder starts checkout, then flips it
 * to `completed` — and activates the startup's featured placement — only after
 * the gateway callback has been verified. Neon is the only store.
 *
 * Every function here is server-only. The ledger must not be forgeable from a
 * browser, so nothing in this module may ever be called from a client
 * component: only verified gateway callbacks (which run server-side) may move
 * money state.
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

  const rows = (await sql`
    insert into promotions (
      startup_id, founder_id, amount_npr, provider,
      reference_id, plan_tier, status
    )
    values (
      ${input.startupId}::uuid,
      ${input.founderId}::uuid,
      ${plan.priceNpr},
      ${input.provider},
      ${makeReference(slug)},
      ${input.planTier},
      'pending'
    )
    returning *
  `) as unknown as Promotion[];

  const promotion = rows[0];
  if (!promotion) throw new Error("Could not open a payment record.");
  return promotion;
}

export async function getPromotionByReference(
  referenceId: string
): Promise<Promotion | null> {
  if (!referenceId) return null;

  const rows = (await sql`
    select * from promotions where reference_id = ${referenceId} limit 1
  `) as unknown as Promotion[];

  return rows[0] ?? null;
}

/** Bind a gateway intent to exactly one pending promotion before redirecting. */
export async function bindPaymentIntent(referenceId: string, pidx: string): Promise<void> {
  if (!referenceId || referenceId.length > 100 || !pidx || pidx.length > 160) {
    throw new Error("Invalid payment intent.");
  }
  const rows = (await sql`
    update promotions
    set payment_intent_id = ${pidx}
    where reference_id = ${referenceId}
      and provider = 'khalti'
      and status = 'pending'
      and payment_intent_id is null
    returning id
  `) as { id: string }[];

  if (!rows[0]) throw new Error("Payment intent could not be attached to this promotion.");
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

  const completed = (await sql`
    update promotions
    set status = 'completed',
        transaction_id = ${transactionId ?? promotion.transaction_id},
        verified_at = ${verifiedAt}
    where reference_id = ${referenceId}
      and provider = ${provider}
      and status = 'pending'
    returning *
  `) as unknown as Promotion[];

  // No row means a concurrent callback already completed it.
  if (!completed[0]) return getPromotionByReference(referenceId);

  try {
    await sql`
      update startups
      set is_featured = true, featured_until = ${until}
      where id = ${promotion.startup_id}::uuid
    `;
  } catch (featureError) {
    // The payment is recorded; the placement can be retried by an operator.
    console.error("[promotions] could not activate featured slot:", featureError);
  }

  return completed[0];
}

export async function failPromotion(referenceId: string): Promise<void> {
  const promotion = await getPromotionByReference(referenceId);
  if (!promotion || promotion.status === "completed") return;

  try {
    await sql`
      update promotions set status = 'failed' where reference_id = ${referenceId}
    `;
  } catch (error) {
    console.error("[promotions] could not mark promotion failed:", error);
  }
}

/** The latest promotion row for a startup (any status), if any. */
export async function getLatestPromotion(
  startupId: string
): Promise<Promotion | null> {
  if (!startupId) return null;

  const rows = (await sql`
    select * from promotions
    where startup_id = ${startupId}::uuid
    order by created_at desc
    limit 1
  `) as unknown as Promotion[];

  return rows[0] ?? null;
}

export interface ActiveFeatured {
  promotion: Promotion;
  startup: StartupWithTags;
  until: Date;
}

/** The completed, unexpired promotion that currently owns the spotlight. */
export async function getActiveFeatured(): Promise<ActiveFeatured | null> {
  const rows = (await sql`
    select * from promotions
    where status = 'completed'
    order by verified_at desc
    limit 1
  `) as unknown as Promotion[];

  const promotion = rows[0] ?? null;
  if (!promotion) return null;

  const until = expiryOf(promotion);
  if (!until || until.getTime() <= Date.now()) return null;

  const startup = await getStartupById(promotion.startup_id);
  if (!startup) return null;

  return { promotion, startup, until };
}
