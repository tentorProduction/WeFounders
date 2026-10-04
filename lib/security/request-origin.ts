import { getSiteOrigin } from "@/lib/site-url";

function isTrustedHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "wefounders.dev" || host.endsWith(".wefounders.dev")) return true;
  if (host === "wefounders.app" || host.endsWith(".wefounders.app")) return true;
  if (host.endsWith(".vercel.app")) return true;
  if (host === "localhost" || host === "127.0.0.1") return true;
  return false;
}

/** Only allow browser state changes from the configured canonical site or matching host. */
export function hasTrustedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");

  // Fallback to referer if origin header is omitted
  if (!origin) {
    const referer = request.headers.get("referer");
    if (!referer) return false;
    try {
      const refUrl = new URL(referer);
      return isTrustedHost(refUrl.hostname);
    } catch {
      return false;
    }
  }

  try {
    const originUrl = new URL(origin);
    const hostHeader = request.headers.get("x-forwarded-host") || request.headers.get("host");

    if (hostHeader) {
      const hostOnly = hostHeader.split(":")[0];
      if (originUrl.hostname === hostOnly) return true;
    }

    if (isTrustedHost(originUrl.hostname)) return true;

    return originUrl.origin === getSiteOrigin();
  } catch {
    return false;
  }
}
