"use client";

import Link from "next/link";
import { MessageSquare, PhoneCall, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#work", label: "Our Work" },
  { href: "#process", label: "Process" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const whatsappUrl = `https://wa.me/9779800000000?text=${encodeURIComponent(
    "Hello WeFounders! I would like a free quote for a website for my business."
  )}`;

  return (
    <header className="material-header sticky top-0 z-40 w-full border-b border-border/80">
      <div className="site-container flex h-16 items-center justify-between gap-4">
        {/* Left: Brand Logo & Agency Badge */}
        <Link href="/" className="press-scale flex shrink-0 items-center gap-2.5">
          <span
            aria-hidden
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-rose-500 font-mono text-base font-black text-white shadow-md"
          >
            W
          </span>
          <div className="flex flex-col">
            <span className="flex items-baseline gap-1">
              <span className="text-subheading font-black tracking-tight text-foreground font-sans">
                WeFounders
              </span>
              <Badge variant="outline" className="hidden sm:inline-flex text-[10px] font-mono font-bold px-1.5 py-0 border-purple-500/30 text-purple-600 dark:text-purple-400">
                Agency 🇳🇵
              </Badge>
            </span>
            <span className="text-[10px] text-muted-foreground font-mono leading-none hidden sm:block">
              Web Design &amp; Development
            </span>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <nav aria-label="Main agency navigation" className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="press-scale inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-caption font-semibold text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right CTAs */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          <Button
            asChild
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 font-bold shadow-apple-sm rounded-xl px-4 text-caption"
          >
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageSquare className="h-4 w-4 mr-1.5 fill-current" />
              <span>Get a Free Quote</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
