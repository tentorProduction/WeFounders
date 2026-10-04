"use client";

import { useState } from "react";
import { ShareNetwork, Check } from "@phosphor-icons/react";

export function ShareButton({
  title,
  url,
  className = "",
}: {
  title: string;
  url?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#DADDE1] bg-white text-xs font-semibold text-[#17181B] hover:border-[#17181B] transition-colors ${className}`}
      title="Share link"
    >
      {copied ? (
        <>
          <Check size={14} weight="bold" className="text-[#059669]" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <ShareNetwork size={14} weight="bold" />
          <span>Share</span>
        </>
      )}
    </button>
  );
}
