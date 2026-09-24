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
 * iOS 26 Liquid Glass Floating Tab Bar (HIG §2, §10 & §16):
 * Capsule floating above content with backdrop blur + shadow inset.
 */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-6 z-50 px-4 sm:hidden flex justify-center"
    >
      <ul className="liquid-glass-regular flex items-center gap-1.5 rounded-full p-2 shadow-apple-lg">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <li key={href}>
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "press-scale flex h-11 w-11 items-center justify-center rounded-full transition-all duration-quick",
                  active
                    ? "bg-primary text-primary-foreground shadow-apple-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
