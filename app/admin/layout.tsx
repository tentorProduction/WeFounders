import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { AdminMobileNav } from "@/components/admin/mobile-nav";

export const metadata = {
  title: "Admin Dashboard - WeFounders",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0A0A0C] pb-[calc(60px+env(safe-area-inset-bottom))] text-[#F4F4F5] md:pb-0">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
      <AdminMobileNav />
    </div>
  );
}
