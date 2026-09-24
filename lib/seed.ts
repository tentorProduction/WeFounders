/**
 * Seed script (PROMPT 2) — loads the fixture dataset into Supabase.
 *
 *   npx tsx lib/seed.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 * (service role is needed to create shadow auth users). Data mirrors
 * lib/fixtures/* so the app renders identically whether it reads fixtures or
 * the database.
 */

import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Next.js loads .env.local automatically; plain tsx does not.
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { STARTUP_FIXTURES, getAllTags } from "@/lib/fixtures/startups";
import { QUEST_FIXTURES } from "@/lib/fixtures/quests";
import { COLLAB_FIXTURES } from "@/lib/fixtures/collab";
import { MEDIA_FIXTURES } from "@/lib/fixtures/media";

/* -------------------------------------------------------------------------- */
/* Supabase client                                                             */
/* -------------------------------------------------------------------------- */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "✗ Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/* -------------------------------------------------------------------------- */
/* Deterministic ids                                                           */
/* -------------------------------------------------------------------------- */

/** Deterministic UUIDs so re-running the seed upserts instead of duplicating. */
function stableId(seed: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x1b873593;
  for (let i = 0; i < seed.length; i += 1) {
    h1 = Math.imul(h1 ^ seed.charCodeAt(i), 0x01000193) >>> 0;
    h2 = Math.imul(h2 + seed.charCodeAt(i), 0x85ebca6b) >>> 0;
  }
  const a = h1.toString(16).padStart(8, "0");
  const b = h2.toString(16).padStart(8, "0");
  return [
    a,
    a.slice(0, 4),
    `4${a.slice(4, 7)}`,
    `8${b.slice(0, 3)}`,
    `${b}${a.slice(0, 4)}`.slice(0, 12),
  ].join("-");
}

const uuidOf = {
  tag: (slug: string) => stableId(`tag:${slug}`),
  startup: (slug: string) => stableId(`startup:${slug}`),
  quest: (id: string) => stableId(`quest:${id}`),
  collab: (id: string) => stableId(`collab:${id}`),
};

/* -------------------------------------------------------------------------- */
/* Seed steps                                                                  */
/* -------------------------------------------------------------------------- */

async function seedTags(): Promise<Map<string, string>> {
  const tagMap = new Map<string, string>();
  for (const tag of getAllTags()) {
    const id = uuidOf.tag(tag.slug);
    const { error } = await supabase.from("tags").upsert(
      { id, slug: tag.slug, name: tag.name, category: tag.category ?? null },
      { onConflict: "slug" }
    );
    if (error) throw new Error(`tags: ${error.message}`);
    tagMap.set(tag.slug, id);
  }
  console.log(`  ✓ ${tagMap.size} tags`);
  return tagMap;
}

/**
 * Founder identities. profiles.id references auth.users.id, so we create a
 * shadow auth user per startup and capture its id — the on_auth_user_created
 * trigger then builds the profile row, which we update with fixture identity.
 */
async function seedFounders(): Promise<Map<string, string>> {
  const founderIds = new Map<string, string>();
  const slugs = [...new Set(STARTUP_FIXTURES.map((s) => s.slug))];

  for (const slug of slugs) {
    const email = `${slug.replace(/-/g, ".")}@founders.wefounder.dev`;
    const startup = STARTUP_FIXTURES.find((s) => s.slug === slug);

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name: `${startup?.name ?? slug} Founding Team`,
        username: slug.replace(/-/g, "_"),
      },
    });

    let authUserId = data?.user?.id ?? null;
    if (!authUserId) {
      // Already seeded on a previous run — look the user up by email instead
      // of failing (createUser cannot upsert).
      const page = await supabase.auth.admin.listUsers({ perPage: 500 });
      authUserId =
        page.data?.users?.find((user) => user.email === email)?.id ?? null;
    }
    if (!authUserId) {
      throw new Error(`auth user ${slug}: ${error?.message ?? "not found"}`);
    }
    founderIds.set(slug, authUserId);

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: authUserId,
        email,
        full_name: `${startup?.name ?? slug} Founding Team`,
        username: slug.replace(/-/g, "_"),
        bio: startup?.tagline ?? null,
        role: "founder",
      },
      { onConflict: "id" }
    );
    if (profileError) throw new Error(`profiles: ${profileError.message}`);
  }
  console.log(`  ✓ ${founderIds.size} founder profiles (+ shadow auth users)`);
  return founderIds;
}

async function seedStartups(
  tagMap: Map<string, string>,
  founderIds: Map<string, string>
): Promise<void> {
  for (const startup of STARTUP_FIXTURES) {
    const row = {
      id: uuidOf.startup(startup.slug),
      founder_id: founderIds.get(startup.slug)!,
      slug: startup.slug,
      name: startup.name,
      tagline: startup.tagline,
      description: startup.description,
      website_url: startup.website_url,
      demo_video_url: startup.demo_video_url,
      logo_url: startup.logo_url,
      banner_url: startup.banner_url,
      stage: startup.stage,
      target_market: startup.target_market,
      status: "approved",
      launch_date: startup.launch_date,
      upvotes_count: startup.upvotes_count,
      comments_count: startup.comments_count,
      waitlist_count: startup.waitlist_count,
      is_featured: startup.is_featured,
      featured_until: startup.featured_until,
    };
    const { error } = await supabase
      .from("startups")
      .upsert(row, { onConflict: "id" });
    if (error) throw new Error(`startups: ${error.message}`);

    if (startup.tags.length > 0) {
      const { error: tagError } = await supabase.from("startup_tags").upsert(
        startup.tags.map((tag) => ({
          startup_id: row.id,
          tag_id: tagMap.get(tag.slug)!,
        })),
        { onConflict: "startup_id,tag_id" }
      );
      if (tagError) throw new Error(`startup_tags: ${tagError.message}`);
    }
  }
  console.log(`  ✓ ${STARTUP_FIXTURES.length} startups (+ tags)`);
}

async function seedMedia(): Promise<void> {
  const rows = Object.entries(MEDIA_FIXTURES).flatMap(([slug, items]) =>
    (items ?? []).map((item, index) => ({
      startup_id: uuidOf.startup(slug),
      kind: "screenshot" as const,
      url: `fixture:${slug}:${index + 1}`,
      caption: item.caption,
      position: index,
    }))
  );
  if (rows.length === 0) return;

  // Media has no natural unique key — replace this seed's rows per startup.
  const startupIds = [...new Set(rows.map((row) => row.startup_id))];
  await supabase.from("startup_media").delete().in("startup_id", startupIds);
  const { error } = await supabase.from("startup_media").insert(rows);
  if (error) throw new Error(`startup_media: ${error.message}`);
  console.log(`  ✓ ${rows.length} media placeholders`);
}

async function seedQuests(): Promise<void> {
  for (const quest of QUEST_FIXTURES) {
    const row = {
      id: uuidOf.quest(quest.id),
      startup_id: uuidOf.startup(quest.startup),
      title: quest.title,
      task_instructions: quest.task_instructions,
      target_devices: quest.target_devices,
      reward_description: quest.reward_description,
      max_submissions: quest.max_submissions,
      submissions_count: quest.submissions_count,
      status: quest.status ?? "active",
    };
    const { error } = await supabase.from("testing_quests").upsert(row, {
      onConflict: "id",
    });
    if (error) throw new Error(`testing_quests: ${error.message}`);
  }
  console.log(`  ✓ ${QUEST_FIXTURES.length} testing quests`);
}

async function seedCollab(
  founderIds: Map<string, string>
): Promise<void> {
  const rows = COLLAB_FIXTURES.map((post) => ({
    id: uuidOf.collab(post.id),
    author_id: post.startup
      ? founderIds.get(post.startup.slug) ?? null
      : null,
    author_name: post.author_name,
    startup_id: post.startup ? uuidOf.startup(post.startup.slug) : null,
    type: post.role_type,
    title: post.title,
    description: post.description,
    equity_or_compensation: post.equity_or_compensation,
    contact_channel: post.contact_channel,
    is_active: post.is_active ?? true,
  }));
  const { error } = await supabase.from("collab_posts").upsert(rows, {
    onConflict: "id",
  });
  if (error) throw new Error(`collab_posts: ${error.message}`);
  console.log(`  ✓ ${COLLAB_FIXTURES.length} collab posts`);
}

async function main(): Promise<void> {
  console.log("Seeding Wefounder.dev data into Supabase…\n");
  const tagMap = await seedTags();
  const founderIds = await seedFounders();
  await seedStartups(tagMap, founderIds);
  await seedMedia();
  await seedQuests();
  await seedCollab(founderIds);
  console.log("\n✓ Seed complete.");
}

main().catch((error) => {
  console.error("✗ Seed failed:", error);
  process.exit(1);
});
