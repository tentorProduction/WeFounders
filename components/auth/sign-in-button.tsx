"use client";

import Link from "next/link";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * "Continue with Google" — the single entry point for signing in.
 *
 * Clerk owns the whole flow: this button only links to the hosted sign-in page
 * (`app/sign-in/[[...sign-in]]`), which Clerk renders and which redirects back
 * to a signed session. Keeping the link plain means the button keeps the app's
 * own styling instead of importing Clerk's modal chrome.
 *
 * The `showError` prop is gone: Clerk reports sign-in failures on its own
 * sign-in page, so there is nothing left to render inline here.
 */

export interface SignInButtonProps extends Omit<ButtonProps, "onClick"> {
  label?: string;
}

export function SignInButton({
  label = "Continue with Google",
  className,
  ...props
}: SignInButtonProps) {
  return (
    <Button asChild className={cn("gap-2", className)} {...props}>
      <Link href={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in"}>
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden>
          <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.545,6.477,2.545,12s4.476,10,10,10c5.768,0,9.756-4.056,9.756-9.924c0-0.697-0.075-1.372-0.198-2.037L12.545,10.239z" />
        </svg>
        {label}
      </Link>
    </Button>
  );
}