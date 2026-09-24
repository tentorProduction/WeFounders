import Link from "next/link";

const DOC_LINKS = [
  { href: "/docs/prd", label: "Product Requirements (PRD)" },
  { href: "/docs/trd", label: "Technical Requirements (TRD)" },
  { href: "/docs/design", label: "Design System" },
  { href: "/docs/deployment", label: "Free Deployment Guide" },
];

const COMMUNITY_LINKS = [
  { href: "https://github.com", label: "GitHub" },
  { href: "https://discord.com", label: "Discord" },
  { href: "https://x.com", label: "X / Twitter" },
  { href: "mailto:hello@wefounder.dev", label: "Email Us" },
];

const PRODUCT_LINKS = [
  { href: "/", label: "Explore Startups" },
  { href: "/quests", label: "Testing Quests" },
  { href: "/collab", label: "Bounties & Gigs" },
  { href: "/promote", label: "Promote Beta" },
];

/**
 * Compact Footer (Section 27 Spec):
 * Clean 4-column layout, compact spacing, clear typography hierarchy.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card mt-12">
      <div className="site-container grid gap-8 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="flex h-6 w-6 items-center justify-center rounded bg-[#111111] dark:bg-[#EDEDED] font-mono text-xs font-bold text-white dark:text-[#111111]"
            >
              W
            </span>
            <span className="text-heading font-bold text-foreground font-sans">WeFounder</span>
          </div>
          <p className="text-meta text-text-secondary leading-relaxed">
            Nepal&apos;s startup launchpad — discover, beta-test, and support startups built in Nepal and beyond.
          </p>
        </div>

        {/* Product */}
        <nav aria-label="Product" className="space-y-2">
          <h3 className="text-badge font-semibold uppercase tracking-wider text-text-muted font-mono">
            Product
          </h3>
          <ul className="space-y-1.5">
            {PRODUCT_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-meta text-text-secondary transition-colors hover:text-foreground underline-offset-4 hover:underline"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Community */}
        <nav aria-label="Community" className="space-y-2">
          <h3 className="text-badge font-semibold uppercase tracking-wider text-text-muted font-mono">
            Community
          </h3>
          <ul className="space-y-1.5">
            {COMMUNITY_LINKS.map(({ href, label }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-meta text-text-secondary transition-colors hover:text-foreground underline-offset-4 hover:underline"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Resources */}
        <nav aria-label="Resources" className="space-y-2">
          <h3 className="text-badge font-semibold uppercase tracking-wider text-text-muted font-mono">
            Resources
          </h3>
          <ul className="space-y-1.5">
            {DOC_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-meta text-text-secondary transition-colors hover:text-foreground underline-offset-4 hover:underline"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="site-container flex flex-col items-center justify-between gap-2 py-4 text-meta text-text-muted sm:flex-row font-mono">
          <p>© 2026 WeFounder.dev — Startup Discovery Platform</p>
          <p>Built for Founders in Nepal &amp; Beyond</p>
        </div>
      </div>
    </footer>
  );
}
