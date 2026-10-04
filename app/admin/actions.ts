"use server";

import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/auth/admin";
import { auditedSql } from "@/lib/db/neon";
import type { StartupStage, TargetMarket } from "@/types/database";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function assertId(id: string) {
  if (!UUID_PATTERN.test(id)) throw new Error("Invalid record id.");
}

function getBatchDate(daysAhead = 0): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysAhead, 0, 0, 0)).toISOString();
}

function refreshAdminData() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/submissions");
  revalidatePath("/admin/startups");
  revalidatePath("/admin/collab");
}

export async function setCollabPostActive(postId: string, isActive: boolean) {
  const admin = await verifyAdmin();
  const sql = auditedSql(admin.userId);
  assertId(postId);
  const rows = await sql`
    update collab_posts set is_active = ${isActive} where id = ${postId}::uuid returning id
  `;
  if (rows.length === 0) throw new Error("Listing was not found.");
  refreshAdminData();
}

export async function approveStartup(startupId: string, launchDate?: string) {
  const admin = await verifyAdmin();
  const sql = auditedSql(admin.userId);
  assertId(startupId);
  const parsedDate = launchDate ? new Date(launchDate) : new Date(getBatchDate());
  if (Number.isNaN(parsedDate.valueOf())) throw new Error("Invalid launch date.");

  const rows = await sql`
    update startups
    set status = 'approved', launch_date = ${parsedDate.toISOString()}, rejection_reason = null
    where id = ${startupId}::uuid
    returning id
  `;
  if (rows.length === 0) throw new Error("Startup was not found.");
  refreshAdminData();
}

export async function scheduleStartupTomorrow(startupId: string) {
  await approveStartup(startupId, getBatchDate(1));
}

export async function rejectStartup(startupId: string, reason: string) {
  const admin = await verifyAdmin();
  const sql = auditedSql(admin.userId);
  assertId(startupId);
  const safeReason = reason.trim();
  if (safeReason.length < 3 || safeReason.length > 1000) {
    throw new Error("Enter a rejection reason between 3 and 1000 characters.");
  }

  const rows = await sql`
    update startups set status = 'rejected', rejection_reason = ${safeReason}
    where id = ${startupId}::uuid
    returning id
  `;
  if (rows.length === 0) throw new Error("Startup was not found.");
  refreshAdminData();
}

export async function toggleFeatured(startupId: string, isFeatured: boolean) {
  const admin = await verifyAdmin();
  const sql = auditedSql(admin.userId);
  assertId(startupId);
  const rows = await sql`
    update startups set is_featured = ${isFeatured} where id = ${startupId}::uuid returning id
  `;
  if (rows.length === 0) throw new Error("Startup was not found.");
  refreshAdminData();
}

export async function deleteStartup(startupId: string) {
  const admin = await verifyAdmin();
  const sql = auditedSql(admin.userId);
  assertId(startupId);

  // Cleanly delete child rows to prevent foreign key issues
  await sql`delete from startup_tags where startup_id = ${startupId}::uuid`;
  await sql`delete from startup_media where startup_id = ${startupId}::uuid`;
  await sql`delete from upvotes where startup_id = ${startupId}::uuid`;
  await sql`delete from comments where startup_id = ${startupId}::uuid`;
  await sql`delete from waitlist_entries where startup_id = ${startupId}::uuid`;
  await sql`delete from follows where target_type = 'startup' and target_id = ${startupId}::uuid`;
  await sql`delete from saved_items where item_type = 'startup' and item_id = ${startupId}::uuid`;
  await sql`delete from project_updates where startup_id = ${startupId}::uuid`;
  await sql`delete from startup_updates where startup_id = ${startupId}::uuid`;
  await sql`delete from testing_quests where startup_id = ${startupId}::uuid`;

  const rows = await sql`
    delete from startups where id = ${startupId}::uuid returning id
  `;
  if (rows.length === 0) {
    const alt = await sql`
      update startups set archived_at=now(), status='rejected' where id = ${startupId}::uuid returning id
    `;
    if (alt.length === 0) throw new Error("Startup was not found.");
  }
  refreshAdminData();
}

export async function approveAllPending() {
  const admin = await verifyAdmin();
  const sql = auditedSql(admin.userId);
  await sql`
    update startups
    set status = 'approved', launch_date = ${getBatchDate()}, rejection_reason = null
    where status = 'pending_approval'
  `;
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
  const admin = await verifyAdmin();
  const sql = auditedSql(admin.userId);
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

  const founders = (await sql`
    select id from profiles where email = ${founderEmail} limit 1
  `) as { id: string }[];
  const founder = founders[0];
  if (!founder) throw new Error("That founder must sign in once before a startup can be created for them.");

  const slugBase = name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 55) || "startup";
  const slug = `${slugBase}-${crypto.randomUUID().slice(0, 8)}`;
  await sql`
    insert into startups (
      founder_id, slug, name, tagline, description,
      website_url, logo_url, target_market, stage, status
    )
    values (
      ${founder.id}::uuid,
      ${slug},
      ${name},
      ${tagline},
      ${description},
      ${websiteUrl},
      '',
      ${input.targetMarket}::target_market,
      ${input.stage}::startup_stage,
      'pending_approval'
    )
  `;
  refreshAdminData();
}

export async function resetUpvotes(startupId: string) {
  const admin = await verifyAdmin();
  const sql = auditedSql(admin.userId);
  assertId(startupId);
  await sql`delete from upvotes where startup_id = ${startupId}::uuid`;
  refreshAdminData();
}

export async function updateStartupTags(startupId: string, tagIds: string[]) {
  const admin = await verifyAdmin();
  const sql = auditedSql(admin.userId);
  assertId(startupId);
  const ids = [...new Set(tagIds)];
  if (ids.some((id) => !UUID_PATTERN.test(id))) throw new Error("Invalid tag selection.");

  const currentRows = (await sql`
    select tag_id from startup_tags where startup_id = ${startupId}::uuid
  `) as { tag_id: string }[];
  const current = new Set(currentRows.map((row) => row.tag_id));
  const requested = new Set(ids);
  const removeIds = [...current].filter((id) => !requested.has(id));
  const addIds = ids.filter((id) => !current.has(id));

  if (addIds.length) {
    await sql`
      insert into startup_tags (startup_id, tag_id)
      select ${startupId}::uuid, unnest(${addIds}::uuid[])
      on conflict do nothing
    `;
  }
  if (removeIds.length) {
    await sql`
      delete from startup_tags
      where startup_id = ${startupId}::uuid and tag_id = any(${removeIds}::uuid[])
    `;
  }
  refreshAdminData();
}


