import { NextResponse } from "next/server";

import { getViewer } from "@/lib/auth/viewer";
import { sql } from "@/lib/db/neon";
import { z } from "zod";
import { getStartupById } from "@/lib/data/startups";
import { clientAddress, isRateLimited } from "@/lib/security/rate-limit";
import { readBoundedBody } from "@/lib/security/request-body";
import { hasTrustedOrigin } from "@/lib/security/request-origin";
export const dynamic="force-dynamic";
export async function GET(){const viewer=await getViewer();if(!viewer.userId)return NextResponse.json({votes:[]},{status:401});const rows=await sql`select startup_id from upvotes where user_id=${viewer.userId}::uuid limit 2000`;return NextResponse.json({votes:rows.map(r=>r.startup_id)},{headers:{'Cache-Control':'private, no-store'}});}

/**
 * Persist an upvote for the signed-in viewer.
 *
 * Upvotes are the platform's core signal, so they are stored in the database
 * rather than only on the device. Counters on `startups` are maintained by the
 * `upvotes_counter` trigger, which means the feed reconciles itself on the next
 * load instead of trusting a client-computed total.
 *
 * Anonymous visitors keep their votes device-local (see the optimistic upvote
 * hook) — there is no anonymous row to write, since every upvote is tied to a
 * real profile.
 */

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });

  let startupId = "";
  let voted = true;

  try {
    const rawBody = await readBoundedBody(request, 4_096);
    if (rawBody === null) return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
    const body = JSON.parse(rawBody) as { startupId?: unknown; voted?: unknown };
    startupId = typeof body.startupId === "string" ? body.startupId : "";
    voted = body.voted !== false;
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  if (!z.string().uuid().safeParse(startupId).success) {
    return NextResponse.json({ error: "A valid startupId is required." }, { status: 400 });
  }

  const viewer = await getViewer();
  if (!viewer.userId) {
    return NextResponse.json(
      { error: "Sign in to upvote.", counted: false },
      { status: 401 }
    );
  }

  if (await isRateLimited("upvote", `${viewer.userId}:${clientAddress(request.headers)}`, 60, 60_000)) {
    return NextResponse.json({ error: "Too many vote changes. Try again shortly." }, { status: 429 });
  }

  const startup = await getStartupById(startupId);
  if (!startup || startup.status !== "approved") {
    return NextResponse.json({ error: "That startup is not available for voting." }, { status: 404 });
  }
  if(startup.founder_id===viewer.userId) return NextResponse.json({error:"You cannot upvote your own startup."},{status:403});

  try {
    if (voted) {
      await sql`
        insert into upvotes (startup_id, user_id)
        values (${startupId}::uuid, ${viewer.userId}::uuid)
        on conflict (startup_id, user_id) do nothing
      `;
    } else {
      await sql`
        delete from upvotes
        where startup_id = ${startupId}::uuid
          and user_id = ${viewer.userId}::uuid
      `;
    }
  } catch (error) {
    console.error("[upvotes] write failed:", error);
    return NextResponse.json(
      { error: "Could not record that vote.", counted: false },
      { status: 500 }
    );
  }

  const rows = (await sql`
    select count(*)::int as total from upvotes where startup_id = ${startupId}::uuid
  `) as { total: number }[];

  return NextResponse.json({ ok: true, voted, count: rows[0]?.total ?? null });
}
