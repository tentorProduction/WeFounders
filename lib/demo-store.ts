import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Tiny JSON collection store used until the Supabase schema is provisioned
 * (see the TODO in lib/fixtures/startups.ts).
 *
 * Data lives in `.data/*.json` (gitignored). On read-only filesystems — e.g.
 * serverless deployments — writes fail silently and the collection is kept in
 * memory for the life of the process, so the UI never breaks.
 */

const DATA_DIR = path.join(process.cwd(), ".data");
const memory = new Map<string, unknown[]>();

function filePath(collection: string): string {
  return path.join(DATA_DIR, `${collection}.json`);
}

export async function readCollection<T>(collection: string): Promise<T[]> {
  try {
    const raw = await readFile(filePath(collection), "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      memory.set(collection, parsed);
      return parsed as T[];
    }
  } catch {
    // Missing file or unreadable filesystem — fall back to the in-process copy.
  }

  return (memory.get(collection) ?? []) as T[];
}

export async function appendToCollection<T>(
  collection: string,
  row: T
): Promise<void> {
  const rows = [...(await readCollection<T>(collection)), row];
  await replaceCollection(collection, rows);
}

/** Overwrite the whole collection (used for status updates on existing rows). */
export async function replaceCollection<T>(
  collection: string,
  rows: T[]
): Promise<void> {
  memory.set(collection, rows);

  try {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(filePath(collection), JSON.stringify(rows, null, 2), "utf8");
  } catch {
    // Read-only filesystem — the in-memory copy still serves this session.
  }
}
