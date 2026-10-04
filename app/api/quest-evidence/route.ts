import { z } from "zod";
import { readSession } from "@/lib/auth/session";
import { sql } from "@/lib/db/neon";
import { requireFeature } from "@/lib/platform";
import { hasTrustedOrigin } from "@/lib/security/request-origin";
import { isRateLimited } from "@/lib/security/rate-limit";
import { evidenceImageType, MAX_EVIDENCE_BYTES } from "@/lib/security/quest-evidence";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return Response.json({ error: "Request origin rejected." }, { status: 403 });
  const user = await readSession();
  if (!user) return Response.json({ error: "Sign in to upload evidence." }, { status: 401 });
  const quest = z.uuid().safeParse(request.headers.get("x-quest-id"));
  if (!quest.success) return Response.json({ error: "Invalid quest." }, { status: 400 });
  await requireFeature("quests_enabled");
  if (await isRateLimited("quest-evidence", user.userId, 10, 3_600_000)) return Response.json({ error: "Upload limit reached. Try again in an hour." }, { status: 429 });
  const eligible = await sql`select q.id from testing_quests q join startups s on s.id=q.startup_id join quest_members m on m.quest_id=q.id where q.id=${quest.data}::uuid and m.tester_id=${user.userId}::uuid and s.founder_id<>${user.userId}::uuid and s.status='approved' and s.archived_at is null and s.launch_date<=now() and q.approval_status='approved' and ((q.status='active' and (q.deadline is null or q.deadline>now())) or exists(select 1 from quest_submissions r where r.quest_id=q.id and r.tester_id=${user.userId}::uuid and r.review_state='needs_changes'))`;
  if (!eligible.length) return Response.json({ error: "Join an available quest before uploading evidence." }, { status: 403 });
  if (Number(request.headers.get("content-length")) > MAX_EVIDENCE_BYTES) return Response.json({ error: "Each screenshot must be 2 MB or smaller." }, { status: 413 });
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ error: "Choose a screenshot." }, { status: 400 });
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_EVIDENCE_BYTES) {
        await reader.cancel();
        return Response.json({ error: "Each screenshot must be 2 MB or smaller." }, { status: 413 });
      }
      chunks.push(value);
    }
  } catch {
    return Response.json({ error: "Upload interrupted. Please retry." }, { status: 400 });
  }
  const image = Buffer.concat(chunks, size);
  const mime = evidenceImageType(image);
  if (!mime) return Response.json({ error: "Use a valid PNG or JPEG screenshot, up to 12,000 pixels per side." }, { status: 415 });
  // ponytail: five 2 MB screenshots per report in Neon; move larger files to private object storage.
  try {
    const rows = await sql`insert into quest_evidence(quest_id,tester_id,mime_type,content) values(${quest.data}::uuid,${user.userId}::uuid,${mime},decode(${image.toString("base64")},'base64')) returning id`;
    return Response.json({ id: rows[0].id, url: `/api/quest-evidence/${rows[0].id}` }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Error && /Evidence upload limit reached|Quest evidence unavailable/.test(error.message)) return Response.json({ error: "Evidence limit reached or quest unavailable. Remove an unused screenshot before retrying." }, { status: 409 });
    console.error("[quest-evidence] Upload could not be stored.", error instanceof Error ? error.name : "Database error");
    return Response.json({ error: "Could not store this screenshot. Please retry." }, { status: 503 });
  }
}
