import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

/** Resolve the signed Firebase session and confirm the role in Supabase. */
export async function verifyAdmin() {
  const session = await readSession();
  if (!session) redirect("/?error=unauthenticated");

  const supabase = createAdminClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.userId)
    .maybeSingle();

  if (error || profile?.role !== "admin") {
    redirect("/?error=unauthorized");
  }

  return session;
}
