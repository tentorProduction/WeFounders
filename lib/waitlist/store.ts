import { reportReadFailure } from "@/lib/data/read-failure";
import { sql } from "@/lib/db/neon";

/**
 * Waitlist lead capture store (PRD §4.1 — "1-click CSV export", TRD §2 table 7).
 *
 * Neon `waitlist_entries` is the only store. Phone numbers get their own
 * column rather than being folded into `notes`.
 *
 * Leads arrive from anonymous visitors and are read back by founders. Neon has
 * no row-level client, so the constraint is simply that `listWaitlist` is only
 * ever called after an explicit owner check (see the waitlist export route).
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

/** Postgres SQLSTATE for a unique-constraint violation. */
const UNIQUE_VIOLATION = "23505";

function sqlState(error: unknown): string | undefined {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string") return code;
  }
  return undefined;
}

export async function addWaitlistEntry(input: WaitlistInput): Promise<AddWaitlistResult> {
  const email = input.email.trim().toLowerCase();

  try {
    const rows = (await sql`
      insert into waitlist_entries (
        startup_id, email, phone, notes, referral_source, user_id
      )
      values (
        ${input.startupId}::uuid,
        ${email},
        ${input.phone?.trim() || null},
        ${input.notes?.trim() || null},
        ${input.referralSource ?? null},
        ${input.userId}::uuid
      )
      on conflict (startup_id, email) do nothing
      returning id, startup_id, email, phone, user_id, notes,
                referral_source, created_at
    `) as unknown as WaitlistRecord[];

    // `do nothing` yields no row: the address is already on this list.
    if (!rows[0]) return { ok: false, reason: "duplicate" };

    return { ok: true, record: rows[0] };
  } catch (error) {
    if (sqlState(error) === UNIQUE_VIOLATION) return { ok: false, reason: "duplicate" };
    reportReadFailure("waitlist insert failed:", error);
    return { ok: false, reason: "failed" };
  }
}

/** Founder-only: reads the full lead list for one startup. */
export async function listWaitlist(startupId: string): Promise<WaitlistRecord[]> {
  if (!startupId) return [];

  try {
    const rows = (await sql`
      select id, startup_id, email, phone, user_id, notes,
             referral_source, created_at
      from waitlist_entries
      where startup_id = ${startupId}::uuid
      order by created_at desc
    `) as unknown as WaitlistRecord[];

    return rows;
  } catch (error) {
    reportReadFailure("waitlist read failed:", error);
    return [];
  }
}

export async function countWaitlist(startupId: string): Promise<number> {
  if (!startupId) return 0;

  try {
    const rows = (await sql`
      select count(*)::int as total
      from waitlist_entries
      where startup_id = ${startupId}::uuid
    `) as unknown as { total: number }[];

    return rows[0]?.total ?? 0;
  } catch (error) {
    reportReadFailure("waitlist count failed:", error);
    return 0;
  }
}