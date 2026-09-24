import { NextResponse } from "next/server";

import { getStartupBySlug } from "@/lib/fixtures/startups";
import { getPlan } from "@/lib/promotions/plans";
import { createPendingPromotion } from "@/lib/promotions/store";
import { isKhaltiSimulated } from "@/lib/payments/config";
import { initiateKhaltiPayment } from "@/lib/payments/khalti";
import { readPaymentRequest } from "@/lib/payments/request";

/**
 * Khalti ePay v2 initiation (TRD §4.1, deployment guide §3.2).
 *
 * Creates the pending promotion, then either:
 *  - redirects to Khalti's hosted `payment_url` (real sandbox or live), or
 *  - redirects to the local simulated gateway page when sandbox mode is on
 *    and no KHALTI_SECRET_KEY is configured, so the flow is testable offline.
 */
export async function POST(request: Request) {
  const params = await readPaymentRequest(request);
  const slug = params.get("startup_slug") ?? "";
  const tier = params.get("plan_tier") ?? "";

  const startup = await getStartupBySlug(slug);
  const plan = getPlan(tier);
  if (!startup || !plan) {
    return NextResponse.json(
      { error: "Unknown startup or plan." },
      { status: 400 }
    );
  }

  const origin = new URL(request.url).origin;
  const promotion = await createPendingPromotion({
    startupId: startup.id,
    founderId: startup.founder_id,
    planTier: plan.tier,
    amountNpr: plan.priceNpr,
    provider: "khalti",
  });

  if (isKhaltiSimulated()) {
    return NextResponse.redirect(
      `${origin}/payments/sandbox?ref=${encodeURIComponent(promotion.reference_id)}`
    );
  }

  try {
    const result = await initiateKhaltiPayment({
      amountNpr: plan.priceNpr,
      purchaseOrderId: promotion.reference_id,
      purchaseOrderName: `${plan.label} — ${startup.name}`,
      returnUrl: `${origin}/api/payments/khalti/callback`,
      websiteUrl: origin,
      customerInfo: {},
    });
    return NextResponse.redirect(result.paymentUrl);
  } catch (error) {
    console.error("[khalti] initiate failed:", error);
    return NextResponse.redirect(
      `${origin}/startups/${startup.slug}/promote?payment=error`
    );
  }
}
