import { NextResponse } from "next/server";

import { getViewer } from "@/lib/auth/viewer";
import { createAdminClient } from "@/lib/supabase/admin";

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
    const body = (await request.json()) as { startupId?: unknown; voted?: unknown };
    startupId = typeof body.startupId === "string" ? body.startupId : "";
    voted = body.voted !== false;
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  if (!startupId) {
    return NextResponse.json({ error: "startupId is required." }, { status: 400 });
  }

  const viewer = await getViewer();
  if (!viewer.userId) {
    return NextResponse.json(
      { error: "Sign in to upvote.", counted: false },
      { status: 401 }
    );
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
