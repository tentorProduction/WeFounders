"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/firebase/auth-context";

export interface UpvoteButtonProps {
  count: number;
  voted: boolean;
  /** A remote sync is in flight (the count is already optimistic). */
  pending?: boolean;
  disabled?: boolean;
  onToggle: () => void;
  size?: "default" | "lg";
  className?: string;
}

/**
 * Interactive upvote pill (DESIGN.md §3.2):
 * ▲ count in a pill; requires auth to register verified vote.
 */
export function UpvoteButton({
  count,
  voted,
  pending = false,
  disabled = false,
  onToggle,
  size = "default",
  className,
}: UpvoteButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [popped, setPopped] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleClick() {
    if (disabled) return;

    if (!user) {
      router.push("/profile");
      return;
    }

    setPopped(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setPopped(false), 300);

    onToggle();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={voted}
      aria-label={voted ? `Remove upvote (${count})` : `Upvote (${count})`}
      title={voted ? "Remove your upvote" : "Upvote this beta"}
      className={cn(
        "inline-flex select-none items-center justify-center gap-1.5 rounded-full border font-semibold tabular-nums transition-all duration-quick active:scale-[0.97]",
        "h-11 min-w-[3.25rem] px-3 sm:h-9 sm:min-w-[3rem]",
        voted
          ? "border-[#DC2626] bg-[#DC2626] text-[#FAFAFA] shadow-sm font-bold"
          : "border-[#E4E4E7] bg-[#FFFFFF] text-[#18181B] hover:border-[#DC2626]/50 hover:text-[#DC2626]",
        popped && "scale-105",
        pending && "opacity-80",
        disabled && "cursor-not-allowed opacity-50",
        size === "lg" && "h-12 min-w-[4.25rem] px-4 text-body sm:h-11",
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className={cn(
          "shrink-0 fill-current transition-transform duration-200",
          size === "lg" ? "h-3.5 w-3.5" : "h-3 w-3",
          popped && "-translate-y-0.5"
        )}
      >
        <path d="M12 3.6 21 20H3l9-16.4Z" />
      </svg>
      {count}
    </button>
  );
}
