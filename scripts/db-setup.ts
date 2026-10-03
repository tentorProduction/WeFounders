/**
 * Verify the Neon database is reachable and that db/schema.sql has been
 * applied.
 *
 *   npm run db:setup
 *
 * The schema itself is NOT applied from here: Neon has no unauthenticated SQL
 * endpoint, and pasting the file into the Console's SQL Editor is the
 * supported path (Console → your project → SQL Editor → paste db/schema.sql).
 * This script exists to answer "is it wired up yet?" with a yes/no and a list
 * of whatever is still missing, instead of an empty feed and a stack trace.
 */

import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const EXPECTED_TABLES = [
  "profiles",
  "startups",
  "tags",
  "startup_tags",
  "startup_media",
  "upvotes",
  "comments",
  "waitlist_entries",
  "testing_quests",
  "quest_submissions",
  "collab_posts",
  "promotions",
];

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error(
      "✗ DATABASE_URL is not set.\n" +
        "  Add the pooled Neon connection string to .env.local " +
        "(Console → Connection Details → Pooled connection)."
    );
    process.exit(1);
  }

  const sql = neon(url);

  let reachable: { version: string };
  try {
    const [row] = await sql`select version() as version`;
    reachable = row as { version: string };
  } catch (error) {
    console.error(
      "✗ Could not reach the database:",
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
  console.log(`✓ Connected — ${reachable.version.split(" on ")[0]}`);

  const tables = (await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
    order by table_name
  `) as { table_name: string }[];

  const present = new Set(tables.map((row) => row.table_name));
  const missing = EXPECTED_TABLES.filter((name) => !present.has(name));

  const enumTypes = (await sql`
    select t.typname
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typtype = 'e'
    order by t.typname
  `) as { typname: string }[];

  const triggers = (await sql`
    select trigger_name
    from information_schema.triggers
    where event_object_schema = 'public'
  `) as { trigger_name: string }[];

  const tags = missing.length === 0
    ? ((await sql`select count(*)::int as total from public.tags`) as { total: number }[])
    : [];

  console.log(`✓ ${tables.length} tables`);
  console.log(`✓ ${enumTypes.length} enums: ${enumTypes.map((row) => row.typname).join(", ")}`);
  console.log(`✓ ${triggers.length} triggers`);

  if (missing.length > 0) {
    console.error(
      `\n✗ Missing tables: ${missing.join(", ")}\n` +
        "  Apply db/schema.sql in the Neon SQL Editor, then re-run this script."
    );
    process.exit(1);
  }

  console.log(`✓ ${tags[0]?.total ?? 0} taxonomy tags`);
  console.log("\n✓ Database ready.");
}

main().catch((error) => {
  console.error("✗ db:setup failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});