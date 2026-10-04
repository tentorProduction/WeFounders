import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ quiet: true });
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
const client = neon(process.env.DATABASE_URL);
const source = await readFile("db/platform.sql", "utf8");
// Keep function bodies, SQL strings and comments intact while splitting statements.
const tokens = source.match(/\$\$[\s\S]*?\$\$|'(?:''|[^'])*'|--[^\n]*|[^;'$-]+|\$(?!\$)|-(?!-)|;/g) ?? [];
const statements: string[] = [];
let statement = "";
for (const token of tokens) {
  if (token === ";") { if (statement.trim()) statements.push(statement); statement = ""; }
  else statement += token;
}
if (statement.trim()) statements.push(statement);
await client.transaction(statements.map((text) => client.query(text)));
console.log("Platform schema applied.");
