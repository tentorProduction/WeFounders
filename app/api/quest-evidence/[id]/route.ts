import { z } from "zod";
import { readSession } from "@/lib/auth/session";
import { sql } from "@/lib/db/neon";
import { hasTrustedOrigin } from "@/lib/security/request-origin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return new Response(null, { status: 404 });
  const user = await readSession();
  if (!user) return new Response(null, { status: 401, headers: { "Cache-Control": "private, no-store" } });
  const rows = await sql`select e.mime_type,encode(e.content,'base64') as content from quest_evidence e join testing_quests q on q.id=e.quest_id join startups s on s.id=q.startup_id join profiles p on p.id=${user.userId}::uuid where e.id=${id}::uuid and (e.tester_id=p.id or p.role='admin' or (s.founder_id=p.id and e.submission_id is not null))`;
  if (!rows.length) return new Response(null, { status: 404, headers: { "Cache-Control": "private, no-store" } });
  return new Response(new Uint8Array(Buffer.from(String(rows[0].content), "base64")), { headers: {
    "Content-Type": String(rows[0].mime_type),
    "Content-Disposition": `inline; filename="evidence-${id}.${rows[0].mime_type === "image/png" ? "png" : "jpg"}"`,
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; sandbox",
    "X-Robots-Tag": "noindex, nofollow",
  } });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasTrustedOrigin(request)) return new Response(null, { status: 403 });
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return new Response(null, { status: 404 });
  const user = await readSession();
  if (!user) return new Response(null, { status: 401 });
  const rows = await sql`delete from quest_evidence where id=${id}::uuid and tester_id=${user.userId}::uuid and submission_id is null returning id`;
  return new Response(null, { status: rows.length ? 204 : 404, headers: { "Cache-Control": "no-store" } });
}
