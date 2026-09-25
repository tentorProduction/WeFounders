import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Waitlist lead capture store (PRD §4.1 — "1-click CSV export", TRD §2 table 7).
 *
 * Supabase `waitlist_entries` is the only store. Phone numbers get their own
 * column rather than being folded into `notes`.
 *
 * The service-role client is used because leads arrive from anonymous visitors
 * and are read back by founders — neither of which is a Supabase auth session
 * in this deployment. `listWaitlist` must only be called after an explicit
 * owner check (see the waitlist export route).
 */

export interface WaitlistRecord {
  id: string;
  startup_id: string;
  email: string;
  phone: string | null;
  user_id: string | null;
  notes: string | null;
  referral_source: string | null;
  created_at: string;
}

export interface WaitlistInput {
  startupId: string;
  email: string;
  phone?: string | null;
  notes?: string | null;
  referralSource?: string | null;
  userId?: string | null;
}

export type AddWaitlistResult =
  | { ok: true; record: WaitlistRecord }
  | { ok: false; reason: "duplicate" | "failed" };

export async function addWaitlistEntry(input: WaitlistInput): Promise<AddWaitlistResult> {
  const email = input.email.trim().toLowerCase();

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("waitlist_entries")
      .insert({
        startup_id: input.startupId,
        email,
        phone: input.phone?.trim() || null,
        notes: input.notes?.trim() || null,
        referral_source: input.referralSource ?? null,
        user_id: input.userId ?? null,
      })
      .select()
      .single();

    if (error) {
      // 23505 = unique violation on (startup_id, email)
      if (error.code === "23505") return { ok: false, reason: "duplicate" };
      throw error;
    }

    return { ok: true, record: data as WaitlistRecord };
  } catch (error) {
    console.error("[waitlist] insert failed:", error);
    return { ok: false, reason: "failed" };
  }
}

/** Founder-only: reads the full lead list for one startup. */
export async function listWaitlist(startupId: string): Promise<WaitlistRecord[]> {
  if (!startupId) return [];

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("waitlist_entries")
      .select("*")
      .eq("startup_id", startupId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as WaitlistRecord[];
  } catch (error) {
    console.error("[waitlist] read failed:", error);
    return [];
  }
}

export async function countWaitlist(startupId: string): Promise<number> {
  if (!startupId) return 0;

  try {
    const supabase = createAdminClient();
    const { count, error } = await supabase
      .from("waitlist_entries")
      .select("id", { count: "exact", head: true })
      .eq("startup_id", startupId);

    if (error) throw error;
    return count ?? 0;
  } catch (error) {
    console.error("[waitlist] count failed:", error);
    return 0;
  }
}
