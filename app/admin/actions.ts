"use server";

import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { StartupStage, TargetMarket } from "@/types/database";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function assertId(id: string) {
  if (!UUID_PATTERN.test(id)) throw new Error("Invalid record id.");
}

function kathmanduBatchDate(daysAhead = 0): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return new Date(Date.UTC(Number(value.year), Number(value.month) - 1, Number(value.day) + daysAhead, -5, -45)).toISOString();
}

function refreshAdminData() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/submissions");
  revalidatePath("/admin/startups");
}

export async function approveStartup(startupId: string, launchDate?: string) {
  await verifyAdmin();
  assertId(startupId);
  const supabase = createAdminClient();
  const parsedDate = launchDate ? new Date(launchDate) : new Date(kathmanduBatchDate());
  if (Number.isNaN(parsedDate.valueOf())) throw new Error("Invalid launch date.");

  const { data, error } = await supabase
    .from("startups")
    .update({ status: "approved", launch_date: parsedDate.toISOString(), rejection_reason: null })
    .eq("id", startupId)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(`Could not approve startup: ${error.message}`);
  if (!data) throw new Error("Startup was not found.");
  refreshAdminData();
}

export async function scheduleStartupTomorrow(startupId: string) {
  await approveStartup(startupId, kathmanduBatchDate(1));
}

export async function rejectStartup(startupId: string, reason: string) {
  await verifyAdmin();
  assertId(startupId);
  const safeReason = reason.trim();
  if (safeReason.length < 3 || safeReason.length > 1000) {
    throw new Error("Enter a rejection reason between 3 and 1000 characters.");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("startups")
    .update({ status: "rejected", rejection_reason: safeReason })
    .eq("id", startupId)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(`Could not reject startup: ${error.message}`);
  if (!data) throw new Error("Startup was not found.");
  refreshAdminData();
}

export async function toggleFeatured(startupId: string, isFeatured: boolean) {
  await verifyAdmin();
  assertId(startupId);
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("startups")
    .update({ is_featured: isFeatured })
    .eq("id", startupId)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(`Could not update spotlight: ${error.message}`);
  if (!data) throw new Error("Startup was not found.");
  refreshAdminData();
}

export async function deleteStartup(startupId: string) {
  await verifyAdmin();
  assertId(startupId);
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("startups")
    .delete()
    .eq("id", startupId)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(`Could not delete startup: ${error.message}`);
  if (!data) throw new Error("Startup was not found.");
  refreshAdminData();
}

export async function approveAllPending() {
  await verifyAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("startups")
    .update({ status: "approved", launch_date: kathmanduBatchDate(), rejection_reason: null })
    .in("status", ["pending_approval", "draft"]);
  if (error) throw new Error(`Could not approve pending startups: ${error.message}`);
  refreshAdminData();
}

export interface ManualStartupInput {
  name: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  founderEmail: string;
  targetMarket: TargetMarket;
  stage: StartupStage;
}

export async function createManualStartup(input: ManualStartupInput) {
  await verifyAdmin();
  const name = input.name.trim();
  const tagline = input.tagline.trim();
  const description = input.description.trim();
  const founderEmail = input.founderEmail.trim().toLowerCase();
  if (name.length < 2 || name.length > 80) throw new Error("Startup name must be 2–80 characters.");
  if (tagline.length < 5 || tagline.length > 180) throw new Error("Tagline must be 5–180 characters.");
  if (!description || description.length > 10000) throw new Error("Add a pitch story under 10,000 characters.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(founderEmail)) throw new Error("Enter a valid founder email.");
  if (!new Set(["nepal_domestic", "global_export", "hybrid"]).has(input.targetMarket)) throw new Error("Choose a valid target market.");
  if (!new Set(["concept", "closed_alpha", "public_beta", "launched"]).has(input.stage)) throw new Error("Choose a valid startup stage.");

  let websiteUrl = "";
  try {
    const parsedUrl = new URL(input.websiteUrl.trim());
    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") throw new Error();
    websiteUrl = parsedUrl.toString();
  } catch {
    throw new Error("Enter a valid HTTP or HTTPS website URL.");
  }

  const supabase = createAdminClient();
  const { data: founder, error: founderError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", founderEmail)
    .maybeSingle();
  if (founderError) throw new Error(`Could not find founder: ${founderError.message}`);
  if (!founder) throw new Error("That founder must sign in once before a startup can be created for them.");

  const slugBase = name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 55) || "startup";
  const slug = `${slugBase}-${crypto.randomUUID().slice(0, 8)}`;
  const { error } = await supabase.from("startups").insert({
    founder_id: founder.id,
    slug,
    name,
    tagline,
    description,
    website_url: websiteUrl,
    logo_url: "",
    target_market: input.targetMarket,
    stage: input.stage,
    status: "pending_approval",
  });
  if (error) throw new Error(`Could not create startup: ${error.message}`);
  refreshAdminData();
}

export async function resetUpvotes(startupId: string) {
  await verifyAdmin();
  assertId(startupId);
  const supabase = createAdminClient();
  const { error } = await supabase.from("upvotes").delete().eq("startup_id", startupId);
  if (error) throw new Error(`Could not reset upvotes: ${error.message}`);
  refreshAdminData();
}

export async function updateStartupTags(startupId: string, tagIds: string[]) {
  await verifyAdmin();
  assertId(startupId);
  const ids = [...new Set(tagIds)];
  if (ids.some((id) => !UUID_PATTERN.test(id))) throw new Error("Invalid tag selection.");
  const supabase = createAdminClient();

  const { data: currentRows, error: currentError } = await supabase
    .from("startup_tags").select("tag_id").eq("startup_id", startupId);
  if (currentError) throw new Error(`Could not load startup tags: ${currentError.message}`);
  const current = new Set((currentRows ?? []).map((row) => row.tag_id));
  const requested = new Set(ids);
  const removeIds = [...current].filter((id) => !requested.has(id));
  const addIds = ids.filter((id) => !current.has(id));

  if (addIds.length) {
    const { error } = await supabase.from("startup_tags").insert(addIds.map((tagId) => ({ startup_id: startupId, tag_id: tagId })));
    if (error) throw new Error(`Could not add tags: ${error.message}`);
  }
  if (removeIds.length) {
    const { error } = await supabase.from("startup_tags").delete().eq("startup_id", startupId).in("tag_id", removeIds);
    if (error) throw new Error(`Tags were added, but old tags could not be removed: ${error.message}`);
  }
  refreshAdminData();
}
