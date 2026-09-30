import { createHmac } from "node:crypto";
import { isIP } from "node:net";

export function clientAddress(headers: Headers): string {
  // Hosting proxies append the actual socket peer at the right; ignore any
  // leftmost values supplied by the incoming client.
  const forwarded = headers.get("x-forwarded-for")?.split(",").map((part) => part.trim()) ?? [];
  const value = forwarded.at(-1);
  if (value && isIP(value)) return value;
  return "unknown";
}

/** Atomic fixed-window counter backed by Upstash Redis REST. Fails closed
 * outside development when shared rate-limit storage is not configured. */
export async function isRateLimited(
  namespace: string,
  identity: string,
  maxRequests: number,
  windowMs: number,
): Promise<boolean> {
  const secret = process.env.SESSION_SECRET;
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (secret && redisUrl && redisToken) {
    try {
      const endpoint = new URL(redisUrl);
      if (endpoint.protocol !== "https:") return true;
      const digest = createHmac("sha256", secret).update(`${namespace}:${identity}`).digest("hex");
      const script = "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('PEXPIRE',KEYS[1],ARGV[1]); end; return n";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${redisToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(["EVAL", script, "1", `wf:rate:${digest}`, String(windowMs)]),
        cache: "no-store",
        signal: AbortSignal.timeout(2_000),
      });
      if (!response.ok) return true;
      const result = await response.json() as { result?: unknown; error?: unknown };
      if (result.error || typeof result.result !== "number") return true;
      return result.result > maxRequests;
    } catch {
      return true;
    }
  }

  if (process.env.NODE_ENV === "production") return true;
  const key = `${namespace}:${identity}`;
  const now = Date.now();
  const state = localCounters.get(key);
  if (!state || state.expiresAt <= now) {
    if (localCounters.size > 2_000) {
      for (const [entry, value] of localCounters) if (value.expiresAt <= now) localCounters.delete(entry);
      if (localCounters.size > 2_000) localCounters.clear();
    }
    localCounters.set(key, { count: 1, expiresAt: now + windowMs });
    return false;
  }
  state.count += 1;
  return state.count > maxRequests;
}

const localCounters = new Map<string, { count: number; expiresAt: number }>();
