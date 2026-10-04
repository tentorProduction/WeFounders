"use client";

import { Users, ChatCircleDots, RocketLaunch, BookmarkSimple } from "@phosphor-icons/react";
import { useState, useTransition } from "react";
import { toggleSaveAction } from "@/actions/saved";

interface StartupStatPillsProps {
  startupId: string;
  waitlistCount: number;
  commentsCount: number;
  launchedText: string;
  initialSaved?: boolean;
  className?: string;
}

export function StartupStatPills({
  startupId,
  waitlistCount,
  commentsCount,
  launchedText,
  initialSaved = false,
  className = "",
}: StartupStatPillsProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  const handleToggleWishlist = () => {
    startTransition(async () => {
      const res = await toggleSaveAction("startup", startupId);
      if (res && res.success) {
        setSaved(Boolean(res.saved));
      }
    });
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* Waitlist Pill with Hover Tooltip */}
      <div className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F8F9FA] border border-[#DADDE1] text-xs font-semibold text-[#17181B] hover:border-[#17181B] transition-colors cursor-default">
        <Users size={14} className="text-[#FF4B3E]" weight="bold" />
        <span className="font-mono">{waitlistCount}</span>
        <span className="text-[#666A73] font-normal text-[11px]">waitlist</span>

        {/* Hover Tooltip */}
        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block whitespace-nowrap rounded-lg bg-[#17181B] px-2.5 py-1 text-[11px] font-medium text-white shadow-lg z-20">
          {waitlistCount} {waitlistCount === 1 ? "builder" : "builders"} on waitlist
        </div>
      </div>

      {/* Comments Pill with Hover Tooltip */}
      <a
        href="#discussion"
        className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F8F9FA] border border-[#DADDE1] text-xs font-semibold text-[#17181B] hover:border-[#17181B] transition-colors"
      >
        <ChatCircleDots size={14} className="text-[#059669]" weight="bold" />
        <span className="font-mono">{commentsCount}</span>
        <span className="text-[#666A73] font-normal text-[11px]">comments</span>

        {/* Hover Tooltip */}
        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block whitespace-nowrap rounded-lg bg-[#17181B] px-2.5 py-1 text-[11px] font-medium text-white shadow-lg z-20">
          {commentsCount} community discussions
        </div>
      </a>

      {/* Launched Pill with Hover Tooltip */}
      <div className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F8F9FA] border border-[#DADDE1] text-xs font-medium text-[#666A73] hover:border-[#17181B] transition-colors cursor-default">
        <RocketLaunch size={14} className="text-[#17181B]" weight="bold" />
        <span className="text-[11px]">{launchedText}</span>

        {/* Hover Tooltip */}
        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block whitespace-nowrap rounded-lg bg-[#17181B] px-2.5 py-1 text-[11px] font-medium text-white shadow-lg z-20">
          Publicly launched on WeFounders
        </div>
      </div>

      {/* Wishlist Icon Button with Hover Tooltip */}
      <button
        type="button"
        onClick={handleToggleWishlist}
        disabled={isPending}
        className={`group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
          saved
            ? "bg-[#FFF5F4] text-[#FF4B3E] border-[#FF4B3E]"
            : "bg-[#F8F9FA] text-[#666A73] border-[#DADDE1] hover:text-[#17181B] hover:border-[#17181B]"
        }`}
        title={saved ? "Saved in your Wishlist" : "Add to Wishlist"}
      >
        <BookmarkSimple size={14} weight={saved ? "fill" : "bold"} />
        <span className="text-[11px]">{saved ? "Wishlisted" : "Wishlist"}</span>

        {/* Hover Tooltip */}
        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block whitespace-nowrap rounded-lg bg-[#17181B] px-2.5 py-1 text-[11px] font-medium text-white shadow-lg z-20">
          {saved ? "Remove from saved wishlist" : "Save product to your wishlist"}
        </div>
      </button>
    </div>
  );
}
