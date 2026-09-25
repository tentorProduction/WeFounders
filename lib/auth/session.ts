import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Session cookies for a Firebase-authenticated user.
 *
 * After the browser signs in with Google (via Firebase), it posts the Firebase
 * ID token to /api/auth/session. The server verifies it, upserts the matching
 * `profiles` row, and issues a signed, HttpOnly cookie carrying the profile id.
 * Every subsequent server read uses that cookie as the identity — no Supabase
 * auth session is involved.
 *
 * The cookie is HMAC-SHA256 signed, so it cannot be forged even though its
 * payload is readable.
 */

export const SESSION_COOKIE = "wf_session";

/** 30 days. */
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export interface SessionUser {
  /** `profiles.id` — the id every table references. */
  userId: string;
  email: string;
  name: string | null;
  picture: string | null;
  /** The Firebase uid this session was minted from. */
  firebaseUid: string;
}

function signingSecret(): string {
  const secret =
    process.env.SESSION_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error(
      "Set SESSION_SECRET (or SUPABASE_SERVICE_ROLE_KEY) to sign session cookies."
    );
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", signingSecret()).update(payload).digest("base64url");
}

/** Stable UUID derived from the Firebase uid, so replays land on the same row. */
export function profileIdForFirebaseUid(uid: string): string {
  const hex = createHash("sha256").update(`wefounders:${uid}`).digest("hex");
  // Shape it as a v5-style UUID (version + variant nibbles set).
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `5${hex.slice(13, 16)}`,
    `${((parseInt(hex.slice(16, 17), 16) & 0x3) | 0x8).toString(16)}${hex.slice(17, 20)}`,
    hex.slice(20, 32),
  ].join("-");
}

function encodeSession(user: SessionUser): string {
  const payload = Buffer.from(JSON.stringify(user), "utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decodeSession(token: string): SessionUser | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof parsed?.userId !== "string" || typeof parsed?.email !== "string") {
      return null;
    }
    return parsed as SessionUser;
  } catch {
    return null;
  }
}

/**
 * Create or update the profile for a verified Firebase identity, then return
 * the session payload. Profile writes use the service role because the row is
 * provisioned by the server, not by a signed-in Supabase user.
 */
export async function provisionProfile(identity: {
  uid: string;
  email: string;
  name: string | null;
  picture: string | null;
}): Promise<SessionUser> {
  const userId = profileIdForFirebaseUid(identity.uid);
  const fallbackHandle = (identity.email.split("@")[0] || "builder")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20) || "builder";

  const supabase = createAdminClient();

  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      firebase_uid: identity.uid,
      email: identity.email,
      full_name: identity.name ?? fallbackHandle,
      username: `${fallbackHandle}_${identity.uid.slice(0, 6)}`.slice(0, 30),
      avatar_url: identity.picture,
    },
    { onConflict: "id", ignoreDuplicates: false }
  );

  if (error) {
    // A username collision on a different row should not block sign-in; retry
    // with a uid-qualified handle.
    console.warn(`[auth] profile upsert fell back: ${error.message}`);
    const { error: retryError } = await supabase.from("profiles").upsert(
      {
        id: userId,
        firebase_uid: identity.uid,
        email: identity.email,
        full_name: identity.name ?? fallbackHandle,
        username: `user_${identity.uid.slice(0, 12)}`,
        avatar_url: identity.picture,
      },
      { onConflict: "id" }
    );
    if (retryError) throw new Error(`Could not provision profile: ${retryError.message}`);
  }

  return {
    userId,
    email: identity.email,
    name: identity.name,
    picture: identity.picture,
    firebaseUid: identity.uid,
  };
}

export async function setSessionCookie(user: SessionUser): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, encodeSession(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/** Read the signed session from the request cookies, if it is valid. */
export async function readSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return token ? decodeSession(token) : null;
}
