import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "wf_session";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function decodeBase64Url(value: string): Uint8Array<ArrayBuffer> | null {
  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
    const bytes = new Uint8Array(new ArrayBuffer(binary.length));
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  } catch {
    return null;
  }
}

async function readSignedUserId(token: string, secret: string): Promise<string | null> {
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;

  const payloadBytes = decodeBase64Url(payload);
  const signatureBytes = decodeBase64Url(signature);
  if (!payloadBytes || !signatureBytes) return null;

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const valid = await crypto.subtle.verify("HMAC", key, signatureBytes, new TextEncoder().encode(payload));
    if (!valid) return null;

    const session = JSON.parse(new TextDecoder().decode(payloadBytes)) as { userId?: unknown };
    return typeof session.userId === "string" && UUID_PATTERN.test(session.userId)
      ? session.userId
      : null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.SESSION_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  const userId = token && secret ? await readSignedUserId(token, secret) : null;

  if (!userId) {
    return NextResponse.redirect(new URL("/?error=unauthenticated", request.url));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    return NextResponse.redirect(new URL("/?error=unauthorized", request.url));
  }

  const profileUrl = new URL("/rest/v1/profiles", supabaseUrl);
  profileUrl.searchParams.set("id", `eq.${userId}`);
  profileUrl.searchParams.set("select", "role");

  try {
    const response = await fetch(profileUrl, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
      cache: "no-store",
    });
    const profiles = response.ok ? (await response.json()) as Array<{ role?: string }> : [];
    if (!profiles.some((profile) => profile.role === "admin")) {
      return NextResponse.redirect(new URL("/?error=unauthorized", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/?error=unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
