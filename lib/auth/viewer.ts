import { readSession } from "@/lib/auth/session";
import type { Startup } from "@/types/database";

/**
 * The current viewer, resolved from the signed session cookie that
 * /api/auth/session issues after a verified Firebase Google sign-in.
 *
 * There is deliberately no demo/anonymous fallback: a request without a valid
 * session is anonymous, and founder-only surfaces stay closed. That is what
 * makes the owner checks below real rather than decorative.
 */

export interface Viewer {
  /** `profiles.id`, or null for an anonymous visitor. */
  userId: string | null;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  authenticated: boolean;
}

const ANONYMOUS: Viewer = {
  userId: null,
  email: null,
  fullName: null,
  avatarUrl: null,
  authenticated: false,
};

export async function getViewer(): Promise<Viewer> {
  const session = await readSession();
  if (!session) return ANONYMOUS;

  return {
    userId: session.userId,
    email: session.email,
    fullName: session.name,
    avatarUrl: session.picture,
    authenticated: true,
  };
}

/** Owner gate for founder-only surfaces. */
export function isFounderViewer(viewer: Viewer, startup: Startup): boolean {
  return Boolean(viewer.userId) && viewer.userId === startup.founder_id;
}
