import { readBoundedBody } from "@/lib/security/request-body";

/**
 * Shared request parsing for the payment initiate routes. The promote
 * checkout posts a plain HTML form, but JSON bodies are accepted too so the
 * endpoints are easy to script/test.
 */
export async function readPaymentRequest(
  request: Request
): Promise<URLSearchParams> {
  const contentType = request.headers.get("content-type") ?? "";

  const rawBody = await readBoundedBody(request, 8_192);
  if (rawBody === null) return new URLSearchParams();

  if (contentType.includes("application/json")) {
    let body: unknown;
    try {
      body = JSON.parse(rawBody || "{}");
    } catch {
      return new URLSearchParams();
    }
    const params = new URLSearchParams();
    if (body && typeof body === "object") {
      for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
        if (value !== undefined && value !== null) params.set(key, String(value));
      }
    }
    return params;
  }

  if (!contentType.includes("application/x-www-form-urlencoded")) return new URLSearchParams();
  return new URLSearchParams(rawBody);
}
