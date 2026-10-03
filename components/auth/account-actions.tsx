"use client";

import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import { Loader2, LogOut, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

/** Sign-out and primary account actions for the profile page. */
export function AccountActions() {
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = () => {
    setIsSigningOut(true);
    // Clerk clears its own session cookie and navigates; the server reads
    // that cookie, so there is nothing left to clean up here.
    void signOut({ redirectUrl: "/" });
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        asChild
        variant="outline"
        size="sm"
        className="rounded-[10px] border-[#DADDE1] bg-[#F2F3F5] text-[#17181B]"
      >
        <Link href="/submit">
          <Plus className="mr-1.5 h-4 w-4" /> Submit Beta
        </Link>
      </Button>

      <Button
        variant="destructive"
        size="sm"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="gap-1.5 rounded-[10px]"
      >
        {isSigningOut ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
        Sign Out
      </Button>
    </div>
  );
}