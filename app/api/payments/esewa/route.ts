import { NextResponse } from "next/server";

import { getStartupBySlug } from "@/lib/data/startups";
import { getPlan } from "@/lib/promotions/plans";
import { createPendingPromotion } from "@/lib/promotions/store";
import {
  createEsewaPayment,
  type EsewaSignedForm,
} from "@/lib/payments/esewa";
import { readPaymentRequest } from "@/lib/payments/request";
import { getViewer } from "@/lib/auth/viewer";
import { getSiteOrigin } from "@/lib/site-url";
import { isEsewaConfigured } from "@/lib/payments/esewa";
import { hasTrustedOrigin } from "@/lib/security/request-origin";
import { clientAddress, isRateLimited } from "@/lib/security/rate-limit";

/**
 * eSewa EPAY v2 initiation (TRD §4.2, deployment guide §3.1).
 *
 * The founder's browser POSTs here from the promote checkout; we persist a
 * `pending` promotion and answer with a minimal HTML page that auto-submits
 * the HMAC-SHA256-signed form to eSewa. In sandbox mode the form posts to
 * rc-epay.esewa.com.np with the public EPAYTEST credentials — no real money.
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
  if (!isEsewaConfigured()) {
    return NextResponse.json({ error: "eSewa payments are not configured." }, { status: 503 });
  }

  const origin = getSiteOrigin();
  const promotion = await createPendingPromotion({
    startupId: startup.id,
    founderId: startup.founder_id,
    planTier: plan.tier,
    amountNpr: plan.priceNpr,
    provider: "esewa",
  });

  const signed = createEsewaPayment({
    amount: plan.priceNpr,
    transactionUuid: promotion.reference_id,
    successUrl: `${origin}/api/payments/esewa/callback`,
    failureUrl: `${origin}/api/payments/esewa/callback`,
  });

  return new Response(renderAutoSubmitForm(signed), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderAutoSubmitForm(form: EsewaSignedForm): string {
  const inputs = Object.entries(form.fields)
    .map(
      ([name, value]) =>
        `<input type="hidden" name="${name}" value="${escapeHtml(value)}" />`
    )
    .join("\n      ");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Redirecting to eSewa…</title>
    <style>
      body { font-family: system-ui, sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; background: #fafafa; color: #52525b; }
      .card { text-align: center; }
      .spinner { width: 28px; height: 28px; margin: 0 auto 12px; border: 3px solid #e4e4e7; border-top-color: #60bb46; border-radius: 50%; animation: spin 0.8s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="spinner" aria-hidden="true"></div>
      <p>Redirecting to eSewa to complete your payment…</p>
    </div>
    <form id="esewa-form" method="POST" action="${escapeHtml(form.action)}">
      ${inputs}
    </form>
    <noscript>
      <p><button type="submit" form="esewa-form">Continue to eSewa</button></p>
    </noscript>
    <script>
      document.getElementById("esewa-form").submit();
    </script>
  </body>
</html>`;
}
