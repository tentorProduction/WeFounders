import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CookieSettingsButton } from "@/components/privacy/cookie-settings-button";

const PRODUCT_LINKS = [
  { href: "/", label: "Explore Today's Feed" },
  { href: "/leaderboard", label: "Founder Leaderboard" },
  { href: "/quests", label: "Testing Quests & Bounties" },
  { href: "/collab", label: "Co-founders & Gigs" },
  { href: "/promote", label: "Spotlight Promotion" },
];

const RESOURCE_LINKS = [
  { href: "/about", label: "About & Manifesto" },
  { href: "/about#guidelines", label: "Submission Guidelines" },
  { href: "/about#curation", label: "21% Curation Standard" },
  { href: "/profile", label: "Founder Analytics Dashboard" },
  { href: "/faq", label: "Frequently Asked Questions" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

const COMMUNITY_LINKS = [
  { href: "https://github.com/tentorProduction/WeFounders", label: "GitHub Repository" },
  { href: "https://x.com/wefounders_dev", label: "X / Twitter (@wefounders_dev)" },
  { href: "https://discord.gg/wefounders", label: "Builder Discord" },
  { href: "mailto:hello@wefounders.dev", label: "Email: hello@wefounders.dev" },
];

/**
 * WeFounders Footer Component (#FFFFFF background, #DADDE1 borders)
 */
export function SiteFooter() {
  return (
    <footer className="site-container mb-4 mt-20 overflow-hidden rounded-[28px] bg-[#17181B] text-caption text-white">
      <div className="grid gap-8 px-6 py-10 sm:grid-cols-2 sm:px-10 lg:grid-cols-4 lg:py-12">
        {/* Brand Column */}
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-2">
            <span
              aria-hidden
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF4B3E] font-archivo text-xs font-bold text-white"
            >
              W
            </span>
            <span className="text-[18px] font-archivo font-bold tracking-tight text-white">
              We<span className="text-[#FF4B3E]">Founders</span>
            </span>
            <Badge variant="outline" className="border-white/20 bg-white/8 text-[10px] font-mono text-white/60">
              .dev 🇳🇵
            </Badge>
          </Link>
          <p className="text-white/60 leading-relaxed">
            Nepal&apos;s launchpad for world-class startups. Get your early beta users from Nepal&apos;s builder community.
          </p>
          <div className="pt-1 text-tiny font-mono text-white/50">
            Contact: <a href="mailto:hello@wefounders.dev" className="text-white hover:underline">hello@wefounders.dev</a>
          </div>
        </div>

        {/* Product Navigation */}
        <nav aria-label="Product links" className="space-y-3">
          <h3 className="text-tiny font-bold uppercase tracking-wider text-white font-mono">
            Platform
          </h3>
          <ul className="space-y-2">
            {PRODUCT_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-white/60 transition-colors hover:text-white underline-offset-4 hover:underline"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Resources & Guidelines */}
        <nav aria-label="Resource links" className="space-y-3">
          <h3 className="text-tiny font-bold uppercase tracking-wider text-white font-mono">
            Resources &amp; Curation
          </h3>
          <ul className="space-y-2">
            {RESOURCE_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-white/60 transition-colors hover:text-white underline-offset-4 hover:underline"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Community & Socials */}
        <nav aria-label="Community links" className="space-y-3">
          <h3 className="text-tiny font-bold uppercase tracking-wider text-white font-mono">
            Community
          </h3>
          <ul className="space-y-2">
            {COMMUNITY_LINKS.map(({ href, label }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/60 transition-colors hover:text-white underline-offset-4 hover:underline"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/12">
        <div className="site-container flex flex-col items-center justify-between gap-3 py-6 text-tiny text-white/60 sm:flex-row font-mono">
          <p>© 2026 WeFounders.dev — Startup Discovery &amp; Beta Launchpad</p>
          <p className="flex flex-wrap items-center gap-2">
            <span>Kathmandu NPT Timezone</span>
            <span>•</span>
            <span>Made with 🇳🇵 Pride</span>
            {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
              <>
                <span>•</span>
                <CookieSettingsButton />
              </>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
