import { NextResponse } from "next/server";

import { getStartupById } from "@/lib/data/startups";
import {
  verifyEsewaCallback,
  verifyEsewaTransaction,
  ESEWA_MERCHANT_CODE,
} from "@/lib/payments/esewa";
import { isSandboxPayments } from "@/lib/payments/config";
import {
  completePromotion,
  getPromotionByReference,
} from "@/lib/promotions/store";
import { getSiteOrigin } from "@/lib/site-url";

/**
 * eSewa return callback (TRD §4.2). eSewa redirects the founder's browser
 * here with `?data=<base64>` on both success and failure. We:
 *   1. decode + HMAC-verify the payload (never trust the redirect alone),
 *   2. double-check the transaction with eSewa's status verification API,
 *   3. flip the promotion to `completed` and set is_featured / featured_until,
 *   4. redirect the founder back to the promote page with a status banner.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = getSiteOrigin();
  const back = (slug: string | null, payment: string, ref?: string) => {
    const target = slug
      ? `${origin}/startups/${slug}/promote?payment=${payment}`
      : `${origin}/promote?payment=${payment}`;
    return NextResponse.redirect(ref ? `${target}&ref=${encodeURIComponent(ref)}` : target);
  };

  const data = url.searchParams.get("data");
  const payload = data ? verifyEsewaCallback(data) : null;
  if (!payload) {
    // eSewa always appends `data`, even on failure — a missing/invalid payload
    // means the request was tampered with.
    return back(null, "failed");
  }

  const reference = payload.transaction_uuid;
  const promotion = await getPromotionByReference(reference);
  if (!promotion || promotion.provider !== "esewa" || promotion.status !== "pending") return back(null, "failed");
  const expectedTotal = Number(promotion.amount_npr).toFixed(2);
  if (Number(payload.total_amount).toFixed(2) !== expectedTotal || payload.product_code !== ESEWA_MERCHANT_CODE || !payload.transaction_code) {
    return back(null, "failed");
  }
  const startup = await getStartupById(promotion.startup_id);

  if (payload.status !== "COMPLETE") {
    return back(startup?.slug ?? null, "failed", reference);
  }

  // Defense in depth: confirm the transaction server-to-server as well.
  const check = await verifyEsewaTransaction({
    amount: promotion.amount_npr,
    transactionUuid: reference,
  });
  // In sandbox mode a network failure / non-200 from the status API (common
  // against rc-epay for unregistered test transactions) is non-fatal — the
  // HMAC signature has already been verified. In live mode both must pass.
  const verified = check.ok || (process.env.NODE_ENV === "development" && isSandboxPayments() && check.status === null);
  if (!verified) {
    return back(startup?.slug ?? null, "failed", reference);
  }

  await completePromotion(reference, payload.transaction_code, "esewa");
  return back(startup?.slug ?? null, "success", reference);
}
