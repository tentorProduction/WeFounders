"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Search, Swords, User, Users } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Feed", icon: Compass },
  { href: "/quests", label: "Quests", icon: Swords },
  { href: "/collab", label: "Collab", icon: Users },
  { href: "/search", label: "Search", icon: Search },
  { href: "/profile", label: "Profile", icon: User },
] as const;

/**
 * Compact mobile navigation with a clear active state and labeled touch targets.
 */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#E4E4E7] bg-white px-2 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom))] md:hidden"
    >
      <ul className="mx-auto flex max-w-md items-stretch gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <li key={href} className="min-w-0 flex-1">
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "press-scale flex min-h-12 w-full flex-col items-center justify-center gap-1 rounded-md px-1 text-[10px] font-medium leading-none transition-colors",
                  active ? "text-[#B91C1C]" : "text-[#71717A] hover:text-[#18181B]",
                )}
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
