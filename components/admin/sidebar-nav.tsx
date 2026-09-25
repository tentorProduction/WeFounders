"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Handshake, Inbox, LayoutDashboard, Rocket, Settings, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/submissions", label: "Submissions", icon: Inbox },
  { href: "/admin/startups", label: "Live Startups", icon: Rocket },
  { href: "/admin/quests", label: "Quests & Bounties", icon: Target },
  { href: "/admin/collab", label: "Collab & Gigs", icon: Handshake },
  { href: "/admin/settings", label: "Platform Settings", icon: Settings },
];

export function AdminSidebarNav({ pendingCount }: { pendingCount: number }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto p-3">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center justify-between rounded-lg px-3 text-sm font-medium transition-colors",
              active ? "bg-[#FEF2F2] text-[#991B1B]" : "text-[#52525B] hover:bg-white hover:text-[#18181B]",
            )}
          >
            <span className="flex items-center gap-3"><Icon aria-hidden className="h-4 w-4" />{label}</span>
            {href === "/admin/submissions" && pendingCount > 0 && (
              <Badge variant="outline" className="min-w-5 border-[#DC2626]/30 bg-[#FEF2F2] px-1.5 text-center text-[#991B1B]">
                {pendingCount}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
