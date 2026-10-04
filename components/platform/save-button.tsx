"use client";

import { useState, useTransition } from "react";
import { toggleSaveAction } from "@/actions/saved";
import { BookmarkSimple } from "@phosphor-icons/react";

interface SaveButtonProps {
  itemType: "startup" | "quest" | "collab";
  itemId: string;
  initialSaved?: boolean;
  className?: string;
  showLabel?: boolean;
}

export function SaveButton({
  itemType,
  itemId,
  initialSaved = false,
  className = "",
  showLabel = false,
}: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleSaveAction(itemType, itemId);
      if (res && res.success) {
        setSaved(Boolean(res.saved));
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      title={saved ? "Saved to your bookmarks" : "Save for later"}
      className={`inline-flex items-center justify-center gap-1.5 p-2 rounded-full border transition-all ${
        saved
          ? "bg-[#FFF5F4] text-[#FF4B3E] border-[#FF4B3E]"
          : "bg-white text-[#666A73] border-[#DADDE1] hover:text-[#17181B] hover:border-[#17181B]"
      } ${className}`}
    >
      <BookmarkSimple size={16} weight={saved ? "fill" : "regular"} />
      {showLabel && <span className="text-xs font-semibold">{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}
