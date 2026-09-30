import { getSiteOrigin } from "@/lib/site-url";

/** Only allow browser state changes from the configured canonical site. */
export function hasTrustedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === getSiteOrigin();
  } catch {
    return false;
  }
}
