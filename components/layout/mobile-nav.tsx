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
 * Mobile Bottom Nav Bar (Spec: background #FFFFFF with blur, 1px border #E4E4E7, 5 equal items, 44px+ tap targets, active gold #DC2626)
 */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 md:hidden bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#E4E4E7] px-3 py-2 pb-[calc(8px+env(safe-area-inset-bottom))]"
    >
      <ul className="flex items-center justify-around gap-1 max-w-md mx-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <li key={href} className="flex-1 flex justify-center">
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "press-scale flex h-[44px] w-[44px] flex-col items-center justify-center rounded-[10px] transition-all duration-200",
                  active
                    ? "bg-[#DC2626] text-[#FAFAFA] font-bold shadow-sm"
                    : "text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5]"
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span className="sr-only">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
