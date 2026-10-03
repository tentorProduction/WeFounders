import { cn } from "@/lib/utils";

import { BRAND_MARK_PATH, BRAND_MARK_VIEWBOX } from "@/components/brand/mark-path";

/**
 * The WeFounders mark on its own — the glyph from the brand logo without the
 * wordmark. Inherits colour from `currentColor` so it works on any surface.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox={BRAND_MARK_VIEWBOX}
      className={cn("block h-auto w-auto", className)}
      fill="currentColor"
      role="img"
      aria-label="WeFounders"
    >
      <path d={BRAND_MARK_PATH} />
    </svg>
  );
}