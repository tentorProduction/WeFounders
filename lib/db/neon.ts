import { neon } from "@neondatabase/serverless";
import "server-only";

/**
 * Neon serverless Postgres — the application's only data store.
 *
 * `neon()` talks to Postgres over HTTP rather than holding a TCP socket, which
 * is what makes it a good fit for a serverless runtime: no pool to exhaust and
 * nothing to close. This module wraps it in a tiny tagged template so call
 * sites read as ``sql`select ... where id = ${id}` `` and values can never be
 * concatenated into SQL text.
 *
 * Connection pooling: use the Neon Console's **pooled** connection string (the
 * `-pooler` host) for this app. Direct connections are for migrations only.
 */

type DbRow = Record<string, unknown>;

const RAW = Symbol("neon.raw");

interface RawFragment {
  [RAW]: string;
}

/**
 * Mark a string as trusted SQL so it is inlined instead of being sent as a
 * bound value. Use it ONLY for SQL this codebase writes itself, to compose a
 * query from a shared SELECT fragment.
 *
 * Never wrap user input in `raw()` — every other interpolation is escaped and
 * parameterised, and this is the one that is not.
 */
export function raw(fragment: string): RawFragment {
  return { [RAW]: fragment };
}

/**
 * Split a tagged template into SQL text with `$1`-style placeholders plus the
 * values to bind. Raw fragments are concatenated verbatim; everything else
 * becomes a parameter.
 */
function build(strings: TemplateStringsArray, params: unknown[]) {
  let text = strings[0] ?? "";
  const values: unknown[] = [];

  params.forEach((param, index) => {
    if (param && typeof param === "object" && RAW in param) {
      text += (param as RawFragment)[RAW];
    } else {
      values.push(param);
      text += `$${values.length}`;
    }
    text += strings[index + 1] ?? "";
  });

  return { text, values };
}

let cached: ReturnType<typeof neon> | undefined;

function client() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add your Neon pooled connection string to .env.local.",
    );
  }
  // Built on first use, not at import time, so a page that never queries the
  // database still renders when the variable is absent.
  cached ??= neon(url);
  return cached;
}

/** Run a query and return its rows. */
export async function sql(
  strings: TemplateStringsArray,
  ...params: unknown[]
): Promise<DbRow[]> {
  const { text, values } = build(strings, params);
  const rows = await client().query(text, values);
  return rows as DbRow[];
}

/** True when a connection string is present — lets pages degrade gracefully. */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

/** The actor is scoped to the same transaction as the audited mutation. */
export function auditedSql(actorId: string) {
  return async (strings: TemplateStringsArray, ...params: unknown[]): Promise<DbRow[]> => {
    const { text, values } = build(strings, params);
    const results = await client().transaction([
      client().query("select set_config('wf.actor', $1, true)", [actorId]),
      client().query(text, values),
    ]);
    return results[1] as DbRow[];
  };
}
