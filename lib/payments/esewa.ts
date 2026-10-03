/**
 * eSewa EPAY v2 integration helpers (TRD §4.2).
 *
 * eSewa is the digital wallet operated by F1Soft — the dominant payment
 * gateway in Nepal. Flow:
 *  1. Server builds a signed payment request and returns the form/URL to
 *     redirect the user to eSewa.
 *  2. eSewa calls back with a Base64-signed status payload.
 *  3. Server decodes + verifies the HMAC-SHA256 signature before activating
 *     the promotion.
 */

import { createHmac, timingSafeEqual } from "crypto";

import { allowsTestCredentials } from "@/lib/payments/config";

export const ESEWA_BASE_URL =
  process.env.PAYMENTS_MODE === "live"
    ? "https://epay.esewa.com.np"
    : "https://rc-epay.esewa.com.np";

/** Merchant code differs between test ("EPAYTEST") and production. */
export const ESEWA_MERCHANT_CODE =
  process.env.ESEWA_MERCHANT_CODE ?? (process.env.PAYMENTS_MODE === "live" ? "" : "EPAYTEST");

/** eSewa publishes this sandbox key in its own docs; it is not a secret. */
const ESEWA_PUBLIC_TEST_SECRET = "8gBm/:&EnhH.1/q";

const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY ?? "";

const testCredentialsAllowed = allowsTestCredentials();

export function isEsewaConfigured(): boolean {
  return Boolean(
    ESEWA_SECRET_KEY &&
    ESEWA_MERCHANT_CODE &&
    (testCredentialsAllowed || ESEWA_MERCHANT_CODE !== "EPAYTEST") &&
    (testCredentialsAllowed || ESEWA_SECRET_KEY !== ESEWA_PUBLIC_TEST_SECRET)
  );
}

function requireEsewaSecret(secretKey?: string): string {
  const secret = secretKey ?? ESEWA_SECRET_KEY;
  if (!secret || (!testCredentialsAllowed && secret === ESEWA_PUBLIC_TEST_SECRET)) {
    throw new Error("A valid ESEWA_SECRET_KEY is required for this payment mode.");
  }
  return secret;
}

/** Status values eSewa sends in the signed callback payload. */
export type EsewaStatus = "COMPLETE" | "PENDING" | "NOT_FOUND" | "CANCELED";

export interface EsewaPaymentParams {
  amount: number; // product amount in NPR
  taxAmount?: number;
  serviceCharge?: number;
  deliveryCharge?: number;
  transactionUuid: string; // e.g. promotions.reference_id
  productCode?: string;
  successUrl: string;
  failureUrl: string;
}

export interface EsewaSignedForm {
  action: string;
  fields: {
    amount: string;
    tax_amount: string;
    total_amount: string;
    transaction_uuid: string;
    product_code: string;
    success_url: string;
    failure_url: string;
    signed_field_names: string;
    signature_field_names: string;
    signature: string;
  };
}

function totalAmount(p: EsewaPaymentParams): number {
  return (
    p.amount +
    (p.taxAmount ?? 0) +
    (p.serviceCharge ?? 0) +
    (p.deliveryCharge ?? 0)
  );
}

/** HMAC-SHA256 signature over "key=value,key=value" per eSewa v2 spec. */
export function generateEsewaSignature(
  fields: Record<string, string>,
  secretKey?: string
): string {
  const signedFieldNames = "total_amount,transaction_uuid,product_code";
  const message = signedFieldNames
    .split(",")
    .map((key) => `${key}=${fields[key]}`)
    .join(",");

  return createHmac("sha256", requireEsewaSecret(secretKey)).update(message).digest("base64");
}

/**
 * Build the signed payment request. The returned `fields` should be rendered
 * as hidden inputs on a form that POSTs to `action`.
 */
export function createEsewaPayment(
  params: EsewaPaymentParams,
  secretKey?: string
): EsewaSignedForm {
  const productCode = params.productCode ?? ESEWA_MERCHANT_CODE;
  const total = totalAmount(params).toFixed(2);

  const fields = {
    amount: params.amount.toFixed(2),
    tax_amount: (params.taxAmount ?? 0).toFixed(2),
    total_amount: total,
    transaction_uuid: params.transactionUuid,
    product_code: productCode,
    success_url: params.successUrl,
    failure_url: params.failureUrl,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature_field_names: "signature",
  };

  return {
    action: `${ESEWA_BASE_URL}/api/epay/main/v2/form`,
    fields: {
      ...fields,
      signature: generateEsewaSignature(fields, secretKey),
    },
  };
}

export interface EsewaCallbackPayload {
  transaction_code: string;
  status: EsewaStatus;
  total_amount: string | number;
  transaction_uuid: string;
  product_code: string;
  signed_field_names: string;
  signature: string;
}

/** Constant-time string comparison to avoid timing attacks. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Decode the Base64 `data` query param eSewa returns on callback and verify
 * the HMAC-SHA256 signature. Never trust the payload without this check.
 */
export function verifyEsewaCallback(
  base64Data: string,
  secretKey?: string
): EsewaCallbackPayload | null {
  if (!base64Data || base64Data.length > 8192 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64Data)) return null;
  let payload: EsewaCallbackPayload;

  try {
    payload = JSON.parse(Buffer.from(base64Data, "base64").toString("utf-8"));
  } catch {
    return null;
  }

  if (!payload || typeof payload !== "object" || typeof payload.signature !== "string") return null;

  if (
    // eSewa's callback uses a different signed field set than the payment
    // request. Keep the documented order fixed to prevent field omission or
    // attacker-controlled signature scope.
    payload.signed_field_names !== "transaction_code,status,total_amount,transaction_uuid,product_code,signed_field_names" ||
    !["COMPLETE", "PENDING", "NOT_FOUND", "CANCELED"].includes(payload.status) ||
    !["string", "number"].includes(typeof payload.total_amount) ||
    !/^\d+(?:\.\d{1,2})?$/.test(String(payload.total_amount)) ||
    typeof payload.transaction_uuid !== "string" || payload.transaction_uuid.length > 100 ||
    typeof payload.product_code !== "string" || payload.product_code.length > 100 ||
    typeof payload.transaction_code !== "string" || payload.transaction_code.length > 150
  ) return null;

  const message = (payload.signed_field_names ?? "")
    .split(",")
    .map((key) => `${key}=${(payload as unknown as Record<string, string | number>)[key]}`)
    .join(",");

  let expected: string;
  try {
    expected = createHmac("sha256", requireEsewaSecret(secretKey))
    .update(message)
    .digest("base64");
  } catch {
    return null;
  }

  if (!safeEqual(expected, payload.signature ?? "")) return null;

  return payload;
}

export interface EsewaStatusCheck {
  status: EsewaStatus | string;
}

/**
 * Double-check a transaction against eSewa's server-side verification
 * endpoint (deployment guide §3.1). Defense in depth: the callback payload
 * is already signature-verified, but the status check catches replayed
 * signatures. In sandbox mode a network failure here is non-fatal — the
 * signature check alone is accepted so local testing is not blocked.
 */
export async function verifyEsewaTransaction(
  params: Pick<EsewaPaymentParams, "amount" | "transactionUuid">,
  productCode: string = ESEWA_MERCHANT_CODE
): Promise<{ ok: boolean; status: string | null }> {
  const url = new URL(`${ESEWA_BASE_URL}/api/epay/transaction/status/`);
  url.searchParams.set("product_code", productCode);
  // PostgREST hands numeric columns back as strings, so never call toFixed
  // on the stored amount directly.
  url.searchParams.set("total_amount", Number(params.amount).toFixed(2));
  url.searchParams.set("transaction_uuid", params.transactionUuid);

  try {
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(5_000) });
    if (!response.ok) return { ok: false, status: null };

    const data = (await response.json()) as EsewaStatusCheck;
    return { ok: data.status === "COMPLETE", status: data.status };
  } catch {
    return { ok: false, status: null };
  }
}
