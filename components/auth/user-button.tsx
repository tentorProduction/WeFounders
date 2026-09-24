"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User as UserIcon, LogOut, AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserButton() {
  const { user, loading, authError, signInWithGoogle, signOutUser, signInDemoUser, clearAuthError } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="h-9 w-24 animate-pulse rounded-full bg-secondary" />
    );
  }

  if (!user) {
    return (
      <div className="relative flex items-center gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={handleSignIn}
          disabled={isSigningIn}
          className="gap-2 border border-foreground/20 font-medium shadow-apple-xs bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
            <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.545,6.477,2.545,12s4.476,10,10,10c5.768,0,9.756-4.056,9.756-9.924c0-0.697-0.075-1.372-0.198-2.037L12.545,10.239z" />
          </svg>
          {isSigningIn ? "Signing in..." : "Google Sign In"}
        </Button>

        {authError && (
          <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-destructive/30 bg-card p-4 shadow-apple-lg text-caption">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 font-bold text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Auth Notice</span>
              </div>
              <button
                onClick={clearAuthError}
                className="text-muted-foreground hover:text-foreground text-tiny"
              >
                ✕
              </button>
            </div>
            <p className="mt-2 text-tiny text-muted-foreground leading-relaxed">
              {authError}
            </p>
            <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-border">
              <button
                onClick={signInDemoUser}
                className="text-tiny font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" /> Quick Demo Mode
              </button>
              <button
                onClick={handleSignIn}
                className="text-tiny font-semibold text-foreground hover:underline"
              >
                Retry Auth
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-border bg-background hover:bg-secondary px-2.5 shadow-apple-xs"
        >
          {user.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photoURL}
              alt={user.displayName || "User"}
              className="h-6 w-6 rounded-full border border-border object-cover"
            />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background text-tiny font-bold">
              {(user.displayName || user.email || "U")[0].toUpperCase()}
            </div>
          )}
          <span className="hidden sm:inline text-caption font-medium max-w-[120px] truncate">
            {user.displayName || user.email?.split("@")[0]}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-apple-md">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-body font-medium leading-none text-foreground">
              {user.displayName || "User"}
            </p>
            <p className="text-caption leading-none text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/profile" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            My Profile &amp; Bounties
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          onClick={signOutUser}
          className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
