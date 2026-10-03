import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

import { BrandLogo } from "@/components/brand/brand-logo";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

/**
 * Clerk's hosted sign-in. The catch-all segment is what lets Clerk own the
 * sub-routes it needs for OAuth callbacks, so this stays a single thin page.
 */
export default function SignInPage() {
  return (
    <main className="site-container grid min-h-dvh place-items-center py-12">
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <BrandLogo markOnly markClassName="h-9 text-foreground" className="justify-center" />
        <SignIn />
      </div>
    </main>
  );
}