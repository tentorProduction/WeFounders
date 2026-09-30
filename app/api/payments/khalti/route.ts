import { NextResponse } from "next/server";

import { getStartupBySlug } from "@/lib/data/startups";
import { getPlan } from "@/lib/promotions/plans";
import { bindPaymentIntent, createPendingPromotion } from "@/lib/promotions/store";
import { isKhaltiSimulated } from "@/lib/payments/config";
import { initiateKhaltiPayment, isKhaltiConfigured } from "@/lib/payments/khalti";
import { readPaymentRequest } from "@/lib/payments/request";
import { getViewer } from "@/lib/auth/viewer";
import { getSiteOrigin } from "@/lib/site-url";
import { hasTrustedOrigin } from "@/lib/security/request-origin";
import { clientAddress, isRateLimited } from "@/lib/security/rate-limit";

/**
 * Khalti ePay v2 initiation (TRD §4.1, deployment guide §3.2).
 *
 * Creates the pending promotion, then either:
 *  - redirects to Khalti's hosted `payment_url` (real sandbox or live), or
 *  - redirects to the local simulated gateway page when sandbox mode is on
 *    and no KHALTI_SECRET_KEY is configured, so the flow is testable offline.
 */
export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
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

  const viewer = await getViewer();
  if (!viewer.userId) return NextResponse.json({ error: "Sign in to promote a startup." }, { status: 401 });
  if (viewer.userId !== startup.founder_id) return NextResponse.json({ error: "Only the startup founder can promote it." }, { status: 403 });
  if (await isRateLimited("payment-initiate", `${viewer.userId}:${clientAddress(request.headers)}`, 5, 60 * 60_000)) {
    return NextResponse.json({ error: "Too many payment attempts. Try again later." }, { status: 429 });
  }
  if (!isKhaltiSimulated() && !isKhaltiConfigured()) {
    return NextResponse.json({ error: "Khalti payments are not configured." }, { status: 503 });
  }

  const origin = getSiteOrigin();
  const promotion = await createPendingPromotion({
    startupId: startup.id,
    founderId: startup.founder_id,
    planTier: plan.tier,
    amountNpr: plan.priceNpr,
    provider: "khalti",
  });

  if (isKhaltiSimulated()) {
    return NextResponse.redirect(
      `${origin}/payments/sandbox?ref=${encodeURIComponent(promotion.reference_id)}`,
      303,
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
    const paymentUrl = new URL(result.paymentUrl);
    if (paymentUrl.protocol !== "https:" || !["pay.khalti.com", "test-pay.khalti.com"].includes(paymentUrl.hostname)) {
      throw new Error("Khalti returned an unexpected payment URL.");
    }
    await bindPaymentIntent(promotion.reference_id, result.pidx);
    return NextResponse.redirect(paymentUrl, 303);
  } catch (error) {
    console.error("[khalti] initiate failed:", error);
    return NextResponse.redirect(
      `${origin}/startups/${startup.slug}/promote?payment=error`,
      303,
    );
  }
}
