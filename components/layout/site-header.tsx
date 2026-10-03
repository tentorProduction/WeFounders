"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CaretUp, List, MagnifyingGlass, X } from "@/components/icons";

import { cn } from "@/lib/utils";
import { UserButton } from "@/components/auth/user-button";
import { BrandLogo } from "@/components/brand/brand-logo";

const NAV_LINKS = [
  { href: "/", label: "Launches" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/about", label: "About" },
] as const;

/** Shape returned by /api/search — only what the dropdown renders. */
interface SearchSuggestion {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  upvotes: number;
}

/** Debounce for the type-ahead, in ms. */
const SEARCH_DEBOUNCE_MS = 180;

/**
 * Mobile-First Responsive Navbar (Spec: 390px/mobile single-row, 60px height, logo-only left, 44px touch targets right, 56px stacked links)
 */
export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();

  // Scroll & Header state
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Search state
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Mobile Menu state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Live type-ahead results
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);

  // Handle Scroll behavior (hide on scroll down, reveal on scroll up, shadow past 24px)
  useEffect(() => {
    function handleScroll() {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 24) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      if (currentScrollY > lastScrollY.current && currentScrollY > 80 && !mobileOpen) {
        // Scrolling down
        setVisible(false);
      } else {
        // Scrolling up
        setVisible(true);
      }

      lastScrollY.current = currentScrollY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mobileOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Handle ESC key to close mobile menu or search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setSearchExpanded(false);
        setMobileSearchOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus search input when expanded
  useEffect(() => {
    if (searchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchExpanded]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchExpanded(false);
      setMobileOpen(false);
      setMobileSearchOpen(false);
    }
  }

  // Debounced type-ahead against the live search API. Only runs while a search
  // surface is open, and aborts in-flight requests so keystrokes never race.
  useEffect(() => {
    if (!searchExpanded && !mobileSearchOpen) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      const term = searchQuery.trim();
      fetch(`/api/search?q=${encodeURIComponent(term)}&limit=5`, {
        signal: controller.signal,
      })
        .then((res) => (res.ok ? res.json() : { results: [] }))
        .then((data: { results?: SearchSuggestion[] }) =>
          setSuggestions(data.results ?? [])
        )
        .catch(() => {
          // Aborted or offline — keep the previous suggestions.
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, searchExpanded, mobileSearchOpen]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full bg-transparent transition-transform duration-300",
          "h-[72px] md:h-[92px] pt-2 md:pt-4",
          !visible && "-translate-y-full",
          scrolled && ""
        )}
      >
        <div className="glass-pill site-container h-[56px] md:h-[62px] flex items-center justify-between gap-2 overflow-x-hidden rounded-full px-2.5 md:px-3">
          {/* LEFT: Logo ONLY on mobile, Logo + Wordmark on desktop */}
          <div className="flex items-center shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF4B3E] rounded-md"
              onClick={() => setMobileOpen(false)}
            >
              {/* Brand mark, with the wordmark shown from 640px up to prevent horizontal overflow */}
              <BrandLogo
                markClassName="h-[26px] text-[#17181B] sm:h-[28px]"
                wordmarkClassName="hidden text-[#17181B] sm:inline-block"
              />
            </Link>
          </div>

          {/* CENTER LINKS (Desktop ONLY >= 768px) */}
          <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-6 lg:gap-8">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative font-sans text-[15px] font-medium transition-colors duration-200 py-1 focus:outline-none focus:ring-1 focus:ring-[#FF4B3E] rounded-xs",
                    isActive ? "text-[#17181B] font-semibold" : "text-[#666A73] hover:text-[#17181B]"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#FF4B3E] animate-scale-up" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT (Desktop >= 768px): Search, User Button, Launch CTA */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            {/* Expandable Live Search */}
            <div className="relative">
              {searchExpanded ? (
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search launches..."
                    className="h-[40px] w-[220px] lg:w-[260px] rounded-[10px] border border-[#DADDE1] bg-[#F2F3F5] pl-9 pr-8 text-[14px] text-[#17181B] placeholder:text-[#666A73] focus:outline-none focus:ring-2 focus:ring-[#FF4B3E]"
                  />
                  <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666A73]" weight="bold" />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchExpanded(false);
                      setSearchQuery("");
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#666A73] hover:text-[#17181B]"
                  >
                    <X className="h-4 w-4" weight="bold" />
                  </button>

                  {/* Quick Live Preview Dropdown */}
                  {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 rounded-[10px] border border-[#DADDE1] bg-[#FFFFFF] p-2 shadow-2xl z-50 space-y-1">
                      {suggestions.map((st) => (
                        <Link
                          key={st.id}
                          href={`/startups/${st.slug}`}
                          onClick={() => setSearchExpanded(false)}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-[#F4F4F5] text-left"
                        >
                          <div>
                            <p className="text-[14px] font-archivo font-bold text-[#17181B]">{st.name}</p>
                            <p className="text-[12px] text-[#666A73] truncate max-w-[180px]">{st.tagline}</p>
                          </div>
                          <span className="inline-flex items-center gap-0.5 text-[12px] font-mono font-bold text-[#FF4B3E]">
                            <CaretUp weight="fill" className="h-3 w-3" />
                            {st.upvotes}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchExpanded(true)}
                  aria-label="Open search"
                  className="flex h-[40px] w-[40px] items-center justify-center rounded-[10px] border border-[#DADDE1] bg-[#F2F3F5] text-[#666A73] transition-colors hover:text-[#17181B] hover:border-[#D4D4D8]"
                >
                  <MagnifyingGlass className="h-4 w-4" weight="bold" />
                </button>
              )}
            </div>

            {/* User Control / Sign In */}
            <UserButton />

            {/* Primary Gold CTA "Launch Your Startup" */}
            <Link
              href="/submit"
              className="ink-button inline-flex items-center justify-center px-[20px] py-[10px] font-archivo text-[14px] font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shrink-0"
            >
              Launch Your Startup
            </Link>
          </div>

          {/* MOBILE RIGHT (< 768px): Search Icon Button (44px) + Hamburger Icon Button (44px) with 8px gap */}
          <div className="flex items-center gap-2 md:hidden shrink-0">
            <button
              type="button"
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen);
                setMobileOpen(false);
              }}
              aria-label="Toggle search input"
              className="flex h-[44px] w-[44px] items-center justify-center rounded-[8px] border border-[#DADDE1] bg-[#F2F3F5] text-[#17181B] active:scale-95 transition-transform"
            >
              <MagnifyingGlass className="h-5 w-5 text-[#17181B]" weight="bold" />
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileOpen(!mobileOpen);
                setMobileSearchOpen(false);
              }}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="flex h-[44px] w-[44px] items-center justify-center rounded-[8px] border border-[#DADDE1] bg-[#F2F3F5] text-[#17181B] active:scale-95 transition-transform"
            >
              {mobileOpen ? <X className="h-5 w-5 text-[#17181B]" weight="bold" /> : <List className="h-5 w-5 text-[#17181B]" weight="bold" />}
            </button>
          </div>
        </div>
      </header>

      {/* QUICK MOBILE SEARCH INPUT INLINE DROP DOWN */}
      {mobileSearchOpen && (
        <div className="fixed top-[72px] inset-x-3 z-40 rounded-[22px] border border-white/80 bg-white/92 p-3 shadow-xl backdrop-blur-xl md:hidden animate-fade-in-up">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search launches by name..."
              className="h-[44px] w-full rounded-[10px] border border-[#DADDE1] bg-[#F2F3F5] pl-10 pr-10 text-[15px] text-[#17181B] placeholder:text-[#666A73] focus:outline-none focus:ring-2 focus:ring-[#FF4B3E]"
              autoFocus
            />
            <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666A73]" weight="bold" />
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666A73] hover:text-[#17181B]"
            >
              <X className="h-4 w-4" weight="bold" />
            </button>
          </form>

          {suggestions.length > 0 && (
            <div className="mt-2 space-y-1 rounded-[10px] border border-[#DADDE1] bg-[#F2F3F5] p-2">
              {suggestions.map((st) => (
                <Link
                  key={st.id}
                  href={`/startups/${st.slug}`}
                  onClick={() => setMobileSearchOpen(false)}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-[#F4F4F5]"
                >
                  <div>
                    <p className="text-[14px] font-archivo font-bold text-[#17181B]">{st.name}</p>
                    <p className="text-[12px] text-[#666A73] truncate max-w-[240px]">{st.tagline}</p>
                  </div>
                  <span className="inline-flex items-center gap-0.5 text-[12px] font-mono font-bold text-[#FF4B3E]">
                    <CaretUp weight="fill" className="h-3 w-3" />
                    {st.upvotes}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MOBILE SLIDE-DOWN HAMBURGER PANEL */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="fixed top-[72px] inset-x-3 rounded-[22px] border border-white/80 bg-white/95 p-5 space-y-5 shadow-2xl backdrop-blur-xl transition-all duration-250 ease-in-out max-h-[calc(100vh-84px)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input on Top (Full Width, 44px height) */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                aria-label="Search launches by name"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search launches by name..."
                className="h-[44px] w-full rounded-[10px] border border-[#DADDE1] bg-[#F2F3F5] pl-10 pr-4 text-[15px] text-[#17181B] placeholder:text-[#666A73] focus:outline-none focus:ring-2 focus:ring-[#FF4B3E]"
              />
              <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666A73]" weight="bold" />
            </form>

            {/* Stacked 18px Links, 56px Row Height Each */}
            <nav className="flex flex-col divide-y divide-[#DADDE1]">
              {NAV_LINKS.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "h-[56px] flex items-center font-archivo text-[18px] font-semibold transition-colors px-1",
                      isActive ? "text-[#FF4B3E]" : "text-[#17181B] hover:text-[#FF4B3E]"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-[#DADDE1] pt-4 space-y-3">
              {/* Full-width Sign In ghost button */}
              <div className="w-full flex justify-center">
                <UserButton />
              </div>

              {/* Gold "Launch Your Startup" CTA Full Width (44px height, 10px radius) */}
              <Link
                href="/submit"
                onClick={() => setMobileOpen(false)}
                className="ink-button w-full h-[46px] flex items-center justify-center font-archivo text-[16px] font-semibold active:scale-[0.99] transition-all"
              >
                Launch Your Startup
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
