"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, LogOut, Plus } from "lucide-react";

import { useAuth } from "@/lib/firebase/auth-context";
import { Button } from "@/components/ui/button";

/** Sign-out and primary account actions for the profile page. */
export function AccountActions() {
  const { signOutUser } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOutUser();
      router.push("/");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        asChild
        variant="outline"
        size="sm"
        className="rounded-[10px] border-[#26282F] bg-[#0E0F13] text-[#F5F1E8]"
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
