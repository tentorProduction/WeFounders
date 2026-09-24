"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "./config";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  signInDemoUser: () => void;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  authError: null,
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
  signInDemoUser: () => {},
  clearAuthError: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Catch redirect auth results if user signed in via redirect
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
        }
      })
      .catch((err) => {
        console.warn("Firebase redirect auth error:", err);
      });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Clear demo user if real auth is present
        if (typeof window !== "undefined") {
          localStorage.removeItem("wefounder_demo_user");
        }
      } else {
        // Check if demo user was saved
        const storedDemo = typeof window !== "undefined" ? localStorage.getItem("wefounder_demo_user") : null;
        if (storedDemo) {
          try {
            setUser(JSON.parse(storedDemo));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearAuthError = () => setAuthError(null);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result?.user) {
        setUser(result.user);
      }
    } catch (error: unknown) {
      console.error("Firebase signInWithPopup error:", error);
      const authErr = error as { code?: string; message?: string };
      
      if (
        authErr.code === "auth/popup-blocked" ||
        authErr.code === "auth/popup-closed-by-user" ||
        authErr.code === "auth/cancelled-popup-request"
      ) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectError) {
          console.error("Redirect auth error:", redirectError);
          setAuthError("Sign in popup was closed. Please try again.");
        }
      } else if (authErr.code === "auth/operation-not-allowed") {
        setAuthError("Google Sign-In is not enabled in your Firebase Console under Authentication settings.");
      } else if (authErr.code === "auth/unauthorized-domain") {
        setAuthError("This domain is not authorized in your Firebase Console. Please add localhost under Authorized Domains.");
      } else {
        setAuthError(authErr.message || "Failed to sign in with Google.");
      }
    }
  };

  const signInDemoUser = () => {
    const demoUser = {
      uid: "demo-founder-2026",
      displayName: "Aman Founder",
      email: "aman@wefounder.dev",
      photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    } as unknown as User;

    setUser(demoUser);
    setAuthError(null);
    if (typeof window !== "undefined") {
      localStorage.setItem("wefounder_demo_user", JSON.stringify(demoUser));
    }
  };

  const signOutUser = async () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("wefounder_demo_user");
      }
      await signOut(auth);
      setUser(null);
      setAuthError(null);
    } catch (error) {
      console.error("Error signing out:", error);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        signInWithGoogle,
        signOutUser,
        signInDemoUser,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
