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

export function AdminSidebarNav({ pendingCount, collapsed }: { pendingCount: number; collapsed: boolean }) {
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
            title={collapsed ? label : undefined}
            className={cn(
              "flex min-h-11 items-center justify-between rounded-lg text-sm font-medium transition-colors",
              collapsed ? "justify-center px-0" : "px-3",
              active ? "bg-[#2A2208] text-[#FACC15]" : "text-[#A1A1AA] hover:bg-[#121215] hover:text-[#F4F4F5]",
            )}
          >
            <span className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}><Icon aria-hidden className="h-4 w-4 shrink-0" />{!collapsed && label}</span>
            {!collapsed && href === "/admin/submissions" && pendingCount > 0 && (
              <Badge variant="outline" className="min-w-5 border-[#FACC15]/30 bg-[#2A2208] px-1.5 text-center text-[#FACC15]">
                {pendingCount}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
