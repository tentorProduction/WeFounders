"use client";

import Link from "next/link";
import { Plus, Trophy, Swords, Users, Flame, Search } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserButton } from "@/components/auth/user-button";

const NAV_LINKS = [
  { href: "/", label: "Explore", icon: Trophy, badge: null },
  { href: "/search", label: "Browse", icon: Search, badge: null },
  { href: "/quests", label: "Testing Quests", icon: Swords, badge: "NPR Bounties" },
  { href: "/collab", label: "Community", icon: Users, badge: null },
  { href: "/promote", label: "Spotlight", icon: Flame, badge: "Promote" },
] as const;

/**
 * Microlaunch.net Inspired Header Navigation:
 * Brand with Live Status, Navigation with Icons & Badges, Cmd+S Search trigger, and Gradient "+ Launch" CTA.
 */
export function SiteHeader() {
  return (
    <header className="material-header sticky top-0 z-40 w-full border-b border-border/80">
      <div className="site-container flex h-16 items-center justify-between gap-4">
        {/* Left: Brand Logo & Live Badge */}
        <div className="flex items-center gap-3">
          <Link href="/" className="press-scale flex shrink-0 items-center gap-2">
            <span
              aria-hidden
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-rose-500 font-mono text-sm font-black text-white shadow-md"
            >
              W
            </span>
            <span className="flex items-baseline gap-1.5">
              <span className="text-subheading font-black tracking-tight text-foreground font-sans">
                We<span className="text-accent">Founder</span>
              </span>
              <Badge variant="outline" className="hidden sm:inline-flex text-[10px] font-mono font-medium px-1.5 py-0 border-border">
                .dev 🇳🇵
              </Badge>
            </span>
          </Link>

          {/* Live Visitor Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-tiny font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Nepal Launchpad</span>
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
                className="press-scale inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-caption font-semibold text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
              >
                <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
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
            className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-input bg-secondary/50 px-3 py-1.5 text-caption text-muted-foreground hover:bg-secondary transition-all"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search launches...</span>
            <kbd className="rounded border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground">
              ⌘S
            </kbd>
          </Link>

          <UserButton />

          <ThemeToggle />

          <Button
            asChild
            size="sm"
            className="hidden sm:inline-flex bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 font-semibold shadow-apple-sm rounded-xl px-4"
          >
            <Link href="/submit">
              <Plus className="h-4 w-4 mr-1" aria-hidden />
              <span>+ Launch</span>
            </Link>
          </Button>

          {/* Mobile Icon CTA */}
          <Button asChild size="icon" className="sm:hidden bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl">
            <Link href="/submit" aria-label="Submit your beta">
              <Plus className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
