"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Search, Swords, User, Users, Rocket } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Feed", icon: Compass },
  { href: "/quests", label: "Quests", icon: Swords },
  { href: "/collab", label: "Collab", icon: Users },
  { href: "/search", label: "Search", icon: Search },
  { href: "/profile", label: "Profile", icon: User },
] as const;

/**
 * Compact mobile navigation. Four destinations stay flat and equally weighted;
 * the launch action is promoted as a labelled pill rather than a bare "+" so it
 * never competes with or obscures the destinations.
 */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#DADDE1] bg-white/95 px-2 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom))] backdrop-blur-lg md:hidden"
    >
      <ul className="mx-auto flex max-w-md items-stretch gap-1">
        {/* Launch — primary action, kept labelled */}
        <li className="flex">
          <Link
            href="/submit"
            aria-label="Launch your startup"
            className="press-scale flex min-h-12 items-center justify-center gap-1.5 rounded-full bg-[#17181B] px-3 text-[11px] font-semibold text-white"
          >
            <Rocket className="h-4 w-4" aria-hidden />
            <span>Launch</span>
          </Link>
        </li>

        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <li key={href} className="min-w-0 flex-1">
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "press-scale flex min-h-12 w-full flex-col items-center justify-center gap-1 rounded-md px-1 text-[10px] font-medium leading-none transition-colors",
                  active ? "text-[#E83A30]" : "text-[#666A73] hover:text-[#17181B]",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex h-6 w-9 items-center justify-center rounded-full transition-colors",
                    active && "bg-[#FF4B3E]/10",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <span className={cn(active && "font-semibold")}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}