"use client";

import Link from "next/link";
import { useClerk, useUser } from "@clerk/nextjs";
import { LogOut, User as UserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SignInButton } from "@/components/auth/sign-in-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Header identity control. Signed out it offers Google sign-in; signed in it
 * shows the account menu. Identity and sign-out both come from Clerk, so the
 * menu cannot drift from the session the server sees.
 */
export function UserButton() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded) {
    return <div className="h-9 w-24 animate-pulse rounded-full bg-secondary" />;
  }

  if (!isSignedIn || !user) {
    return (
      <SignInButton
        size="sm"
        variant="outline"
        className="border-border bg-card text-foreground hover:bg-secondary"
      />
    );
  }

  const email = user.primaryEmailAddress?.emailAddress ?? "";
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.username ||
    email.split("@")[0] ||
    "You";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-border bg-background hover:bg-secondary px-2.5 shadow-apple-xs"
        >
          {user.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.imageUrl}
              alt=""
              className="h-6 w-6 rounded-full border border-border object-cover"
            />
          ) : (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-tiny font-bold text-background">
              {displayName[0]?.toUpperCase()}
            </span>
          )}
          <span className="hidden max-w-[120px] truncate text-caption font-medium sm:inline">
            {displayName}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-apple-md">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-body font-medium leading-none text-foreground">
              {displayName}
            </p>
            <p className="truncate text-caption leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-border" />

        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/profile" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            My Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border" />

        <DropdownMenuItem
          onSelect={() => void signOut({ redirectUrl: "/" })}
          className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}