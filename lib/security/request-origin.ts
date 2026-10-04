import { getSiteOrigin } from "@/lib/site-url";

/** Only allow browser state changes from the configured canonical site. */
export function hasTrustedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    if(process.env.NODE_ENV==='development' && new URL(request.url).origin===new URL(origin).origin && ['localhost','127.0.0.1'].includes(new URL(origin).hostname)) return true;
    return new URL(origin).origin === getSiteOrigin();
  } catch {
    return false;
  }
}
