/**
 * Payments runtime configuration (TRD §4, deployment guide §3).
 *
 * Sandbox-first by default: with no environment variables set the app runs
 * entirely on the providers' test infrastructure — eSewa `EPAYTEST` on
 * rc-epay.esewa.com.np, and Khalti test keys from test-admin.khalti.com.
 * No real money can move in this mode.
 *
 * Set PAYMENTS_MODE=live (plus real merchant credentials) to switch both
 * gateways to production.
 *
 * A production build never runs on test credentials — see allowsTestCredentials.
 */

export type PaymentsMode = "sandbox" | "live";

export function getPaymentsMode(): PaymentsMode {
  return process.env.PAYMENTS_MODE === "live" ? "live" : "sandbox";
}

/**
 * Test credentials may only be used by a local development server.
 *
 * PAYMENTS_MODE defaults to sandbox, so a production deploy that simply forgets
 * the variable would otherwise accept eSewa's *publicly documented* EPAYTEST
 * key — and because callback authenticity rests on an HMAC made with that key,
 * a sandbox-mode signature proves nothing to an attacker. Providers must treat
 * false here as "not configured" and refuse checkout.
 */
export function allowsTestCredentials(): boolean {
  return process.env.NODE_ENV !== "production";
}

export function isSandboxPayments(): boolean {
  return getPaymentsMode() === "sandbox";
}

/**
 * True when Khalti has no secret key configured at all. In that case the
 * initiate route routes the founder to the local *simulated* gateway page
 * (app/payments/sandbox) so the full checkout → callback → activation flow
 * can be exercised offline. As soon as a key exists (even a `test_` one) the
 * real Khalti sandbox is used instead.
 */
export function isKhaltiSimulated(): boolean {
  return process.env.NODE_ENV === "development" && isSandboxPayments() && !process.env.KHALTI_SECRET_KEY;
}
