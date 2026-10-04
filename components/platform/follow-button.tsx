"use client";

import { useState, useTransition } from "react";
import { toggleFollowAction } from "@/actions/follows";
import { UserPlus, Check } from "@phosphor-icons/react";

interface FollowButtonProps {
  targetType: "startup" | "user";
  targetId: string;
  initialFollowing?: boolean;
  className?: string;
}

export function FollowButton({
  targetType,
  targetId,
  initialFollowing = false,
  className = "",
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleFollowAction(targetType, targetId);
      if (res && res.success) {
        setFollowing(Boolean(res.following));
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
        following
          ? "bg-[#F0F2F5] text-[#17181B] border border-[#DADDE1] hover:bg-[#E4E7EB]"
          : "bg-white text-[#17181B] border border-[#DADDE1] hover:border-[#17181B]"
      } ${className}`}
    >
      {following ? (
        <>
          <Check size={14} weight="bold" className="text-[#059669]" />
          <span>Following</span>
        </>
      ) : (
        <>
          <UserPlus size={14} weight="bold" />
          <span>Follow</span>
        </>
      )}
    </button>
  );
}
