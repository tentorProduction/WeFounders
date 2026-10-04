import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { sql } from "@/lib/db/neon";
import { resolveSiteLogo } from "@/lib/logo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
/** Batch × worst-case scrape budget must fit inside the function window. */
export const maxDuration = 60;

/** Sites re-checked per run, how often each site is re-checked, and the wall clock budget. */
const BATCH = 12;
const REFRESH_DAYS = 7;
const RUN_BUDGET_MS = 45_000;

/**
 * Background logo sync: `GET /api/cron/logos` with `Authorization: Bearer CRON_SECRET`.
 *
 * Claims a batch of startups whose logo is missing or stale (claiming stamps
 * `logo_synced_at` up front so a failing site is not retried every run), then
 * re-resolves each logo from its `website_url`. `logo_url` is only overwritten
 * when the site yields a new icon, so an unreachable site keeps its current
 * logo instead of losing it.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "Configure CRON_SECRET." }, { status: 503 });
  const expected = Buffer.from(`Bearer ${secret}`);
  const provided = Buffer.from(request.headers.get("authorization") ?? "");
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await sql`
    with batch as (
      select id, website_url, logo_url
      from startups
      where archived_at is null
        and website_url ~* '^https?://'
        and (logo_synced_at is null or logo_synced_at < now() - make_interval(days => ${REFRESH_DAYS}))
      order by logo_synced_at asc nulls first
      limit ${BATCH}
      for update skip locked
    )
    update startups s
    set logo_synced_at = now()
    from batch
    where s.id = batch.id
    returning s.id, s.website_url, s.logo_url
  ` as { id: string; website_url: string; logo_url: string }[];

  const deadline = Date.now() + RUN_BUDGET_MS;
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    if (Date.now() >= deadline) {
      skipped += 1;
      // The batch was already claimed: leave it for the next scheduled run.
      continue;
    }
    try {
      const logo = await resolveSiteLogo(row.website_url);
      if (logo && logo !== row.logo_url) {
        await sql`update startups set logo_url = ${logo} where id = ${row.id}::uuid`;
        updated += 1;
      }
    } catch (error) {
      console.error("[cron/logos] logo sync failed:", error);
      skipped += 1;
    }
  }

  return NextResponse.json({ processed: rows.length, updated, skipped });
}
