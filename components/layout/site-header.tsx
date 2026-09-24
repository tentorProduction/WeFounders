import Link from "next/link";
import { Plus } from "lucide-react";

import { SearchBar } from "@/components/layout/search-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserButton } from "@/components/auth/user-button";

const NAV_LINKS = [
  { href: "/", label: "Explore", badge: null },
  { href: "/quests", label: "Quests", badge: "Bounties" },
  { href: "/collab", label: "Bounties & Gigs", badge: null },
] as const;

/**
 * Header / Navigation (Section 8 Spec):
 * Left: WeFounder logo | Center: Explore, Quests, Bounties & Gigs | Right: Search, Sign In, + Submit Beta
 */
export function SiteHeader() {
  return (
    <header className="material-header sticky top-0 z-40 w-full">
      <div className="site-container flex h-14 items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <Link href="/" className="press-scale flex shrink-0 items-center gap-2">
          <span
            aria-hidden
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#111111] dark:bg-[#EDEDED] font-mono text-xs font-bold leading-none text-white dark:text-[#111111]"
          >
            W
          </span>
          <span className="flex items-baseline gap-1">
            <span className="text-product font-bold tracking-tight text-foreground font-sans">
              WeFounder
            </span>
            <Badge variant="outline" className="hidden normal-case sm:inline-flex text-[11px] font-normal px-1.5 py-0">
              .dev
            </Badge>
          </span>
        </Link>

        {/* Center: Navigation Links */}
        <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="press-scale inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-body font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              {link.label}
              {link.badge && (
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-badge font-semibold text-accent">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Right: Search + Auth + Submit CTA */}
        <div className="flex items-center gap-2">
          <SearchBar
            className="hidden w-44 lg:block xl:w-56"
            placeholder="Search startups…"
          />
          
          <UserButton />

          <ThemeToggle />

          <Button asChild size="sm" className="hidden sm:inline-flex bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
            <Link href="/submit">
              <Plus className="h-4 w-4" aria-hidden />
              Submit Beta
            </Link>
          </Button>

          {/* Mobile Icon CTA */}
          <Button asChild size="icon" className="sm:hidden bg-primary text-primary-foreground">
            <Link href="/submit" aria-label="Submit your beta">
              <Plus className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
