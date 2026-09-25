"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  type User,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";

import { getFirebaseAuth, getGoogleProvider, isFirebaseConfigured } from "./config";

/**
 * Google sign-in via Firebase, plus the server session that makes the identity
 * trustworthy on the backend.
 *
 * Flow: Firebase popup → Firebase ID token → POST /api/auth/session, where the
 * server verifies the token against Google's JWKS, upserts the profile and sets
 * a signed HttpOnly cookie. Server components and actions then read that cookie
 * (see lib/auth/viewer.ts) instead of Supabase Auth.
 *
 * There is no demo/bypass account: if Google sign-in fails, the error is shown.
 */

interface SessionUser {
  userId: string;
  email: string;
  name: string | null;
}

interface AuthContextType {
  /** The Firebase user, for display purposes (name, avatar, uid). */
  user: User | null;
  /** The server-verified session, once the token exchange succeeds. */
  session: SessionUser | null;
  /** True while the initial auth state is still resolving. */
  loading: boolean;
  /** True while the ID token is being exchanged for a server session. */
  syncing: boolean;
  /** False when the Firebase environment variables are missing. */
  configured: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  syncing: false,
  configured: false,
  authError: null,
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
  clearAuthError: () => {},
});

async function exchangeTokenForSession(idToken: string): Promise<SessionUser> {
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ idToken }),
    credentials: "same-origin",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Could not establish a server session.");
  }

  return (await response.json()) as SessionUser;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const configured = isFirebaseConfigured();

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    // Complete a redirect-based sign-in if the popup was blocked.
    getRedirectResult(auth).catch((error: unknown) => {
      console.warn("Firebase redirect sign-in failed:", error);
    });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (!currentUser) {
        setSession(null);
        void fetch("/api/auth/session", {
          method: "DELETE",
          credentials: "same-origin",
        }).catch(() => {
          // The cookie is HttpOnly; a failed clear is harmless and retried on
          // the next sign-out.
        });
        return;
      }

      setSyncing(true);
      currentUser
        .getIdToken()
        .then((idToken) => exchangeTokenForSession(idToken))
        .then((next) => {
          setSession(next);
          setAuthError(null);
        })
        .catch((error: Error) => {
          setSession(null);
          setAuthError(error.message);
        })
        .finally(() => setSyncing(false));
    });

    return () => unsubscribe();
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    const auth = getFirebaseAuth();
    const provider = getGoogleProvider();

    if (!auth) {
      setAuthError(
        "Google sign-in is unavailable: the Firebase environment variables are missing."
      );
      return;
    }

    try {
      await signInWithPopup(auth, provider);
    } catch (error: unknown) {
      const authErr = error as { code?: string; message?: string };

      // A blocked popup is common in embedded browsers — retry as a redirect.
      if (
        authErr.code === "auth/popup-blocked" ||
        authErr.code === "auth/operation-not-supported-in-this-environment"
      ) {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectError) {
          console.error("Redirect sign-in failed:", redirectError);
        }
      }

      if (authErr.code === "auth/popup-closed-by-user") {
        setAuthError("Sign-in window closed before finishing.");
      } else if (authErr.code === "auth/cancelled-popup-request") {
        // A second popup superseded this one — not worth surfacing.
      } else if (authErr.code === "auth/operation-not-allowed") {
        setAuthError(
          "Google sign-in is disabled for this Firebase project. Enable it under Authentication → Sign-in method."
        );
      } else if (authErr.code === "auth/unauthorized-domain") {
        setAuthError(
          "This domain is not authorised in the Firebase console. Add it under Authentication → Settings → Authorized domains."
        );
      } else {
        setAuthError(authErr.message ?? "Could not sign in with Google.");
      }
    }
  }, []);

  const signOutUser = useCallback(async () => {
    try {
      await fetch("/api/auth/session", {
        method: "DELETE",
        credentials: "same-origin",
      });
      const auth = getFirebaseAuth();
      if (auth) await signOut(auth);
    } catch (error) {
      console.error("Sign-out failed:", error);
    } finally {
      setSession(null);
      setUser(null);
      setAuthError(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        syncing,
        configured,
        authError,
        signInWithGoogle,
        signOutUser,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
