import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { sql } from "@/lib/db/neon";

export function clientAddress(headers: Headers): string {
  const value = headers.get("x-forwarded-for")?.split(",").at(-1)?.trim();
  return value && isIP(value) ? value : "unknown";
}

/** Shared atomic counter. Database errors fail closed. */
export async function isRateLimited(namespace: string, identity: string, maximum: number, windowMs: number): Promise<boolean> {
  const key = createHash("sha256").update(`${namespace}:${identity}`).digest("hex");
  try {
    const rows = await sql`
      insert into rate_limits(key,window_start,count) values(${key},now(),1)
      on conflict(key) do update set
       count=case when rate_limits.window_start<now()-${windowMs}*interval '1 millisecond' then 1 else rate_limits.count+1 end,
       window_start=case when rate_limits.window_start<now()-${windowMs}*interval '1 millisecond' then now() else rate_limits.window_start end
      returning count
    `;
    return Number(rows[0].count)>maximum;
  } catch { return true; }
}
