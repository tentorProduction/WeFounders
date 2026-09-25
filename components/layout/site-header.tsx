"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { UserButton } from "@/components/auth/user-button";

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
          "sticky top-0 z-50 w-full bg-[#FFFFFF] backdrop-blur-md border-b border-[#E4E4E7] transition-transform duration-300",
          "h-[60px] md:h-[72px]",
          !visible && "-translate-y-full",
          scrolled && "shadow-[0_4px_24px_rgba(24,24,27,0.08)]"
        )}
      >
        <div className="site-container h-full flex items-center justify-between gap-2 overflow-x-hidden">
          {/* LEFT: Logo ONLY on mobile, Logo + Wordmark on desktop */}
          <div className="flex items-center shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-[#DC2626] rounded-md"
              onClick={() => setMobileOpen(false)}
            >
              {/* Gold rounded square icon: 30px on mobile, 32px on desktop */}
              <span
                aria-hidden
                className="flex h-[30px] w-[30px] md:h-[32px] md:w-[32px] items-center justify-center rounded-[8px] bg-[#DC2626] font-archivo text-[14px] md:text-[15px] font-black text-[#FAFAFA] shadow-xs"
              >
                W
              </span>
              {/* Wordmark: hidden on mobile (<640px) to prevent horizontal overflow */}
              <span className="hidden sm:inline-block font-archivo font-bold text-[18px] text-[#18181B] tracking-tight">
                WeFounders
              </span>
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
                    "relative font-sans text-[15px] font-medium transition-colors duration-200 py-1 focus:outline-none focus:ring-1 focus:ring-[#DC2626] rounded-xs",
                    isActive ? "text-[#DC2626] font-semibold" : "text-[#71717A] hover:text-[#18181B]"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#DC2626] rounded-full animate-scale-up" />
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
                    className="h-[40px] w-[220px] lg:w-[260px] rounded-[10px] border border-[#E4E4E7] bg-[#FAFAFA] pl-9 pr-8 text-[14px] text-[#18181B] placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717A]" />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchExpanded(false);
                      setSearchQuery("");
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#18181B]"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {/* Quick Live Preview Dropdown */}
                  {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 rounded-[10px] border border-[#E4E4E7] bg-[#FFFFFF] p-2 shadow-2xl z-50 space-y-1">
                      {suggestions.map((st) => (
                        <Link
                          key={st.id}
                          href={`/startups/${st.slug}`}
                          onClick={() => setSearchExpanded(false)}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-[#F4F4F5] text-left"
                        >
                          <div>
                            <p className="text-[14px] font-archivo font-bold text-[#18181B]">{st.name}</p>
                            <p className="text-[12px] text-[#71717A] truncate max-w-[180px]">{st.tagline}</p>
                          </div>
                          <span className="text-[12px] font-mono text-[#DC2626]">▲ {st.upvotes}</span>
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
                  className="flex h-[40px] w-[40px] items-center justify-center rounded-[10px] border border-[#E4E4E7] bg-[#FAFAFA] text-[#71717A] transition-colors hover:text-[#18181B] hover:border-[#D4D4D8]"
                >
                  <Search className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* User Control / Sign In */}
            <UserButton />

            {/* Primary Gold CTA "Launch Your Startup" */}
            <Link
              href="/submit"
              className="inline-flex items-center justify-center rounded-[10px] bg-[#DC2626] px-[20px] py-[10px] font-archivo text-[15px] font-semibold text-[#FAFAFA] transition-all duration-200 hover:bg-[#B91C1C] hover:-translate-y-0.5 active:translate-y-0 shadow-sm shrink-0"
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
              className="flex h-[44px] w-[44px] items-center justify-center rounded-[8px] border border-[#E4E4E7] bg-[#FAFAFA] text-[#18181B] active:scale-95 transition-transform"
            >
              <Search className="h-5 w-5 text-[#18181B]" />
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileOpen(!mobileOpen);
                setMobileSearchOpen(false);
              }}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="flex h-[44px] w-[44px] items-center justify-center rounded-[8px] border border-[#E4E4E7] bg-[#FAFAFA] text-[#18181B] active:scale-95 transition-transform"
            >
              {mobileOpen ? <X className="h-5 w-5 text-[#18181B]" /> : <Menu className="h-5 w-5 text-[#18181B]" />}
            </button>
          </div>
        </div>
      </header>

      {/* QUICK MOBILE SEARCH INPUT INLINE DROP DOWN */}
      {mobileSearchOpen && (
        <div className="fixed top-[60px] inset-x-0 z-40 bg-[#FFFFFF] border-b border-[#E4E4E7] p-3 shadow-xl md:hidden animate-fade-in-up">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search launches by name..."
              className="h-[44px] w-full rounded-[10px] border border-[#E4E4E7] bg-[#FAFAFA] pl-10 pr-10 text-[15px] text-[#18181B] placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
              autoFocus
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717A]" />
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#18181B]"
            >
              <X className="h-4 w-4" />
            </button>
          </form>

          {suggestions.length > 0 && (
            <div className="mt-2 space-y-1 rounded-[10px] border border-[#E4E4E7] bg-[#FAFAFA] p-2">
              {suggestions.map((st) => (
                <Link
                  key={st.id}
                  href={`/startups/${st.slug}`}
                  onClick={() => setMobileSearchOpen(false)}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-[#F4F4F5]"
                >
                  <div>
                    <p className="text-[14px] font-archivo font-bold text-[#18181B]">{st.name}</p>
                    <p className="text-[12px] text-[#71717A] truncate max-w-[240px]">{st.tagline}</p>
                  </div>
                  <span className="text-[12px] font-mono text-[#DC2626]">▲ {st.upvotes}</span>
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
            className="fixed top-[60px] inset-x-0 bg-[#FFFFFF] border-b border-[#E4E4E7] p-5 space-y-5 shadow-2xl transition-all duration-250 ease-in-out max-h-[calc(100vh-60px)] overflow-y-auto"
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
                className="h-[44px] w-full rounded-[10px] border border-[#E4E4E7] bg-[#FAFAFA] pl-10 pr-4 text-[15px] text-[#18181B] placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717A]" />
            </form>

            {/* Stacked 18px Links, 56px Row Height Each */}
            <nav className="flex flex-col divide-y divide-[#E4E4E7]">
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
                      isActive ? "text-[#DC2626]" : "text-[#18181B] hover:text-[#DC2626]"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-[#E4E4E7] pt-4 space-y-3">
              {/* Full-width Sign In ghost button */}
              <div className="w-full flex justify-center">
                <UserButton />
              </div>

              {/* Gold "Launch Your Startup" CTA Full Width (44px height, 10px radius) */}
              <Link
                href="/submit"
                onClick={() => setMobileOpen(false)}
                className="w-full h-[44px] flex items-center justify-center rounded-[10px] bg-[#DC2626] font-archivo text-[16px] font-semibold text-[#FAFAFA] shadow-md hover:bg-[#B91C1C] active:scale-[0.99] transition-all"
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
