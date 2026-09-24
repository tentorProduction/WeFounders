import { NextResponse } from "next/server";

import { getStartupById } from "@/lib/fixtures/startups";
import { isKhaltiSimulated } from "@/lib/payments/config";
import { lookupKhaltiPayment } from "@/lib/payments/khalti";
import {
  completePromotion,
  failPromotion,
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
  const origin = url.origin;
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
  if (!promotion) return back(null, "failed");
  const startup = await getStartupById(promotion.startup_id);

  let status = "FAILED";
  let transactionId: string | null = null;

  if (isKhaltiSimulated() && pidx.startsWith("sim_")) {
    status = url.searchParams.get("status") === "success" ? "COMPLETED" : "USER_CANCELED";
    transactionId = pidx;
  } else if (pidx) {
    try {
      const lookup = await lookupKhaltiPayment(pidx);
      status = lookup.status;
      transactionId = lookup.transaction_id;
    } catch (error) {
      console.error("[khalti] lookup failed:", error);
    }
  }

  if (status === "COMPLETED") {
    await completePromotion(promotion.reference_id, transactionId);
    return back(startup?.slug ?? null, "success", promotion.reference_id);
  }

  await failPromotion(promotion.reference_id);
  return back(
    startup?.slug ?? null,
    status === "USER_CANCELED" ? "canceled" : "failed",
    promotion.reference_id
  );
}
