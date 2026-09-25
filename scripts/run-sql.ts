import { readFile } from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF ?? "qxgrnbigvxwfrvllbagh";
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const API = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

async function main() {
  if (!ACCESS_TOKEN) {
    console.warn("No SUPABASE_ACCESS_TOKEN, skipping remote SQL execution.");
    return;
  }
  const sql = await readFile(path.join(process.cwd(), "scripts", "admin-setup.sql"), "utf8");
  const response = await fetch(API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });
  if (!response.ok) {
    const text = await response.text();
    console.error("SQL Error:", text);
    process.exit(1);
  }
  console.log("SQL executed successfully.");
}

main().catch(console.error);
