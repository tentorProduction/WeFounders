import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

/**
 * Automatic logo sync.
 *
 * A founder only submits a website URL; this module fetches that site and
 * resolves the best available icon (declared <link rel="icon"> assets first,
 * then /favicon.ico, then og:image) and finally falls back to Google's public
 * favicon service. The returned value is a normal https URL that is stored in
 * `startups.logo_url`.
 *
 * Every hop is validated before it is requested: only http/https, no local or
 * internal hostnames, no private/reserved IP literals, and DNS results must be
 * public addresses. Redirects are followed manually so each target gets the
 * same check. Requests are time-boxed and response bodies are size-capped.
 */

const PER_REQUEST_TIMEOUT_MS = 4_000;
const TOTAL_BUDGET_MS = 12_000;
const MAX_REDIRECTS = 5;
const MAX_HTML_BYTES = 400_000;
const MAX_PROBE_BYTES = 4_096;
const MAX_CANDIDATES = 4;

const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 WeFounders-LogoSync/1.0";

const HTML_ACCEPT = "text/html,application/xhtml+xml,image/avif,image/webp,*/*;q=0.8";
const IMAGE_ACCEPT = "image/*,*/*;q=0.8";

interface Candidate {
  url: string;
  /** Trusted favicon service — returned without a probing request. */
  unverified?: boolean;
}

/** Parse an absolute http(s) URL, or return null for anything else. */
function parseHttpUrl(raw: string): URL | null {
  try {
    const url = new URL(raw.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

/** True for loopback, private, link-local, CGNAT, multicast and reserved space. */
function isPublicIp(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) {
    const [a, b] = ip.split(".").map(Number);
    if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
    if (a === 169 && b === 254) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && b === 168) return false;
    if (a === 198 && (b === 18 || b === 19)) return false;
    if (a === 100 && b >= 64 && b <= 127) return false;
    return true;
  }
  if (version === 6) {
    const normalized = ip.toLowerCase();
    if (normalized === "::" || normalized === "::1") return false;
    const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/.exec(normalized);
    if (mapped) return isPublicIp(mapped[1]);
    const first = parseInt(normalized.split(":").find((part) => part !== "") ?? "0", 16);
    if (Number.isNaN(first) || first === 0) return false;
    if ((first & 0xfe00) === 0xfc00) return false; // fc00::/7 unique local
    if ((first & 0xffc0) === 0xfe80) return false; // fe80::/10 link local
    if ((first & 0xff00) === 0xff00) return false; // ff00::/8 multicast
    return true;
  }
  return false;
}

/** Hostnames that must never be requested from the server. */
function isBlockedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (host === "" || host === "0.0.0.0" || host === "localhost") return true;
  return (
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".home.arpa") ||
    host.endsWith(".lan")
  );
}

/**
 * Resolve the hostname and require every address to be public.
 * (DNS is re-resolved by the socket afterwards; this blocks the straightforward
 * cases — IP literals, internal names and hosts pointing at private ranges.)
 */
async function isPublicTarget(url: URL): Promise<boolean> {
  if (isBlockedHostname(url.hostname)) return false;
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (isIP(host)) return isPublicIp(host);
  try {
    const addresses = await lookup(host, { all: true });
    if (addresses.length === 0) return false;
    return addresses.every((entry) => isPublicIp(entry.address));
  } catch {
    return false;
  }
}

/**
 * Host-scoped cookie store for one resolution. Sites behind auth handshakes
 * (Clerk's dev-browser handshake, for example) answer every request with a 307
 * until the cookie from the previous hop is sent back — so redirect chains must
 * carry cookies or they loop until the hop limit and the logo never syncs.
 */
class CookieJar {
  private readonly cookies = new Map<string, Map<string, string>>();

  header(url: URL): string | undefined {
    const hostCookies = this.cookies.get(url.hostname);
    if (!hostCookies || hostCookies.size === 0) return undefined;
    return [...hostCookies.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
  }

  store(response: Response, url: URL): void {
    const raw =
      typeof response.headers.getSetCookie === "function"
        ? response.headers.getSetCookie()
        : [response.headers.get("set-cookie") ?? ""];
    for (const entry of raw) {
      const pair = entry.split(";")[0];
      const separator = pair.indexOf("=");
      if (separator <= 0) continue;
      const name = pair.slice(0, separator).trim();
      const value = pair.slice(separator + 1).trim();
      let hostCookies = this.cookies.get(url.hostname);
      if (!hostCookies) {
        hostCookies = new Map<string, string>();
        this.cookies.set(url.hostname, hostCookies);
      }
      if (value === "") hostCookies.delete(name);
      else hostCookies.set(name, value);
    }
  }
}

/**
 * GET `url`, validating every redirect hop, or return null when the target is
 * unreachable, blocked, slow or answered with a non-2xx status.
 */
async function safeFetch(
  url: URL,
  deadline: number,
  accept: string,
  jar: CookieJar
): Promise<Response | null> {
  let current = url;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    if (Date.now() >= deadline) return null;
    if (!(await isPublicTarget(current))) return null;

    const timeout = Math.max(500, Math.min(PER_REQUEST_TIMEOUT_MS, deadline - Date.now()));
    const cookie = jar.header(current);
    let response: Response;
    try {
      response = await fetch(current, {
        redirect: "manual",
        signal: AbortSignal.timeout(timeout),
        headers: {
          "user-agent": USER_AGENT,
          accept,
          ...(cookie ? { cookie } : {}),
        },
      });
    } catch {
      return null;
    }
    jar.store(response, current);

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      void response.body?.cancel().catch(() => {});
      if (!location) return null;
      const next = parseHttpUrl(new URL(location, current).toString());
      if (!next) return null;
      current = next;
      continue;
    }

    if (!response.ok) {
      void response.body?.cancel().catch(() => {});
      return null;
    }
    return response;
  }

  return null;
}

/** Read at most `maxBytes` from a response, then release the connection. */
async function readCapped(response: Response, maxBytes: number): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (total < maxBytes) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        total += value.byteLength;
      }
    }
  } catch {
    return "";
  } finally {
    await reader.cancel().catch(() => {});
  }
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(merged);
}

function parseAttributes(tag: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const pattern = /([a-zA-Z][a-zA-Z0-9_:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'`=<>]+))/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(tag))) {
    attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return attributes;
}

function absoluteUrl(href: string, base: URL): string | null {
  const value = href.trim();
  if (!value || value.startsWith("data:")) return null;
  return parseHttpUrl(new URL(value, base).toString())?.toString() ?? null;
}

/** Base URL for resolving relative links: <base href> when present, else the page URL. */
function pageBase(html: string, pageUrl: URL): URL {
  const baseTag = /<base\b[^>]*>/i.exec(html);
  const href = baseTag ? parseAttributes(baseTag[0]).href : undefined;
  if (href) {
    try {
      const resolved = new URL(href, pageUrl);
      if (resolved.protocol === "http:" || resolved.protocol === "https:") return resolved;
    } catch {
      // Fall through to the page URL.
    }
  }
  return pageUrl;
}

/** Declared icon links, best candidate first (apple-touch-icon > large > svg). */
function extractIconLinks(html: string, base: URL): string[] {
  const scored: { url: string; score: number }[] = [];
  const linkTags = html.match(/<link\b[^>]*>/gi) ?? [];
  for (const tag of linkTags) {
    const attributes = parseAttributes(tag);
    const rel = (attributes.rel ?? "").toLowerCase();
    const href = attributes.href;
    if (!rel || !href) continue;
    const tokens = rel.split(/\s+/);
    const isIcon = tokens.some((token) =>
      token === "icon" || token === "shortcut" || token === "apple-touch-icon" || token === "apple-touch-icon-precomposed"
    );
    if (!isIcon || tokens.includes("mask-icon")) continue;
    const resolved = absoluteUrl(href, base);
    if (!resolved) continue;

    let score = 1;
    if (tokens.includes("apple-touch-icon") || tokens.includes("apple-touch-icon-precomposed")) score += 100;
    if (/\.svg(?:$|\?)/i.test(resolved)) score += 40;
    const sizes = /(\d+)x(\d+)/i.exec(attributes.sizes ?? "");
    if (sizes) score += Math.min(Math.max(Number(sizes[1]), Number(sizes[2])), 512) / 8;
    scored.push({ url: resolved, score });
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .map((candidate) => candidate.url)
    .filter((url, index, all) => all.indexOf(url) === index);
}

/** Social preview images — usually the product's own brand artwork. */
function extractSocialImages(html: string, base: URL): string[] {
  const images: string[] = [];
  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of metaTags) {
    const attributes = parseAttributes(tag);
    const key = (attributes.property ?? attributes.name ?? "").toLowerCase();
    if (key !== "og:image" && key !== "og:image:url" && key !== "twitter:image") continue;
    const resolved = attributes.content ? absoluteUrl(attributes.content, base) : null;
    if (resolved && !images.includes(resolved)) images.push(resolved);
  }
  return images;
}

/** Does this response actually look like an image rather than an error page? */
async function probeImage(url: URL, deadline: number, jar: CookieJar): Promise<boolean> {
  const response = await safeFetch(url, deadline, IMAGE_ACCEPT, jar);
  if (!response) return false;
  const type = (response.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  const declaredImage =
    type.startsWith("image/") ||
    type === "application/octet-stream" ||
    type === "binary/octet-stream" ||
    type === "";
  if (!declaredImage) {
    void response.body?.cancel().catch(() => {});
    return false;
  }
  const head = (await readCapped(response, MAX_PROBE_BYTES)).trimStart().toLowerCase();
  const looksLikeMarkup =
    head.startsWith("<!doctype html") ||
    head.startsWith("<html") ||
    (head.startsWith("<?xml") && head.includes("<html"));
  return !looksLikeMarkup;
}

/** Last-resort icon URL that works even for sites we could not scrape. */
function faviconServiceUrl(hostname: string): string {
  return `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(hostname)}`;
}

/**
 * Resolve the logo for `websiteUrl`.
 *
 * @returns An https URL of the site's icon, or null when the site cannot be
 * reached or the URL is not a valid public http(s) address.
 */
export async function resolveSiteLogo(websiteUrl: string): Promise<string | null> {
  const requested = parseHttpUrl(websiteUrl);
  if (!requested) return null;
  const deadline = Date.now() + TOTAL_BUDGET_MS;
  const jar = new CookieJar();

  const page = await safeFetch(requested, deadline, HTML_ACCEPT, jar);
  if (!page) {
    // The homepage could not be scraped (blocked, needs JavaScript, down for a
    // moment) but the domain exists — the favicon service still knows its icon.
    return (await isPublicTarget(requested)) ? faviconServiceUrl(requested.hostname) : null;
  }

  const finalUrl = parseHttpUrl(page.url || requested.toString()) ?? requested;
  const html = await readCapped(page, MAX_HTML_BYTES);
  const base = pageBase(html, finalUrl);

  const rootIcon = absoluteUrl("/favicon.ico", base);
  const candidates: Candidate[] = [
    ...extractIconLinks(html, base).map((url) => ({ url })),
    ...(rootIcon ? [{ url: rootIcon }] : []),
    ...extractSocialImages(html, base).map((url) => ({ url })),
    { url: faviconServiceUrl(base.hostname), unverified: true },
  ];

  let probes = 0;
  for (const candidate of candidates) {
    if (candidate.unverified) return candidate.url;
    if (probes >= MAX_CANDIDATES || Date.now() >= deadline) break;
    probes += 1;
    const target = parseHttpUrl(candidate.url);
    if (target && (await probeImage(target, deadline, jar))) return candidate.url;
  }

  return faviconServiceUrl(base.hostname);
}
