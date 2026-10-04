/** Database failures reach the application error boundary; Next control flow propagates unchanged. */

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

/** Log failures without presenting an outage as an empty result. */
export function reportReadFailure(scope: string, error: unknown): void {
  if (isNextControlFlowError(error)) throw error;

  console.error(`[data/${scope}] read failed:`, error);

  throw new Error("Platform data is temporarily unavailable. Please retry.", { cause: error });
}
