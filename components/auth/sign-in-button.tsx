"use client";

import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import { useAuth } from "@/lib/firebase/auth-context";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * "Continue with Google" — the single entry point for signing in.
 *
 * Firebase handles the OAuth popup; the auth context then exchanges the ID
 * token for a server session. Any failure (popup blocked, domain not
 * authorised, provider disabled) is surfaced inline rather than swallowed.
 */

export interface SignInButtonProps extends Omit<ButtonProps, "onClick"> {
  label?: string;
  /** Render the error banner beneath the button. */
  showError?: boolean;
}

export function SignInButton({
  label = "Continue with Google",
  showError = true,
  className,
  ...props
}: SignInButtonProps) {
  const { signInWithGoogle, authError, clearAuthError, configured } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleClick = async () => {
    clearAuthError();
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <Button
        onClick={handleClick}
        disabled={isSigningIn || !configured}
        className={cn("gap-2", className)}
        {...props}
      >
        {isSigningIn ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden>
            <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.545,6.477,2.545,12s4.476,10,10,10c5.768,0,9.756-4.056,9.756-9.924c0-0.697-0.075-1.372-0.198-2.037L12.545,10.239z" />
          </svg>
        )}
        {isSigningIn ? "Signing in…" : label}
      </Button>

      {!configured && showError && (
        <p className="max-w-sm text-caption text-muted-foreground">
          Google sign-in is not configured for this deployment yet.
        </p>
      )}

      {authError && showError && (
        <p
          role="alert"
          className="flex max-w-sm items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-left text-caption text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{authError}</span>
        </p>
      )}
    </div>
  );
}
