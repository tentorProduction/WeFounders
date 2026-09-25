"use client";

import Link from "next/link";
import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen, Rocket } from "lucide-react";
import { AdminSidebarNav } from "@/components/admin/sidebar-nav";

export function AdminSidebarFrame({ pendingCount }: { pendingCount: number }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[#27272A] bg-[#0A0A0C] transition-[width] duration-200 md:flex ${collapsed ? "w-[76px]" : "w-64"}`}>
      <div className={`flex min-h-[72px] items-center border-b border-[#27272A] ${collapsed ? "flex-col justify-center gap-2 p-2" : "justify-between gap-2 px-4"}`}>
        <Link href="/admin" title="Admin overview" className="flex min-w-0 items-center gap-3 rounded-md">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FACC15] text-[#0A0A0C]">
            <Rocket aria-hidden className="h-[18px] w-[18px]" />
          </span>
          {!collapsed && <span className="truncate text-base font-semibold tracking-tight text-[#F4F4F5]">Admin</span>}
        </Link>
        <button type="button" aria-label={collapsed ? "Expand admin sidebar" : "Collapse admin sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setCollapsed((value) => !value)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#A1A1AA] hover:bg-[#18181B] hover:text-[#F4F4F5]">
          {collapsed ? <PanelLeftOpen aria-hidden className="h-4 w-4" /> : <PanelLeftClose aria-hidden className="h-4 w-4" />}
        </button>
      </div>
      <AdminSidebarNav pendingCount={pendingCount} collapsed={collapsed} />
    </aside>
  );
}
