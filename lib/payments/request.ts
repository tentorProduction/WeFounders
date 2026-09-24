/**
 * Shared request parsing for the payment initiate routes. The promote
 * checkout posts a plain HTML form, but JSON bodies are accepted too so the
 * endpoints are easy to script/test.
 */
export async function readPaymentRequest(
  request: Request
): Promise<URLSearchParams> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body: unknown = await request.json().catch(() => ({}));
    const params = new URLSearchParams();
    if (body && typeof body === "object") {
      for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
        if (value !== undefined && value !== null) params.set(key, String(value));
      }
    }
    return params;
  }

  const form = await request.formData().catch(() => new FormData());
  const params = new URLSearchParams();
  for (const [key, value] of form.entries()) {
    params.set(key, String(value));
  }
  return params;
}
