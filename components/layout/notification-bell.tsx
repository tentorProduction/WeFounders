"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Bell } from "@/components/icons";
import { cn } from "@/lib/utils";

export function NotificationBell({ className }: { className?: string }) {
  const { isSignedIn, isLoaded } = useUser();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!isSignedIn) {
      setUnreadCount(0);
      return;
    }

    const controller = new AbortController();
    fetch("/api/account", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.unreadNotifications === "number") {
          setUnreadCount(data.unreadNotifications);
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [isSignedIn]);

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <Link
      href="/notifications"
      aria-label={
        unreadCount > 0
          ? `${unreadCount} unread notifications`
          : "View notifications"
      }
      className={cn(
        "relative flex items-center justify-center rounded-[10px] border border-[#DADDE1] bg-[#F2F3F5] text-[#17181B] transition-colors hover:border-[#17181B] hover:text-[#17181B]",
        className
      )}
    >
      <Bell className="h-4 w-4" weight={unreadCount > 0 ? "fill" : "bold"} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF4B3E] px-1 font-mono text-[9px] font-bold text-white shadow-xs">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
