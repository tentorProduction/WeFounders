import { NextResponse } from "next/server";

import { verifyFirebaseIdToken } from "@/lib/auth/firebase-token";
import {
  clearSessionCookie,
  provisionProfile,
  setSessionCookie,
} from "@/lib/auth/session";

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
  let idToken = "";

  try {
    const body = (await request.json()) as { idToken?: string };
    idToken = typeof body.idToken === "string" ? body.idToken : "";
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  if (!idToken) {
    return NextResponse.json({ error: "An idToken is required." }, { status: 400 });
  }

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
    });
  } catch (error) {
    console.error("[auth/session] could not provision profile:", error);
    return NextResponse.json(
      { error: "Signed in with Google, but we could not create your profile." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
