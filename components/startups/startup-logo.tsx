import Image from "next/image";

import { cn } from "@/lib/utils";

/** High-contrast monochrome gradients for startups without an uploaded logo. */
const LOGO_GRADIENTS = [
  "linear-gradient(135deg, #000000, #27272a)",
  "linear-gradient(135deg, #18181b, #3f3f46)",
  "linear-gradient(135deg, #27272a, #52525b)",
  "linear-gradient(135deg, #3f3f46, #71717a)",
  "linear-gradient(135deg, #09090b, #18181b)",
  "linear-gradient(135deg, #18181b, #000000)",
];

function hash(input: string): number {
  let value = 0;
  for (let i = 0; i < input.length; i += 1) {
    value = (value * 31 + input.charCodeAt(i)) % 9973;
  }
  return value;
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "W";
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export interface StartupLogoProps {
  name: string;
  logoUrl?: string | null;
  /** Used to pick a stable gradient when no logo is uploaded. */
  seed?: string;
  size?: number;
  className?: string;
}

/**
 * Startup logo in Black & White monochrome style.
 */
export function StartupLogo({
  name,
  logoUrl,
  seed,
  size = 64,
  className,
}: StartupLogoProps) {
  const url = logoUrl?.trim();

  if (url) {
    return (
      <Image
        src={url}
        alt={`${name} logo`}
        width={size}
        height={size}
        className={cn("shrink-0 rounded-lg border border-border object-cover grayscale", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  const gradient = LOGO_GRADIENTS[hash(seed ?? name) % LOGO_GRADIENTS.length];

  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg border border-border font-mono font-bold text-white shadow-sm",
        className
      )}
      style={{
        width: size,
        height: size,
        backgroundImage: gradient,
        fontSize: Math.round(size * 0.4),
        lineHeight: 1,
      }}
    >
      {initials(name)}
    </span>
  );
}
