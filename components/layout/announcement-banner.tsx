import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

/**
 * Top announcement bar — Black & White monochrome design with Firebase Auth.
 */
export function AnnouncementBanner() {
  return (
    <div className="border-b border-border bg-foreground text-background">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-2 gap-y-0.5 px-4 py-1.5 text-center text-caption font-mono">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <Sparkles className="h-3.5 w-3.5 fill-current" aria-hidden />
          Wefounder.dev v1.0 is live — High-Contrast Beta Launchpad
        </span>
        <span aria-hidden className="hidden opacity-50 sm:inline">
          ·
        </span>
        <Link
          href="/promote"
          className="group inline-flex items-center gap-1.5 font-semibold text-background underline underline-offset-2 hover:no-underline"
        >
          Promote your startup
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>
    </div>
  );
}
