import { getServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function verifyAdmin() {
  const supabase = await getServerSupabase();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/?error=unauthorized");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    redirect("/?error=unauthorized");
  }

  return user;
}
