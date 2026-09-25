import Link from "next/link";
import { Badge } from "@/components/ui/badge";

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
];

const COMMUNITY_LINKS = [
  { href: "https://github.com/tentorProduction/WeFounders", label: "GitHub Repository" },
  { href: "https://x.com/wefounders_dev", label: "X / Twitter (@wefounders_dev)" },
  { href: "https://discord.gg/wefounders", label: "Builder Discord" },
  { href: "mailto:hello@wefounders.dev", label: "Email: hello@wefounders.dev" },
];

/**
 * WeFounders Footer Component (#15171C background, #26282F borders)
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-[#26282F] bg-[#15171C] mt-16 text-caption">
      <div className="site-container grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand Column */}
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-2">
            <span
              aria-hidden
              className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#B98A45] font-archivo text-xs font-bold text-[#0E0F13]"
            >
              W
            </span>
            <span className="text-[18px] font-archivo font-bold tracking-tight text-[#F5F1E8]">
              We<span className="text-[#B98A45]">Founders</span>
            </span>
            <Badge variant="outline" className="text-[10px] font-mono border-[#26282F] text-[#9A958A] bg-[#0E0F13]">
              .dev 🇳🇵
            </Badge>
          </Link>
          <p className="text-[#9A958A] leading-relaxed">
            Nepal&apos;s launchpad for world-class startups. Get your first 1,000 beta users from Nepal&apos;s builder community.
          </p>
          <div className="pt-1 text-tiny font-mono text-[#9A958A]">
            Contact: <a href="mailto:hello@wefounders.dev" className="text-[#F5F1E8] hover:underline">hello@wefounders.dev</a>
          </div>
        </div>

        {/* Product Navigation */}
        <nav aria-label="Product links" className="space-y-3">
          <h3 className="text-tiny font-bold uppercase tracking-wider text-[#F5F1E8] font-mono">
            Platform
          </h3>
          <ul className="space-y-2">
            {PRODUCT_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-[#9A958A] transition-colors hover:text-[#F5F1E8] underline-offset-4 hover:underline"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Resources & Guidelines */}
        <nav aria-label="Resource links" className="space-y-3">
          <h3 className="text-tiny font-bold uppercase tracking-wider text-[#F5F1E8] font-mono">
            Resources &amp; Curation
          </h3>
          <ul className="space-y-2">
            {RESOURCE_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-[#9A958A] transition-colors hover:text-[#F5F1E8] underline-offset-4 hover:underline"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Community & Socials */}
        <nav aria-label="Community links" className="space-y-3">
          <h3 className="text-tiny font-bold uppercase tracking-wider text-[#F5F1E8] font-mono">
            Community
          </h3>
          <ul className="space-y-2">
            {COMMUNITY_LINKS.map(({ href, label }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#9A958A] transition-colors hover:text-[#F5F1E8] underline-offset-4 hover:underline"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-[#26282F]">
        <div className="site-container flex flex-col items-center justify-between gap-3 py-6 text-tiny text-[#9A958A] sm:flex-row font-mono">
          <p>© 2026 WeFounders.dev — Startup Discovery &amp; Beta Launchpad</p>
          <p className="flex items-center gap-2">
            <span>Kathmandu NPT Timezone</span>
            <span>•</span>
            <span>Made with 🇳🇵 Pride</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
