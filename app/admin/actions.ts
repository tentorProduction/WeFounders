"use server";

import { getServerSupabase } from "@/lib/supabase/server";
import { verifyAdmin } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";

export async function approveStartup(startupId: string, launchDate?: string) {
  await verifyAdmin();
  const supabase = await getServerSupabase();

  const targetDate = launchDate || new Date().toISOString();

  const { error } = await supabase
    .from("startups")
    .update({ 
      status: "approved", 
      launch_date: targetDate,
      rejection_reason: null
    })
    .eq("id", startupId);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/submissions");
  revalidatePath("/admin/startups");
}

export async function rejectStartup(startupId: string, reason: string) {
  await verifyAdmin();
  const supabase = await getServerSupabase();

  const { error } = await supabase
    .from("startups")
    .update({ 
      status: "rejected", 
      rejection_reason: reason 
    })
    .eq("id", startupId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/submissions");
}

export async function toggleFeatured(startupId: string, isFeatured: boolean) {
  await verifyAdmin();
  const supabase = await getServerSupabase();

  const { error } = await supabase
    .from("startups")
    .update({ is_featured: isFeatured })
    .eq("id", startupId);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/submissions");
  revalidatePath("/admin/startups");
}

export async function deleteStartup(startupId: string) {
  await verifyAdmin();
  const supabase = await getServerSupabase();

  // Archive/delete
  const { error } = await supabase
    .from("startups")
    .delete()
    .eq("id", startupId);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/submissions");
  revalidatePath("/admin/startups");
}
