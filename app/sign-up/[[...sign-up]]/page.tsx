import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

import { BrandLogo } from "@/components/brand/brand-logo";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false, follow: false },
};

/** Clerk's hosted sign-up, reachable from the sign-in page. */
export default function SignUpPage() {
  return (
    <main className="site-container grid min-h-dvh place-items-center py-12">
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <BrandLogo markOnly markClassName="h-9 text-foreground" className="justify-center" />
        <SignUp />
      </div>
    </main>
  );
}