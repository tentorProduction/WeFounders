import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/brand/brand-logo";
import { CookieSettingsButton } from "@/components/privacy/cookie-settings-button";
import { GlobeHemisphereWest } from "@/components/icons";

const DISCOVER_LINKS = [
  { href: "/", label: "Launches" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/quests", label: "Quests" },
  { href: "/collab", label: "Collab" },
  { href: "/promote", label: "Spotlight" },
];

const RESOURCE_LINKS = [
  { href: "/about", label: "About" },
  { href: "/about#guidelines", label: "Guidelines" },
  { href: "/about#curation", label: "Curation" },
  { href: "/faq", label: "FAQ" },
];

const COMMUNITY_LINKS = [
  { href: "https://github.com/tentorProduction/WeFounders", label: "GitHub" },
  { href: "https://x.com/wefounders_dev", label: "X / Twitter" },
  { href: "https://discord.gg/wefounders", label: "Discord" },
  { href: "mailto:hello@wefounders.dev", label: "hello@wefounders.dev" },
];

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

/**
 * WeFounders Footer (#17181B surface). Kept to a single compact band: brand,
 * three link groups, and a legal/status strip, so it never outweighs the
 * content above it.
 */
export function SiteFooter() {
  return (
    <footer className="site-container mb-4 mt-16 overflow-hidden rounded-[28px] bg-[#17181B] text-caption text-white">
      <div className="grid gap-8 px-6 py-9 sm:grid-cols-2 sm:px-10 lg:grid-cols-4 lg:py-10">
        {/* Brand */}
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo markClassName="h-[22px] text-white" wordmarkClassName="text-white" />
            <Badge
              variant="outline"
              className="border-white/20 bg-white/8 text-[10px] font-mono text-white/80 inline-flex items-center gap-1 py-0.5 px-2"
            >
              <GlobeHemisphereWest className="h-3 w-3 text-[#FF4B3E]" weight="bold" />
              <span>GLOBAL</span>
            </Badge>
          </Link>
          <p className="max-w-xs text-tiny leading-relaxed text-white/60">
            The global startup launchpad. Discover world-class products, join
            active betas, and help founders ship.
          </p>
        </div>

        <FooterGroup title="Discover" links={DISCOVER_LINKS} />
        <FooterGroup title="Resources" links={RESOURCE_LINKS} />

        <div className="space-y-3">
          <FooterGroup title="Community" links={COMMUNITY_LINKS} />
        </div>
      </div>

      <div className="border-t border-white/12">
        <div className="site-container flex flex-col items-center justify-between gap-3 py-5 font-mono text-tiny text-white/60 sm:flex-row">
          <p>© 2026 WeFounders</p>

          <nav aria-label="Legal" className="flex items-center gap-4">
            {LEGAL_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className="transition-colors hover:text-white">
                {label}
              </Link>
            ))}
            {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && <CookieSettingsButton />}
          </nav>

          <p className="flex items-center gap-2">
            <span>Global Edition</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1.5">
              <GlobeHemisphereWest className="h-3.5 w-3.5 text-[#FF4B3E]" weight="bold" />
              Built for Builders Worldwide
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <nav aria-label={title} className="space-y-2.5">
      <h3 className="font-mono text-tiny font-bold uppercase tracking-wider text-white/80">
        {title}
      </h3>
      <ul className="space-y-2">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="text-tiny text-white/60 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}