import { NextResponse } from "next/server";

import { getViewer } from "@/lib/auth/viewer";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import { getStartupById } from "@/lib/data/startups";
import { clientAddress, isRateLimited } from "@/lib/security/rate-limit";
import { readBoundedBody } from "@/lib/security/request-body";

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

  const supabase = createAdminClient();

  try {
    if (voted) {
      const { error } = await supabase
        .from("upvotes")
        .upsert(
          { startup_id: startupId, user_id: viewer.userId },
          { onConflict: "startup_id,user_id", ignoreDuplicates: true }
        );
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("upvotes")
        .delete()
        .eq("startup_id", startupId)
        .eq("user_id", viewer.userId);
      if (error) throw error;
    }
  } catch (error) {
    console.error("[upvotes] write failed:", error);
    return NextResponse.json(
      { error: "Could not record that vote.", counted: false },
      { status: 500 }
    );
  }

  const { count } = await supabase
    .from("upvotes")
    .select("id", { count: "exact", head: true })
    .eq("startup_id", startupId);

  return NextResponse.json({ ok: true, voted, count: count ?? null });
}
