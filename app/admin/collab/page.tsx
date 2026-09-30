import { createAdminClient } from "@/lib/supabase/admin";
import { CollabModeration, type CollabAdminPost } from "./client";

export default async function AdminCollabPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("collab_posts")
    .select("id, title, role_type, description, equity_or_compensation, contact_channel, is_active, created_at, startup:startups(name, slug), author:profiles(full_name, email)")
    .order("created_at", { ascending: false });

  if (error) return <p role="alert" className="rounded-lg border border-rose-900/70 bg-rose-950/20 p-4 text-rose-200">Could not load collab listings: {error.message}</p>;
  return <CollabModeration posts={(data ?? []) as unknown as CollabAdminPost[]} />;
}
