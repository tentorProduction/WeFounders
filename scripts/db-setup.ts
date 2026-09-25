/**
 * Apply supabase/schema.sql to the linked Supabase project and verify it.
 *
 *   SUPABASE_ACCESS_TOKEN=sbp_... npm run db:setup
 *
 * Uses the Management API, so no database password or CLI login is needed.
 * The schema is idempotent for the parts that matter (buckets and the taxonomy
 * use ON CONFLICT DO NOTHING); a full re-apply against an existing database
 * will fail on the CREATE TYPE / CREATE TABLE statements, which is intentional
 * — this provisions a fresh project.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF ?? "qxgrnbigvxwfrvllbagh";
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const API = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

if (!ACCESS_TOKEN) {
  console.error(
    "✗ Set SUPABASE_ACCESS_TOKEN (a personal access token starting with sbp_).\n" +
      "  Create one at https://supabase.com/dashboard/account/tokens"
  );
  process.exit(1);
}

async function runQuery(query: string): Promise<unknown> {
  const response = await fetch(API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${text.slice(0, 800)}`);
  }
  return text ? JSON.parse(text) : null;
}

async function main(): Promise<void> {
  const schemaPath = path.join(process.cwd(), "supabase", "schema.sql");
  const sql = await readFile(schemaPath, "utf8");

  console.log(`Applying ${path.relative(process.cwd(), schemaPath)} …`);
  await runQuery(sql);
  console.log("  ✓ schema applied");

  const tables = (await runQuery(
    `select count(*)::int as n from information_schema.tables where table_schema = 'public'`
  )) as Array<{ n: number }>;
  const policies = (await runQuery(
    `select count(*)::int as n from pg_policies where schemaname in ('public','storage')`
  )) as Array<{ n: number }>;
  const buckets = (await runQuery(
    `select id from storage.buckets order by 1`
  )) as Array<{ id: string }>;
  const tags = (await runQuery(
    `select count(*)::int as n from public.tags`
  )) as Array<{ n: number }>;

  console.log(`  ✓ ${tables[0]?.n ?? 0} tables`);
  console.log(`  ✓ ${policies[0]?.n ?? 0} RLS policies`);
  console.log(`  ✓ ${tags[0]?.n ?? 0} taxonomy tags`);
  console.log(`  ✓ buckets: ${buckets.map((b) => b.id).join(", ") || "none"}`);
  console.log("\n✓ Database ready.");
}

main().catch((error) => {
  console.error("✗ db:setup failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
