import { readCollection, replaceCollection } from "@/lib/demo-store";
import { isSupabaseConfigured } from "@/lib/supabase/environment";
import { getPlan, type PlanTier } from "@/lib/promotions/plans";
import { getStartupById } from "@/lib/fixtures/startups";
import type { PaymentProvider, Promotion, StartupWithTags } from "@/types/database";

/**
 * Promotions ledger (TRD §2 table 11, TRD §4 payment flows).
 *
 * Records a `pending` promotion when the founder starts checkout, then flips
 * it to `completed` — and sets `startups.is_featured` / `featured_until` —
 * only after the gateway callback has been verified. Reads/writes Supabase
 * when configured, with a local `.data/promotions.json` fallback so the whole
 * flow is testable before the schema is provisioned.
 */

const COLLECTION = "promotions";

function makeReference(slug: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `promo-${slug.slice(0, 12)}-${Date.now().toString(36)}-${rand}`;
}

function expiryOf(promotion: Promotion): Date | null {
  const plan = getPlan(promotion.plan_tier);
  if (!plan || !promotion.verified_at) return null;
  return new Date(
    new Date(promotion.verified_at).getTime() + plan.durationHours * 3_600_000
  );
}

/* ------------------------------------------------------------------ */
/* Local (demo) persistence                                            */
/* ------------------------------------------------------------------ */

async function readLocal(): Promise<Promotion[]> {
  return readCollection<Promotion>(COLLECTION);
}

async function writeLocal(promotion: Promotion): Promise<void> {
  const rows = await readLocal();
  const index = rows.findIndex((row) => row.reference_id === promotion.reference_id);
  const next =
    index >= 0
      ? rows.map((row, i) => (i === index ? promotion : row))
      : [...rows, promotion];
  await replaceCollection(COLLECTION, next);
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

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
  const slug = (await getStartupById(input.startupId))?.slug ?? "startup";
  const promotion: Promotion = {
    id: `pm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    startup_id: input.startupId,
    founder_id: input.founderId,
    amount_npr: input.amountNpr,
    provider: input.provider,
    transaction_id: null,
    reference_id: makeReference(slug),
    plan_tier: input.planTier,
    status: "pending",
    verified_at: null,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("promotions")
        .insert({
          startup_id: input.startupId,
          founder_id: input.founderId,
          amount_npr: input.amountNpr,
          provider: input.provider,
          reference_id: promotion.reference_id,
          plan_tier: input.planTier,
          status: "pending",
        })
        .select()
        .single();
      if (!error && data) return data as Promotion;
    } catch {
      // Fall through to the local store.
    }
  }

  await writeLocal(promotion);
  return promotion;
}

export async function getPromotionByReference(
  referenceId: string
): Promise<Promotion | null> {
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("promotions")
        .select()
        .eq("reference_id", referenceId)
        .maybeSingle();
      if (!error && data) return data as Promotion;
    } catch {
      // Fall through to the local store.
    }
  }
  const rows = await readLocal();
  return rows.find((row) => row.reference_id === referenceId) ?? null;
}

/**
 * Mark a verified payment as completed and activate the startup's featured
 * placement until the plan's duration elapses. Idempotent: an already
 * completed promotion is returned unchanged.
 */
export async function completePromotion(
  referenceId: string,
  transactionId: string | null
): Promise<Promotion | null> {
  const promotion = await getPromotionByReference(referenceId);
  if (!promotion) return null;
  if (promotion.status === "completed") return promotion;

  const completed: Promotion = {
    ...promotion,
    status: "completed",
    transaction_id: transactionId ?? promotion.transaction_id,
    verified_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const plan = getPlan(completed.plan_tier);
      const until = new Date(
        Date.now() + (plan?.durationHours ?? 48) * 3_600_000
      ).toISOString();

      await supabase
        .from("promotions")
        .update({
          status: "completed",
          transaction_id: completed.transaction_id,
          verified_at: completed.verified_at,
        })
        .eq("reference_id", referenceId);

      await supabase
        .from("startups")
        .update({ is_featured: true, featured_until: until })
        .eq("id", completed.startup_id);

      return completed;
    } catch {
      // Fall through to the local store.
    }
  }

  await writeLocal(completed);
  return completed;
}

export async function failPromotion(referenceId: string): Promise<void> {
  const promotion = await getPromotionByReference(referenceId);
  if (!promotion || promotion.status === "completed") return;

  const failed: Promotion = { ...promotion, status: "failed" };

  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const { error } = await supabase
        .from("promotions")
        .update({ status: "failed" })
        .eq("reference_id", referenceId);
      if (!error) return;
    } catch {
      // Fall through to the local store.
    }
  }

  await writeLocal(failed);
}

/** The latest promotion row for a startup (any status), if any. */
export async function getLatestPromotion(
  startupId: string
): Promise<Promotion | null> {
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("promotions")
        .select()
        .eq("startup_id", startupId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error) return (data as Promotion) ?? null;
    } catch {
      // Fall through to the local store.
    }
  }
  const rows = await readLocal();
  return (
    rows
      .filter((row) => row.startup_id === startupId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ?? null
  );
}

export interface ActiveFeatured {
  promotion: Promotion;
  startup: StartupWithTags;
  until: Date;
}

/**
 * The completed, unexpired promotion that currently owns the featured
 * spotlight — used by the homepage to override the fixture-featured startup.
 * In Supabase mode `startups.is_featured` is authoritative; locally we derive
 * the active window from the ledger.
 */
export async function getActiveFeatured(): Promise<ActiveFeatured | null> {
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("promotions")
        .select()
        .eq("status", "completed")
        .order("verified_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const promotion = (data as Promotion) ?? null;
      if (!error && promotion) {
        const startup = await getStartupById(promotion.startup_id);
        const until = expiryOf(promotion);
        if (startup && until && until.getTime() > Date.now()) {
          return { promotion, startup, until };
        }
        return null;
      }
    } catch {
      // Fall through to the local store.
    }
  }

  const rows = await readLocal();
  for (const promotion of rows
    .filter((row) => row.status === "completed")
    .sort((a, b) =>
      (b.verified_at ?? "").localeCompare(a.verified_at ?? "")
    )) {
    const until = expiryOf(promotion);
    if (!until || until.getTime() <= Date.now()) continue;
    const startup = await getStartupById(promotion.startup_id);
    if (startup) return { promotion, startup, until };
  }
  return null;
}
