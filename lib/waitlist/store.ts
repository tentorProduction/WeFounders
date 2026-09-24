import { appendToCollection, readCollection } from "@/lib/demo-store";
import { isSupabaseConfigured } from "@/lib/supabase/environment";

/**
 * Waitlist lead capture store (PRD §4.1 — "1-click CSV export", TRD §2 table 7).
 *
 * Reads/writes Supabase `waitlist_entries` when the backend is configured and
 * transparently falls back to the local demo store so founders never lose a
 * lead while the schema is still being provisioned.
 */

const COLLECTION = "waitlist";

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
  | { ok: true; record: WaitlistRecord; persisted: "supabase" | "local" }
  | { ok: false; reason: "duplicate" | "failed" };

/** Fold the optional phone into the notes column without losing the note. */
function mergeNotes(phone?: string | null, notes?: string | null): string | null {
  return (
    [phone ? `Phone: ${phone}` : null, notes?.trim() || null]
      .filter(Boolean)
      .join(" · ") || null
  );
}

export async function addWaitlistEntry(
  input: WaitlistInput
): Promise<AddWaitlistResult> {
  const email = input.email.trim().toLowerCase();

  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("waitlist_entries")
        .insert({
          startup_id: input.startupId,
          email,
          // TODO(schema): add a dedicated `phone` column to waitlist_entries.
          // Until then the phone is carried alongside any free-text note so
          // neither value is silently dropped.
          notes: mergeNotes(input.phone, input.notes),
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

      return {
        ok: true,
        record: { ...(data as WaitlistRecord), phone: input.phone ?? null },
        persisted: "supabase",
      };
    } catch {
      // Fall through to local capture — never drop a lead because the backend
      // is unreachable.
    }
  }

  const existing = await listWaitlist(input.startupId);
  if (existing.some((row) => row.email === email)) {
    return { ok: false, reason: "duplicate" };
  }

  const record: WaitlistRecord = {
    id: `wl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    startup_id: input.startupId,
    email,
    phone: input.phone ?? null,
    user_id: input.userId ?? null,
    notes: input.notes ?? null,
    referral_source: input.referralSource ?? null,
    created_at: new Date().toISOString(),
  };

  try {
    await appendToCollection<WaitlistRecord>(COLLECTION, record);
    return { ok: true, record, persisted: "local" };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

export async function listWaitlist(startupId: string): Promise<WaitlistRecord[]> {
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("waitlist_entries")
        .select("*")
        .eq("startup_id", startupId)
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        return data as WaitlistRecord[];
      }
    } catch {
      // Fall through to the local store.
    }
  }

  const rows = await readCollection<WaitlistRecord>(COLLECTION);
  return rows.filter((row) => row.startup_id === startupId);
}

export async function countWaitlist(startupId: string): Promise<number> {
  return (await listWaitlist(startupId)).length;
}
