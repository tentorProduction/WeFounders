"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Handshake, Inbox, LayoutDashboard, Rocket, Settings, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/submissions", label: "Review", icon: Inbox },
  { href: "/admin/startups", label: "Startups", icon: Rocket },
  { href: "/admin/quests", label: "Quests", icon: Target },
  { href: "/admin/collab", label: "Collab", icon: Handshake },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-[#E4E4E7] bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="mx-auto flex max-w-xl items-stretch justify-between px-1 pt-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href} className="min-w-0 flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-0.5 text-[10px] font-medium leading-none",
                  active ? "text-[#B91C1C]" : "text-[#71717A] hover:text-[#18181B]",
                )}
              >
                <Icon aria-hidden className="h-[18px] w-[18px]" strokeWidth={active ? 2.25 : 1.8} />
                <span className="truncate">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
