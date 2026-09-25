/**
 * Read-failure reporting for the data layer.
 *
 * The data helpers degrade to an empty result rather than throwing, so a
 * transient backend blip cannot 500 a page. The one exception is Next.js's own
 * control-flow signals (`DYNAMIC_SERVER_USAGE`, `NEXT_NOT_FOUND`,
 * `NEXT_REDIRECT`): those are not failures, and swallowing them would stop Next
 * from correctly marking a route dynamic or rendering a 404. They must always
 * propagate.
 */

const CONTROL_FLOW_DIGESTS = [
  "DYNAMIC_SERVER_USAGE",
  "NEXT_NOT_FOUND",
  "NEXT_REDIRECT",
  "NEXT_HTTP_ERROR_FALLBACK",
];

function digestOf(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("digest" in error)) {
    return null;
  }
  const digest = (error as { digest?: unknown }).digest;
  return typeof digest === "string" ? digest : null;
}

export function isNextControlFlowError(error: unknown): boolean {
  const digest = digestOf(error);
  return Boolean(
    digest && CONTROL_FLOW_DIGESTS.some((prefix) => digest.startsWith(prefix))
  );
}

/** Log a genuine read failure; rethrow if it was Next control flow. */
export function reportReadFailure(scope: string, error: unknown): void {
  if (isNextControlFlowError(error)) throw error;

  console.error(`[data/${scope}] read failed:`, error);

  // In development a missing table or a bad column is the usual cause and the
  // message alone is easy to miss in the dev overlay.
  if (process.env.NODE_ENV === "development") {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(
      `[data/${scope}] continuing with an empty result. ` +
        `Has supabase/schema.sql been applied? (${message})`
    );
  }
}
