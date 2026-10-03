"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getViewer } from "@/lib/auth/viewer";
import { sql } from "@/lib/db/neon";
import { clientAddress, isRateLimited } from "@/lib/security/rate-limit";
import { headers } from "next/headers";
// Types/initial value live outside this "use server" module — see the file.
import type { StartupSubmissionActionState } from "@/lib/action-state";

/**
 * Startup submission (PRD Flow 2).
 *
 * Writes a real `startups` row owned by the signed-in founder with status
 * `pending_approval` — it does not appear in the public feed until a moderator
 * approves it, which is why the feed query filters on `status = 'approved'`.
 *
 * Identity comes from the verified session rather than from the form, so
 * `founder_id` is never taken from client input.
 */

const submissionSchema = z.object({
  name: z.string().trim().min(1).max(60),
  tagline: z.string().trim().min(4).max(80),
  description: z.string().trim().max(8000).optional().default(""),
  category: z.string().trim().max(40).optional().default(""),
  stage: z.enum(["concept", "closed_alpha", "public_beta", "launched"]),
  market: z.enum(["nepal_domestic", "global_export", "hybrid"]),
  websiteUrl: z.union([z.literal(""), z.url().max(300)]),
  demoVideoUrl: z.union([z.literal(""), z.url().max(300)]),
  tags: z.array(z.string().trim().min(1).max(40)).max(12),
});

/** URL-safe slug candidate derived from a display label. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Ensure the slug is free, appending a short suffix when it is taken. */
async function uniqueSlug(base: string): Promise<string> {
  const root = base || `startup-${Date.now().toString(36)}`;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const candidate = attempt === 0 ? root : `${root}-${attempt + 1}`;
    const rows = await sql`select id from startups where slug = ${candidate} limit 1`;

    if (rows.length === 0) return candidate;
  }

  return `${root}-${Date.now().toString(36)}`;
}

/**
 * Resolve each submitted label to a tag id, creating the tag when it is not in
 * the taxonomy yet, so a founder's choices are never silently dropped.
 */
async function resolveTagIds(labels: string[]): Promise<string[]> {
  const wanted = new Map<string, string>();
  for (const label of labels) {
    const slug = slugify(label);
    if (slug) wanted.set(slug, label);
  }
  if (wanted.size === 0) return [];

  const slugs = [...wanted.keys()];
  const incoming = slugs.map((slug) => ({ slug, name: wanted.get(slug) ?? slug }));

  // `on conflict do nothing` leaves an existing tag untouched; the select below
  // then returns every id, whether the row was just created or already there.
  await sql`
    insert into tags (slug, name, category)
    select incoming.slug, incoming.name, 'stack'
    from jsonb_to_recordset(${JSON.stringify(incoming)}::jsonb)
      as incoming(slug text, name text)
    on conflict (slug) do nothing
  `;

  const rows = (await sql`
    select id from tags where slug = any(${slugs}::text[])
  `) as { id: string }[];

  return rows.map((row) => row.id);
}

export async function submitStartupAction(
  _prevState: StartupSubmissionActionState,
  formData: FormData
): Promise<StartupSubmissionActionState> {
  const viewer = await getViewer();
  if (!viewer.userId) {
    return {
      status: "error",
      message: "Sign in with Google before submitting — we need to attach the launch to your account.",
    };
  }

  if (await isRateLimited("startup-submit", `${viewer.userId}:${clientAddress(await headers())}`, 3, 60 * 60_000)) {
    return { status: "error", message: "You have reached the hourly submission limit. Try again later." };
  }

  let rawTags: unknown = [];
  try {
    rawTags = JSON.parse(String(formData.get("tags") ?? "[]"));
  } catch {
    rawTags = [];
  }

  const parsed = submissionSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    tagline: String(formData.get("tagline") ?? ""),
    description: String(formData.get("description") ?? ""),
    category: String(formData.get("category") ?? ""),
    stage: String(formData.get("stage") ?? ""),
    market: String(formData.get("market") ?? ""),
    websiteUrl: String(formData.get("websiteUrl") ?? "").trim(),
    demoVideoUrl: String(formData.get("demoVideoUrl") ?? "").trim(),
    tags: Array.isArray(rawTags) ? rawTags.filter((t): t is string => typeof t === "string") : [],
  });

  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return {
      status: "error",
      message:
        field === "tagline"
          ? "A tagline is required (4–80 characters)."
          : field === "name"
            ? "Your startup needs a name."
            : field === "websiteUrl" || field === "demoVideoUrl"
              ? "URLs must be complete links, e.g. https://yourproduct.com"
              : "Check the form — something didn't validate.",
    };
  }

  const slug = await uniqueSlug(slugify(parsed.data.name));

  try {
    const inserted = (await sql`
      insert into startups (
        founder_id, slug, name, tagline, description,
        website_url, demo_video_url, stage, target_market, status
      )
      values (
        ${viewer.userId}::uuid,
        ${slug},
        ${parsed.data.name},
        ${parsed.data.tagline},
        ${parsed.data.description},
        ${parsed.data.websiteUrl},
        ${parsed.data.demoVideoUrl || null},
        ${parsed.data.stage}::startup_stage,
        ${parsed.data.market}::target_market,
        'pending_approval'
      )
      returning id
    `) as { id: string }[];

    const startupId = inserted[0]?.id;
    if (!startupId) throw new Error("Startup insert returned no id.");

    // The industry the founder picked is stored as a tag alongside the stack.
    const labels = [parsed.data.category, ...parsed.data.tags].filter(Boolean);
    const tagIds = await resolveTagIds(labels);

    if (tagIds.length > 0) {
      try {
        await sql`
          insert into startup_tags (startup_id, tag_id)
          select ${startupId}::uuid, unnest(${tagIds}::uuid[])
          on conflict do nothing
        `;
      } catch (tagError) {
        // A tag failure must not lose the submission itself.
        console.error("[startups] could not attach tags:", tagError);
      }
    }

    revalidatePath("/profile");
    revalidatePath("/");

    return {
      status: "success",
      message: "Submitted for review.",
      slug,
      startupName: parsed.data.name,
    };
  } catch (error) {
    console.error("[startups] submission failed:", error);
    return {
      status: "error",
      message: "We couldn't save your submission. Please try again in a moment.",
    };
  }
}
