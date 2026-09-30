import { NextResponse } from "next/server";

import { verifyFirebaseIdToken } from "@/lib/auth/firebase-token";
import {
  clearSessionCookie,
  provisionProfile,
  setSessionCookie,
} from "@/lib/auth/session";
import { hasTrustedOrigin } from "@/lib/security/request-origin";
import { clientAddress, isRateLimited } from "@/lib/security/rate-limit";

/**
 * Exchange a Firebase ID token for a WeFounders session.
 *
 * The browser signs in with Google through Firebase, then POSTs the resulting
 * ID token here. We verify the token against Google's JWKS, upsert the profile
 * and set a signed HttpOnly cookie. Sign-out is a DELETE against the same
 * route, which clears the cookie.
 *
 * The ID token is never logged or stored.
 */

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  if (await isRateLimited("auth-session", clientAddress(request.headers), 12, 15 * 60_000)) {
    return NextResponse.json({ error: "Too many sign-in attempts. Try again later." }, { status: 429 });
  }

  let rawBody: string;
  try {
    const reader = request.body?.getReader();
    if (!reader) return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 12_288) {
        await reader.cancel();
        return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
      }
      chunks.push(value);
    }
    const buffer = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.byteLength; }
    rawBody = new TextDecoder().decode(buffer);
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  let idToken = "";
  try {
    const body = JSON.parse(rawBody) as { idToken?: string };
    idToken = typeof body.idToken === "string" ? body.idToken : "";
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  if (!idToken) {
    return NextResponse.json({ error: "An idToken is required." }, { status: 400 });
  }
  if (idToken.length > 11_000) return NextResponse.json({ error: "Sign-in token is too large." }, { status: 400 });

  const identity = await verifyFirebaseIdToken(idToken);
  if (!identity) {
    return NextResponse.json(
      { error: "That sign-in token is invalid or expired." },
      { status: 401 }
    );
  }

  try {
    const user = await provisionProfile(identity);
    await setSessionCookie(user);
    return NextResponse.json({
      userId: user.userId,
      email: user.email,
      name: user.name,
    }, { headers: { "cache-control": "no-store", "x-content-type-options": "nosniff" } });
  } catch (error) {
    console.error("[auth/session] could not provision profile:", error);
    return NextResponse.json(
      { error: "Signed in with Google, but we could not create your profile." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  await clearSessionCookie();
  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
