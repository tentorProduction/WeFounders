"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Handshake, Inbox, LayoutDashboard, Rocket, Settings, Target } from "@/components/icons";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/submissions", label: "Review", icon: Inbox },
  { href: "/admin/startups", label: "Startups", icon: Rocket },
  { href: "/admin/quests", label: "Quests", icon: Target },
  { href: "/admin/collab", label: "Collab", icon: Handshake },
  ...["users","reports","payments","analytics","audit-log"].map(section=>({href:`/admin/${section}`,label:section.replace('-',' '),icon:Settings})),
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-[#27272A] bg-[#121215] pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="flex items-stretch gap-1 overflow-x-auto px-1 pt-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href} className="w-16 shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-0.5 text-[10px] font-medium leading-none",
                  active ? "text-[#FACC15]" : "text-[#A1A1AA] hover:text-[#F4F4F5]",
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

