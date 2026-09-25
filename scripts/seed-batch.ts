import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "❌ Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const founderSchema = z.object({
  fullName: z.string().min(1),
  username: z.string().min(1),
  email: z.string().email(),
});

const launchSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  tagline: z.string().min(1),
  problem: z.string().min(1),
  solution: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()),
  websiteUrl: z.string().url(),
  logoUrl: z.string().url(),
  screenshots: z.array(z.string().url()),
  founder: founderSchema,
  launchDate: z.string().datetime().optional(),
});

const batchSchema = z.array(launchSchema);

// Checks if a URL returns HTTP 200
async function verifyUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

function isPlaceholder(url: string): boolean {
  const placeholders = ["via.placeholder.com", "dummyimage.com", "placehold.co"];
  return placeholders.some((ph) => url.includes(ph));
}

// Generate an Asia/Kathmandu ISO date (offset +05:45)
function getKathmanduDate(): string {
  const now = new Date();
  // Adjust to +05:45 offset for the string literal, though UTC works fine in DB.
  // Actually, Supabase launch_date is timestamp with time zone, so regular ISO string is fine.
  return now.toISOString();
}

async function main() {
  const fileArg = process.argv.find((arg) => arg.startsWith("--file="));
  if (!fileArg) {
    console.error("❌ Provide a JSON file using --file=filename.json");
    process.exit(1);
  }

  const filePath = path.resolve(process.cwd(), fileArg.split("=")[1]);
  console.log(`Loading seed data from ${filePath} ...`);

  let fileContent: string;
  try {
    fileContent = await readFile(filePath, "utf8");
  } catch (error) {
    console.error(`❌ Could not read file: ${filePath}`);
    process.exit(1);
  }

  let jsonData: unknown;
  try {
    jsonData = JSON.parse(fileContent);
  } catch {
    console.error("❌ File is not valid JSON.");
    process.exit(1);
  }

  const parseResult = batchSchema.safeParse(jsonData);
  if (!parseResult.success) {
    console.error("❌ JSON does not match the strict schema:");
    console.error(parseResult.error.format());
    process.exit(1);
  }

  const entries = parseResult.data;
  let passed = 0;
  let failed = 0;

  for (const entry of entries) {
    console.log(`\nProcessing startup: ${entry.name}`);

    // Validate URL
    const isUrlValid = await verifyUrl(entry.websiteUrl);
    if (!isUrlValid) {
      console.error(`  ❌ websiteUrl ${entry.websiteUrl} did not return HTTP 200`);
      failed++;
      continue;
    }

    // Validate Placeholders
    const urlsToCheck = [entry.logoUrl, ...entry.screenshots];
    const hasPlaceholder = urlsToCheck.some(isPlaceholder);
    if (hasPlaceholder) {
      console.error(`  ❌ Rejected placeholder media found in URLs`);
      failed++;
      continue;
    }

    const launchDate = getKathmanduDate();

    // 1. Ensure founder exists
    const { data: existingFounder, error: findFounderErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", entry.founder.email)
      .maybeSingle();

    let founderId = existingFounder?.id;

    if (!founderId) {
      const newFounderId = crypto.randomUUID();
      const { error: insertFounderErr } = await supabase
        .from("profiles")
        .insert({
          id: newFounderId,
          firebase_uid: `seed-${crypto.randomUUID()}`,
          email: entry.founder.email,
          full_name: entry.founder.fullName,
          username: entry.founder.username,
          role: "founder",
          is_phone_verified: false,
          karma_score: 0
        });

      if (insertFounderErr) {
        console.error(`  ❌ Failed to create founder: ${insertFounderErr.message}`);
        failed++;
        continue;
      }
      founderId = newFounderId;
    }

    // 2. Insert Startup
    const startupId = crypto.randomUUID();
    const description = `**Problem:**\n${entry.problem}\n\n**Solution:**\n${entry.solution}`;

    const { error: insertStartupErr } = await supabase
      .from("startups")
      .insert({
        id: startupId,
        founder_id: founderId,
        slug: entry.slug,
        name: entry.name,
        tagline: entry.tagline,
        description,
        website_url: entry.websiteUrl,
        logo_url: entry.logoUrl,
        stage: "launched",
        target_market: "nepal_domestic",
        status: "approved",
        launch_date: launchDate,
        is_featured: false,
        upvotes_count: 0,
        comments_count: 0,
        waitlist_count: 0
      });

    if (insertStartupErr) {
      console.error(`  ❌ Failed to insert startup: ${insertStartupErr.message}`);
      failed++;
      continue;
    }

    // 3. Insert Screenshots
    if (entry.screenshots.length > 0) {
      const mediaRecords = entry.screenshots.map((url, i) => ({
        id: crypto.randomUUID(),
        startup_id: startupId,
        media_url: url,
        media_type: "image",
        display_order: i
      }));
      await supabase.from("startup_media").insert(mediaRecords);
    }

    // 4. Handle Tags & FOUNDING BATCH badge
    // Include founding-batch automatically
    const combinedTags = Array.from(new Set([...entry.tags, "founding-batch"]));
    
    for (const tagSlug of combinedTags) {
      // Upsert tag if it doesn't exist
      const { data: tagData } = await supabase
        .from("tags")
        .select("id")
        .eq("slug", tagSlug)
        .maybeSingle();

      let tagId = tagData?.id;

      if (!tagId) {
        const newTagId = crypto.randomUUID();
        await supabase.from("tags").insert({
          id: newTagId,
          slug: tagSlug,
          name: tagSlug === "founding-batch" ? "Founding Batch" : tagSlug,
          category: "industry"
        });
        tagId = newTagId;
      }

      await supabase.from("startup_tags").insert({
        startup_id: startupId,
        tag_id: tagId
      });
    }

    console.log(`  ✅ Successfully seeded startup (${startupId})`);
    passed++;
  }

  console.log(`\nSeed Complete. ✅ Passed: ${passed} | ❌ Failed: ${failed}`);
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
