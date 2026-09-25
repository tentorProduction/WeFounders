"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MobileNav } from "@/components/layout/mobile-nav";

export function SiteChrome({ children, header, footer }: { children: ReactNode; header: ReactNode; footer: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  return (
    <div className={`flex min-h-screen flex-col ${isAdmin ? "" : "pb-[calc(76px+env(safe-area-inset-bottom))] md:pb-0"}`}>
      {!isAdmin && header}
      <main className="flex-1">{children}</main>
      {!isAdmin && footer}
      {!isAdmin && <MobileNav />}
    </div>
  );
}
