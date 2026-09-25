import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { verifyAdmin } from "@/lib/auth/admin";
import { KathmanduClock } from "@/components/admin/kathmandu-clock";

export async function AdminHeader() {
  const user = await verifyAdmin();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-[#27272A] bg-[#121215] px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">Kathmandu Batch Clock</span>
          <KathmanduClock />
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-3 sm:gap-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="h-8 w-8 rounded-full bg-[#27272A] overflow-hidden flex items-center justify-center">
            {user.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.picture} alt="Admin avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-[#FACC15] font-semibold text-xs">{user.email?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <span className="hidden max-w-44 truncate text-sm font-medium text-[#F4F4F5] sm:block">{user.email}</span>
        </div>
        
        <Link 
          href="/" 
          className="flex min-h-11 shrink-0 items-center gap-2 rounded-md px-2 text-sm font-medium text-[#A1A1AA] transition-colors hover:text-[#EAB308]"
        >
          <ArrowUpRight className="h-4 w-4" />
          <span className="hidden sm:block">Public site</span>
        </Link>
      </div>
    </header>
  );
}
