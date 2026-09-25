"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getViewer } from "@/lib/auth/viewer";
import { createAdminClient } from "@/lib/supabase/admin";
// Types/initial value live outside this "use server" module — see the file.
import type { StartupSubmissionActionState } from "@/lib/action-state";

/**
 * Startup submission (PRD Flow 2).
 *
 * Writes a real `startups` row owned by the signed-in founder with status
 * `pending_approval` — it does not appear in the public feed until a moderator
 * approves it, which is why the RLS read policy only exposes `approved` rows.
 *
 * The write uses the service role because identity comes from our verified
 * session rather than a Supabase auth session; `founder_id` is never taken from
 * the form.
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
async function uniqueSlug(
  base: string,
  supabase: ReturnType<typeof createAdminClient>
): Promise<string> {
  const root = base || `startup-${Date.now().toString(36)}`;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const candidate = attempt === 0 ? root : `${root}-${attempt + 1}`;
    const { data, error } = await supabase
      .from("startups")
      .select("id")
      .eq("slug", candidate)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return candidate;
  }

  return `${root}-${Date.now().toString(36)}`;
}

/**
 * Resolve each submitted label to a tag id, creating the tag when it is not in
 * the taxonomy yet, so a founder's choices are never silently dropped.
 */
async function resolveTagIds(
  labels: string[],
  supabase: ReturnType<typeof createAdminClient>
): Promise<string[]> {
  const wanted = new Map<string, string>();
  for (const label of labels) {
    const slug = slugify(label);
    if (slug) wanted.set(slug, label);
  }
  if (wanted.size === 0) return [];

  const slugs = [...wanted.keys()];
  const { data: existing, error } = await supabase
    .from("tags")
    .select("id, slug")
    .in("slug", slugs);
  if (error) throw error;

  const ids = new Map((existing ?? []).map((tag) => [tag.slug, tag.id]));

  const missing = slugs.filter((slug) => !ids.has(slug));
  if (missing.length > 0) {
    const { data: created, error: createError } = await supabase
      .from("tags")
      .upsert(
        missing.map((slug) => ({
          slug,
          name: wanted.get(slug) ?? slug,
          category: "stack",
        })),
        { onConflict: "slug" }
      )
      .select("id, slug");
    if (createError) throw createError;

    for (const tag of created ?? []) ids.set(tag.slug, tag.id);
  }

  return [...ids.values()];
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

  const supabase = createAdminClient();
  const slug = await uniqueSlug(slugify(parsed.data.name), supabase);

  try {
    const { data: startup, error } = await supabase
      .from("startups")
      .insert({
        founder_id: viewer.userId,
        slug,
        name: parsed.data.name,
        tagline: parsed.data.tagline,
        description: parsed.data.description,
        website_url: parsed.data.websiteUrl,
        demo_video_url: parsed.data.demoVideoUrl || null,
        stage: parsed.data.stage,
        target_market: parsed.data.market,
        status: "pending_approval",
      })
      .select("id")
      .single();

    if (error) throw error;

    // The industry the founder picked is stored as a tag alongside the stack.
    const labels = [parsed.data.category, ...parsed.data.tags].filter(Boolean);
    const tagIds = await resolveTagIds(labels, supabase);

    if (tagIds.length > 0) {
      const { error: tagError } = await supabase.from("startup_tags").insert(
        tagIds.map((tagId) => ({ startup_id: startup.id, tag_id: tagId }))
      );
      // A tag failure must not lose the submission itself.
      if (tagError) console.error("[startups] could not attach tags:", tagError);
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
