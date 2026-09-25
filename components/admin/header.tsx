import Link from "next/link";
import { LogOut } from "lucide-react";
import { verifyAdmin } from "@/lib/auth/admin";

export async function AdminHeader() {
  const user = await verifyAdmin();

  const batchTime = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kathmandu",
  }).format(new Date());

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#E4E4E7] bg-[#FFFFFF] px-6">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider">Kathmandu Time</span>
          <span className="text-sm font-semibold text-[#18181B]">{batchTime} NPT</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[#E4E4E7] overflow-hidden flex items-center justify-center">
            {user.user_metadata?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.user_metadata.avatar_url as string} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-[#18181B] font-semibold text-xs">{user.email?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <span className="text-sm font-medium text-[#18181B] hidden sm:block">{user.email}</span>
        </div>
        
        <Link 
          href="/" 
          className="flex items-center gap-2 text-sm font-medium text-[#71717A] hover:text-[#DC2626] transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:block">Exit to Public Site</span>
        </Link>
      </div>
    </header>
  );
}
