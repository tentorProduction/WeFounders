import { NextResponse } from "next/server";

import { getStartupById } from "@/lib/data/startups";
import { getSiteOrigin } from "@/lib/site-url";
import { isKhaltiSimulated } from "@/lib/payments/config";
import { lookupKhaltiPayment } from "@/lib/payments/khalti";
import {
  completePromotion,
  getPromotionByReference,
} from "@/lib/promotions/store";

/**
 * Khalti return callback (TRD §4.1). Khalti redirects back with `pidx` and
 * `purchase_order_id` (our promotion reference). Never trust the redirect:
 * call POST /epay/lookup/ server-side and only honor status "COMPLETED".
 * In simulated sandbox mode (no secret key configured) the local gateway page
 * resolves the payment directly — guarded by the `sim_` pidx prefix.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = getSiteOrigin();
  const pidx = url.searchParams.get("pidx") ?? "";
  const reference = url.searchParams.get("purchase_order_id") ?? "";

  const back = (slug: string | null, payment: string, ref?: string) => {
    const target = slug
      ? `${origin}/startups/${slug}/promote?payment=${payment}`
      : `${origin}/promote?payment=${payment}`;
    return NextResponse.redirect(
      ref ? `${target}&ref=${encodeURIComponent(ref)}` : target
    );
  };

  const promotion = reference ? await getPromotionByReference(reference) : null;
  if (!promotion || promotion.provider !== "khalti" || promotion.status !== "pending") return back(null, "failed");
  const startup = await getStartupById(promotion.startup_id);

  let status = "FAILED";
  let transactionId: string | null = null;

  if (isKhaltiSimulated() && pidx.startsWith("sim_")) {
    status = url.searchParams.get("status") === "success" ? "COMPLETED" : "USER_CANCELED";
    transactionId = pidx;
  } else if (pidx && promotion.payment_intent_id === pidx) {
    try {
      const lookup = await lookupKhaltiPayment(pidx);
      if (
        lookup.pidx === pidx &&
        lookup.total_amount === Math.round(Number(promotion.amount_npr) * 100) &&
        lookup.status.toLowerCase() === "completed" && !lookup.refunded && typeof lookup.transaction_id === "string" && lookup.transaction_id.length > 0
      ) {
        status = "COMPLETED";
        transactionId = lookup.transaction_id;
      }
    } catch (error) {
      console.error("[khalti] lookup failed:", error);
    }
  }

  if (status === "COMPLETED") {
    await completePromotion(promotion.reference_id, transactionId, "khalti");
    return back(startup?.slug ?? null, "success", promotion.reference_id);
  }

  return back(
    startup?.slug ?? null,
    status === "USER_CANCELED" ? "canceled" : "failed",
    promotion.reference_id
  );
}
