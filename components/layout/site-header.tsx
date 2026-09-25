"use client";

import Link from "next/link";
import { Plus, Trophy, Swords, Users, Search, Info, Award } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserButton } from "@/components/auth/user-button";

const NAV_LINKS = [
  { href: "/", label: "Launches", icon: Trophy, badge: null },
  { href: "/leaderboard", label: "Leaderboard", icon: Award, badge: null },
  { href: "/quests", label: "Quests", icon: Swords, badge: "NPR Bounties" },
  { href: "/collab", label: "Community", icon: Users, badge: null },
  { href: "/about", label: "About", icon: Info, badge: null },
] as const;

/**
 * Auralis Clean Paper Workflow — Header Navigation Component
 */
export function SiteHeader() {
  return (
    <header className="material-header sticky top-0 z-40 w-full border-b border-[#322A1F]/60">
      <div className="site-container flex h-16 items-center justify-between gap-4">
        {/* Left: Brand Logo & Live Indicator */}
        <div className="flex items-center gap-3">
          <Link href="/" className="press-scale flex shrink-0 items-center gap-2.5">
            <span
              aria-hidden
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#B98A45] font-mono text-xs font-bold text-[#15171C] shadow-sm"
            >
              W
            </span>
            <span className="flex items-baseline gap-1.5">
              <span className="text-subheading font-bold tracking-tight text-foreground font-sans">
                We<span className="text-[#B98A45]">Founders</span>
              </span>
              <Badge variant="outline" className="hidden sm:inline-flex text-[10px] font-mono font-medium px-1.5 py-0 border-[#322A1F] text-[#B98A45]">
                .dev 🇳🇵
              </Badge>
            </span>
          </Link>

          {/* Live Visitor Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 rounded-full bg-[#322A1F]/80 px-2.5 py-0.5 text-tiny font-medium text-[#FFE8B8] border border-[#B98A45]/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B98A45] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B98A45]"></span>
            </span>
            <span>Live Nepal Venture Hub</span>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="press-scale inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-caption font-semibold text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
              >
                <Icon className="h-3.5 w-3.5 text-[#B98A45]" />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="rounded-full bg-[#B98A45]/20 px-2 py-0.5 text-[10px] font-bold text-[#B98A45]">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Search CTA + Auth + Launch Product */}
        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-input bg-secondary/50 px-3 py-1.5 text-caption text-muted-foreground hover:bg-secondary transition-all"
          >
            <Search className="h-3.5 w-3.5 text-[#B98A45]" />
            <span>Search ventures...</span>
            <kbd className="rounded border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground">
              ⌘S
            </kbd>
          </Link>

          <UserButton />

          <ThemeToggle />

          <Button
            asChild
            size="sm"
            className="hidden sm:inline-flex bg-[#B98A45] text-[#15171C] hover:bg-[#B98A45]/90 font-bold shadow-sm rounded-lg px-4"
          >
            <Link href="/submit">
              <Plus className="h-4 w-4 mr-1" aria-hidden />
              <span>Submit Startup</span>
            </Link>
          </Button>

          {/* Mobile Icon CTA */}
          <Button asChild size="icon" className="sm:hidden bg-[#B98A45] text-[#15171C] rounded-lg">
            <Link href="/submit" aria-label="Submit your startup">
              <Plus className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
