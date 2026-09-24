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
 */

export type PaymentsMode = "sandbox" | "live";

export function getPaymentsMode(): PaymentsMode {
  return process.env.PAYMENTS_MODE === "live" ? "live" : "sandbox";
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
  return isSandboxPayments() && !process.env.KHALTI_SECRET_KEY;
}
