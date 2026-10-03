import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth/session";
import { sql } from "@/lib/db/neon";
import "server-only";

/** Resolve the signed session and confirm the role in the profiles table. */
export async function verifyAdmin() {
  const session = await readSession();
  if (!session) redirect("/?error=unauthenticated");

  const rows = (await sql`
    select role from profiles where id = ${session.userId}::uuid limit 1
  `) as { role?: string }[];

  if (rows[0]?.role !== "admin") {
    redirect("/?error=unauthorized");
  }

  return session;
}