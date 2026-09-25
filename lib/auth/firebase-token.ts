import { createPublicKey, createVerify, type KeyObject } from "node:crypto";

/**
 * Server-side Firebase ID token verification.
 *
 * Firebase signs ID tokens with RS256 keys published by Google. Verifying them
 * here means the server can trust an identity without a Firebase Admin service
 * account, and without holding a Supabase session — which matters because our
 * identity provider is Firebase while our data layer is Supabase.
 *
 * Verification steps (all of which must pass):
 *   1. `kid` resolves to a live key in Google's JWKS for the project.
 *   2. RS256 signature over `<header>.<payload>` matches that key.
 *   3. `aud` equals the Firebase project id and `iss` is the matching issuer.
 *   4. `exp` is in the future and `iat` is not far in the future.
 */

const JWKS_URL =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

const ISSUER_PREFIX = "https://securetoken.google.com/";

/** Clock skew tolerated on `iat`, in seconds. */
const MAX_CLOCK_SKEW = 60;

/** How long a fetched JWKS is trusted before a refetch, in ms. */
const JWKS_TTL_MS = 60 * 60 * 1000;

export interface FirebaseIdentity {
  /** Firebase uid — stable per user, used as our identity key. */
  uid: string;
  email: string;
  name: string | null;
  picture: string | null;
}

interface Jwk {
  kid: string;
  kty: string;
  n: string;
  e: string;
}

let cachedKeys: { fetchedAt: number; keys: Map<string, KeyObject> } | null = null;

function decodeSegment<T>(segment: string): T {
  return JSON.parse(Buffer.from(segment, "base64url").toString("utf8")) as T;
}

async function loadKeys(): Promise<Map<string, KeyObject>> {
  const fresh = cachedKeys && Date.now() - cachedKeys.fetchedAt < JWKS_TTL_MS;
  if (fresh) return cachedKeys!.keys;

  const response = await fetch(JWKS_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not fetch Firebase signing keys (HTTP ${response.status}).`);
  }

  const body = (await response.json()) as { keys?: Jwk[] };
  const keys = new Map<string, KeyObject>();

  for (const jwk of body.keys ?? []) {
    if (jwk.kty !== "RSA" || !jwk.kid) continue;
    keys.set(
      jwk.kid,
      createPublicKey({ key: { kty: jwk.kty, n: jwk.n, e: jwk.e }, format: "jwk" })
    );
  }

  cachedKeys = { fetchedAt: Date.now(), keys };
  return keys;
}

function firebaseProjectId(): string {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error(
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set — cannot verify Firebase identity tokens."
    );
  }
  return projectId;
}

/**
 * Returns the verified identity, or null when the token is invalid, expired,
 * signed for another project, or unverifiable. Never throws for a bad token:
 * callers treat null as "not signed in".
 */
export async function verifyFirebaseIdToken(
  idToken: string
): Promise<FirebaseIdentity | null> {
  if (!idToken || idToken.split(".").length !== 3) return null;

  const [headerSegment, payloadSegment, signatureSegment] = idToken.split(".");

  // A malformed token is a client mistake, not a server failure — decode it
  // quietly and let the caller answer 401 rather than logging a stack trace.
  let header: { alg?: string; kid?: string };
  let payload: {
    aud?: string;
    iss?: string;
    sub?: string;
    exp?: number;
    iat?: number;
    email?: string;
    name?: string;
    picture?: string;
    user_id?: string;
  };

  try {
    header = decodeSegment(headerSegment);
    payload = decodeSegment(payloadSegment);
  } catch {
    return null;
  }

  try {
    const projectId = firebaseProjectId();

    if (header.alg !== "RS256" || !header.kid) return null;

    const keys = await loadKeys();
    const key = keys.get(header.kid);
    if (!key) return null;

    const verifier = createVerify("RSA-SHA256");
    verifier.update(`${headerSegment}.${payloadSegment}`);
    verifier.end();

    if (!verifier.verify(key, Buffer.from(signatureSegment, "base64url"))) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.aud !== projectId) return null;
    if (payload.iss !== `${ISSUER_PREFIX}${projectId}`) return null;
    if (typeof payload.exp !== "number" || payload.exp <= now) return null;
    if (typeof payload.iat !== "number" || payload.iat > now + MAX_CLOCK_SKEW) return null;

    const uid = payload.sub ?? payload.user_id;
    if (!uid) return null;

    return {
      uid,
      email: payload.email ?? "",
      name: payload.name ?? null,
      picture: payload.picture ?? null,
    };
  } catch (error) {
    console.error("[auth] Firebase ID token verification failed:", error);
    return null;
  }
}
