"use client";

import { useEffect } from "react";

import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // If it's an internal Next.js redirect signal, rethrow so Next.js router performs the redirect
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("[app-error-boundary] unhandled error caught:", error);
  }, [error]);

  // Don't render error UI if Next.js is performing a redirect
  if (error?.digest?.startsWith("NEXT_REDIRECT")) {
    return null;
  }

  return (
    <section className="site-container py-20 text-center sm:text-left space-y-4" role="alert">
      <h1 className="font-archivo text-2xl sm:text-3xl font-bold text-[#17181B]">
        We couldn’t load this page.
      </h1>
      <p className="text-xs sm:text-sm text-[#666A73] max-w-md">
        The service is temporarily unavailable. Your saved work remains safe in your account.
      </p>
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          className="ink-button px-6 py-2.5 text-xs font-semibold rounded-full shadow-xs"
          onClick={reset}
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 text-xs font-semibold rounded-full border border-[#DADDE1] text-[#17181B] hover:bg-[#F2F3F5] transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </section>
  );
}
