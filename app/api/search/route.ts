import { NextResponse } from "next/server";

import { getStartupFeed, searchStartups } from "@/lib/data/startups";

/**
 * Type-ahead search for the site header.
 *
 * Returns only the handful of fields the dropdown renders, so the client never
 * downloads the full startup rows just to show four suggestions. When `q` is
 * empty the newest launches are returned, which is what the header shows before
 * anyone types.
 */

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const term = (url.searchParams.get("q") ?? "").trim().slice(0, 80);
  const limit = Math.min(
    Math.max(Number(url.searchParams.get("limit") ?? 5) || 5, 1),
    10
  );

  const startups = term
    ? await searchStartups(term, limit)
    : await getStartupFeed({ limit, orderBy: "newest" });

  return NextResponse.json(
    {
      results: startups.map((startup) => ({
        id: startup.id,
        slug: startup.slug,
        name: startup.name,
        tagline: startup.tagline,
        upvotes: startup.upvotes_count,
      })),
    },
    { headers: { "cache-control": "no-store" } }
  );
}
