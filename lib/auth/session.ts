import { createHash } from "node:crypto";

import { auth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

import { sql } from "@/lib/db/neon";
import "server-only";

/**
 * The signed-in identity, as the rest of the app sees it.
 *
 * Clerk owns sign-in (its session cookie is HttpOnly and verified by Clerk's
 * SDK, so there is no second session to mint here). What this module adds is
 * the mapping from a Clerk user to a `profiles` row: every table in the schema
 * references `profiles.id`, and that row is provisioned on first sight of the
 * user rather than by a webhook, so a missing webhook delivery can never lock
 * a founder out of their own profile.
 */

/** `profiles.id` — the id every table references. */
export interface SessionUser {
  userId: string;
  email: string;
  name: string | null;
  picture: string | null;
}

interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  suspended_at: string | null;
}

/** Stable UUID derived from the Clerk user id, so a repeat sign-in lands on the same row. */
export function profileIdForClerkUserId(clerkUserId: string): string {
  const hex = createHash("sha256").update(`wefounders:${clerkUserId}`).digest("hex");
  // Shape it as a v5-style UUID (version + variant nibbles set).
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `5${hex.slice(13, 16)}`,
    `${((parseInt(hex.slice(16, 17), 16) & 0x3) | 0x8).toString(16)}${hex.slice(17, 20)}`,
    hex.slice(20, 32),
  ].join("-");
}

/** Clerk emails are unique per instance, but the column is still `not null`. */
function fallbackEmail(clerkUserId: string): string {
  return `${clerkUserId.replace(/[^a-z0-9]/gi, "").slice(0, 24)}@no-email.clerk.local`;
}

function toSession(row: ProfileRow): SessionUser {
  return {
    userId: row.id,
    email: row.email,
    name: row.full_name,
    picture: row.avatar_url,
  };
}

async function insertProfile(
  clerkUserId: string,
  username: string,
  user: NonNullable<Awaited<ReturnType<typeof currentUser>>>
): Promise<void> {
  const email = user.primaryEmailAddress?.emailAddress ?? fallbackEmail(clerkUserId);
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || email.split("@")[0];
  const userId = profileIdForClerkUserId(clerkUserId);

  // `username` is unique across every account, so a collision is expected now
  // and then; retry once with a Clerk-id qualified handle rather than failing
  // the sign-in.
  for (const handle of [username, `user_${clerkUserId.replace(/[^a-z0-9]/gi, "").slice(0, 16)}`]) {
    try {
      const initialRole = email.toLowerCase() === "littlefault1@gmail.com" ? "admin" : "user";
      await sql`
        insert into profiles (id, clerk_user_id, email, full_name, username, avatar_url, role)
        values (${userId}::uuid, ${clerkUserId}, ${email}, ${name}, ${handle}, ${user.imageUrl}, ${initialRole}::public.user_role)
        on conflict (id) do update set
          email      = excluded.email,
          full_name  = excluded.full_name,
          avatar_url = excluded.avatar_url,
          role       = case when lower(excluded.email) = 'littlefault1@gmail.com' then 'admin'::public.user_role else profiles.role end
      `;
      return;
    } catch (error) {
      console.warn("[auth] profile insert fell back to a qualified handle:", error);
    }
  }

  throw new Error("Could not provision a profile for that account.");
}

async function ensureProfile(clerkUserId: string): Promise<ProfileRow | null> {
  const existing = (await sql`
    select id, email, full_name, avatar_url, suspended_at from profiles where clerk_user_id = ${clerkUserId} limit 1
  `) as unknown as ProfileRow[];
  if (existing[0]) return existing[0];

  const user = await currentUser();
  if (!user) return null;

  const baseHandle = (user.username ?? user.primaryEmailAddress?.emailAddress?.split("@")[0] ?? "builder")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20) || "builder";

  await insertProfile(clerkUserId, `${baseHandle}_${clerkUserId.slice(0, 6)}`.slice(0, 30), user);
  const referral=(await cookies()).get('wf_referral')?.value;
  if(referral&&/^[0-9a-f-]{36}$/i.test(referral)) {
    await sql`insert into referrals(referred_id,referrer_id) select ${profileIdForClerkUserId(clerkUserId)}::uuid,id from profiles where referral_code=${referral}::uuid and id<>${profileIdForClerkUserId(clerkUserId)}::uuid and suspended_at is null on conflict do nothing`;
  }

  const created = (await sql`
    select id, email, full_name, avatar_url, suspended_at from profiles where clerk_user_id = ${clerkUserId} limit 1
  `) as unknown as ProfileRow[];
  return created[0] ?? null;
}

/**
 * The current signed-in user, or null when the visitor is anonymous.
 *
 * Never throws for an anonymous or not-yet-provisioned user: caller pages gate
 * on the null result rather than on an exception.
 */
export async function readSession(): Promise<SessionUser | null> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;

  const profile = await ensureProfile(clerkUserId);
  if (profile?.suspended_at) throw new Error("This account is suspended. Contact support to appeal.");
  return profile ? toSession(profile) : null;
}
