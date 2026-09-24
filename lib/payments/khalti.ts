/**
 * Khalti Payment Gateway v2 (ePay) integration helpers (TRD §4.1).
 *
 * Flow:
 *  1. Server initiates a transaction via POST /epay/initiate/ with the secret
 *     key and receives a `pidx` + payment_url.
 *  2. Client redirects the founder to Khalti.
 *  3. On return, the server verifies via POST /epay/lookup/ with the `pidx`
 *     before marking the promotion paid (never trust the redirect alone).
 */

export const KHALTI_BASE_URL =
  process.env.KHALTI_ENV === "prod"
    ? "https://a.khalti.com"
    : "https://a.khalti.com"; // sandbox shares the base URL

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY ?? "";

export interface KhaltiInitiateParams {
  amountNpr: number; // whole NPR; converted to paisa internally
  purchaseOrderId: string; // e.g. promotions.reference_id
  purchaseOrderName: string; // e.g. "Featured Launch — SajhaPay"
  returnUrl: string; // /api/payments/khalti/callback
  websiteUrl: string; // site origin registered with Khalti
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export interface KhaltiInitiateResult {
  pidx: string;
  paymentUrl: string;
}

export interface KhaltiLookupResult {
  pidx: string;
  total_amount: number; // paisa
  status: "PENDING" | "COMPLETED" | "EXPIRED" | "USER_CANCELED" | "INITIATED";
  transaction_id: string | null;
  purchase_order_id: string;
  purchase_order_name: string;
}

function requireSecretKey(): string {
  if (!KHALTI_SECRET_KEY) {
    throw new Error(
      "KHALTI_SECRET_KEY is not set. Add it to .env (see .env.example)."
    );
  }
  return KHALTI_SECRET_KEY;
}

/**
 * Initiate a Khalti ePay transaction. Returns the `pidx` and hosted
 * `paymentUrl` to redirect the user to.
 */
export async function initiateKhaltiPayment(
  params: KhaltiInitiateParams
): Promise<KhaltiInitiateResult> {
  const response = await fetch(`${KHALTI_BASE_URL}/api/v2/epay/initiate/`, {
    method: "POST",
    headers: {
      Authorization: `Key ${requireSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      return_url: params.returnUrl,
      website_url: params.websiteUrl,
      amount: Math.round(params.amountNpr * 100), // NPR -> paisa
      purchase_order_id: params.purchaseOrderId,
      purchase_order_name: params.purchaseOrderName,
      customer_info: params.customerInfo,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Khalti initiate failed (${response.status}): ${body}`);
  }

  return (await response.json()) as KhaltiInitiateResult;
}

/**
 * Server-side verification (lookup). Call this on the return callback before
 * activating a promotion — status must be "COMPLETED".
 */
export async function lookupKhaltiPayment(
  pidx: string
): Promise<KhaltiLookupResult> {
  const response = await fetch(`${KHALTI_BASE_URL}/api/v2/epay/lookup/`, {
    method: "POST",
    headers: {
      Authorization: `Key ${requireSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pidx }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Khalti lookup failed (${response.status}): ${body}`);
  }

  return (await response.json()) as KhaltiLookupResult;
}
