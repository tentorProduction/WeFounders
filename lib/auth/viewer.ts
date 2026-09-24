import type { Startup } from "@/types/database";

export interface Viewer {
  userId: string | null;
  /** When true, founder checks are authoritative (real session required). */
  backendConfigured: boolean;
}

/** Resolve the current viewer from Firebase Auth or demo state. */
export async function getViewer(): Promise<Viewer> {
  const isFirebaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );

  return {
    userId: null,
    backendConfigured: isFirebaseConfigured,
  };
}

/**
 * Owner gate for founder-only surfaces.
 */
export function isFounderViewer(
  viewer: Viewer,
  startup: Startup,
  demoAsFounder: boolean
): boolean {
  if (viewer.backendConfigured && viewer.userId) {
    return viewer.userId === startup.founder_id;
  }

  return demoAsFounder;
}
