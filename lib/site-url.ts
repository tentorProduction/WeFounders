/** Canonical, deployment-controlled site origin. Never derive payment callback
 * URLs or public metadata from an inbound Host header. */
export function getSiteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) {
    try {
      const url = new URL(configured);
      if (process.env.NODE_ENV !== "production") return url.origin;
      if (url.protocol === "https:" && ["wefounders.dev", "www.wefounders.dev"].includes(url.hostname)) {
        return "https://wefounders.dev";
      }
    } catch {
      // Fall through to the safe canonical default.
    }
  }
  return process.env.NODE_ENV === "production"
    ? "https://wefounders.dev"
    : "http://localhost:3000";
}
