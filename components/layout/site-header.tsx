"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { STARTUP_FIXTURES } from "@/lib/fixtures/startups";
import { UserButton } from "@/components/auth/user-button";

const NAV_LINKS = [
  { href: "/", label: "Launches" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/about", label: "About" },
] as const;

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

  // Handle Scroll behavior (hide on scroll down, reveal on scroll up, shadow past 24px)
  useEffect(() => {
    function handleScroll() {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 24) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
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
  }, []);

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
    }
  }

  // Filter search matches for quick dropdown preview
  const searchResults = searchQuery.trim()
    ? STARTUP_FIXTURES.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.tagline.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full bg-[#15171C]/92 backdrop-blur-md border-b border-[#26282F] transition-all duration-300",
          "h-[64px] lg:h-[72px]",
          !visible && "-translate-y-full",
          scrolled && "shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
        )}
      >
        <div className="site-container h-full flex items-center justify-between gap-4">
          {/* LEFT: Logo & Wordmark */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="press-scale flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-[#B98A45] rounded-md"
              onClick={() => setMobileOpen(false)}
            >
              {/* Gold rounded square icon */}
              <span
                aria-hidden
                className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#B98A45] font-archivo text-[15px] font-black text-[#0E0F13] shadow-xs"
              >
                W
              </span>
              {/* Wordmark */}
              <span className="font-archivo font-bold text-[18px] text-[#F5F1E8] tracking-tight">
                WeFounders
              </span>
            </Link>
          </div>

          {/* CENTER LINKS (Desktop) */}
          <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-8">
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
                    "relative font-sans text-[15px] font-medium transition-colors duration-200 py-1 focus:outline-none focus:ring-1 focus:ring-[#B98A45] rounded-xs",
                    isActive ? "text-[#B98A45] font-semibold" : "text-[#9A958A] hover:text-[#F5F1E8]"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B98A45] rounded-full animate-scale-up" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT (Desktop): Search, User Button, Launch CTA */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Expandable Live Search */}
            <div className="relative">
              {searchExpanded ? (
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search launches by name..."
                    className="h-[40px] w-[260px] rounded-[10px] border border-[#26282F] bg-[#0E0F13] pl-9 pr-8 text-[14px] text-[#F5F1E8] placeholder:text-[#9A958A] focus:outline-none focus:ring-2 focus:ring-[#B98A45]"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9A958A]" />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchExpanded(false);
                      setSearchQuery("");
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9A958A] hover:text-[#F5F1E8]"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {/* Quick Live Preview Dropdown */}
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 rounded-[10px] border border-[#26282F] bg-[#15171C] p-2 shadow-2xl z-50 space-y-1">
                      {searchResults.map((st) => (
                        <Link
                          key={st.id}
                          href={`/startups/${st.slug}`}
                          onClick={() => setSearchExpanded(false)}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-[#1C1E24] text-left"
                        >
                          <div>
                            <p className="text-[14px] font-archivo font-bold text-[#F5F1E8]">{st.name}</p>
                            <p className="text-[12px] text-[#9A958A] truncate max-w-[200px]">{st.tagline}</p>
                          </div>
                          <span className="text-[12px] font-mono text-[#B98A45]">▲ {st.upvotes_count}</span>
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
                  className="flex h-[40px] w-[40px] items-center justify-center rounded-[10px] border border-[#26282F] bg-[#0E0F13] text-[#9A958A] transition-colors hover:text-[#F5F1E8] hover:border-[#3A3D46]"
                >
                  <Search className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Ghost Sign In / User Control */}
            <UserButton />

            {/* Primary Gold CTA "Launch Your Startup" */}
            <Link
              href="/submit"
              className="inline-flex items-center justify-center rounded-[10px] bg-[#B98A45] px-[20px] py-[10px] font-archivo text-[15px] font-semibold text-[#0E0F13] transition-all duration-200 hover:bg-[#c99a55] hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
            >
              Launch Your Startup
            </Link>
          </div>

          {/* MOBILE RIGHT: Hamburger */}
          <div className="flex items-center gap-3 lg:hidden">
            <UserButton />

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] border border-[#26282F] bg-[#0E0F13] text-[#F5F1E8]"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE SLIDE-DOWN PANEL */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="fixed top-[64px] inset-x-0 bg-[#15171C] border-b border-[#26282F] p-6 space-y-6 shadow-2xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input on Top */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                aria-label="Search launches by name"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search launches by name..."
                className="h-[44px] w-full rounded-[10px] border border-[#26282F] bg-[#0E0F13] pl-10 pr-4 text-[15px] text-[#F5F1E8] placeholder:text-[#9A958A] focus:outline-none focus:ring-2 focus:ring-[#B98A45]"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9A958A]" />
            </form>

            {/* Stacked 18px Links */}
            <nav className="flex flex-col gap-4">
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
                      "font-archivo text-[18px] font-semibold py-1 transition-colors",
                      isActive ? "text-[#B98A45]" : "text-[#F5F1E8] hover:text-[#B98A45]"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Full-width Sign In + Gold CTA at Bottom */}
            <div className="pt-2 flex flex-col gap-3">
              <Link
                href="/submit"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center rounded-[10px] bg-[#B98A45] py-3 font-archivo text-[16px] font-semibold text-[#0E0F13] shadow-md hover:bg-[#c99a55]"
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
