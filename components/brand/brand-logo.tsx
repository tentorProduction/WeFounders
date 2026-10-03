import { cn } from "@/lib/utils";

import { BrandMark } from "@/components/brand/brand-mark";

interface BrandLogoProps {
  /** Wrapper class. Defaults to a single-row, baseline-centred lockup. */
  className?: string;
  /** Sizing for the mark glyph itself. */
  markClassName?: string;
  /** Sizing for the wordmark text. */
  wordmarkClassName?: string;
  /** Renders the glyph only — used in the tight mobile header. */
  markOnly?: boolean;
}

/**
 * Full WeFounders logo: mark + lowercase "wefounders" wordmark, as supplied in
 * the brand artwork. The wordmark uses the Archivo face already loaded by the
 * app, and both parts inherit `currentColor` for light and dark surfaces.
 */
export function BrandLogo({
  className,
  markClassName,
  wordmarkClassName,
  markOnly = false,
}: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark className={cn("h-[26px] shrink-0", markClassName)} />
      {!markOnly && (
        <span
          className={cn(
            "font-archivo text-[18px] font-bold lowercase leading-none tracking-tight",
            wordmarkClassName
          )}
        >
          wefounders
        </span>
      )}
    </span>
  );
}