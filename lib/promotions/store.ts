import { randomUUID } from "node:crypto";
import { sql } from "@/lib/db/neon";
import type { PlanTier } from "@/lib/promotions/plans";
import { getPlan } from "@/lib/promotions/catalog";
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
  if (!promotion.verified_at) return null;
  return new Date(
    new Date(promotion.verified_at).getTime() + promotion.duration_hours * 3_600_000
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
  const plan = await getPlan(input.planTier);
  if (!plan || plan.priceNpr !== input.amountNpr) {
    throw new Error("Promotion amount does not match its plan tier.");
  }

  const slug = (await getStartupById(input.startupId))?.slug ?? "startup";

  const rows = (await sql`
    insert into promotions (
      startup_id, founder_id, amount_npr, provider,
      reference_id, plan_tier, status, duration_hours
    )
    values (
      ${input.startupId}::uuid,
      ${input.founderId}::uuid,
      ${plan.priceNpr},
      ${input.provider},
      ${makeReference(slug)},
      ${input.planTier},
      'pending',${plan.durationHours}
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

  const verifiedAt = new Date().toISOString();
  const until = new Date(
    Date.now() + promotion.duration_hours * 3_600_000
  ).toISOString();

  const completed = (await sql`
    with paid as (update promotions
    set status = 'completed',
        transaction_id = ${transactionId ?? promotion.transaction_id},
        verified_at = ${verifiedAt}
    where reference_id = ${referenceId}
      and provider = ${provider}
      and status = 'pending'
    returning *), featured as (update startups set is_featured=true,featured_until=${until} from paid where startups.id=paid.startup_id returning startups.id)
    select paid.* from paid join featured on featured.id=paid.startup_id
  `) as unknown as Promotion[];

  // No row means a concurrent callback already completed it.
  if (!completed[0]) return getPromotionByReference(referenceId);

  return completed[0];
}

export async function failPromotion(referenceId: string): Promise<void> {
  const promotion = await getPromotionByReference(referenceId);
  if (!promotion || promotion.status === "completed") return;

  await sql`update promotions set status='failed' where reference_id=${referenceId} and status='pending'`;
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
    select p.* from promotions p join startups s on s.id=p.startup_id
    where p.status = 'completed' and s.status='approved' and s.archived_at is null and s.launch_date<=now()
      and p.verified_at+p.duration_hours*interval '1 hour'>now()
    order by p.verified_at desc
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


