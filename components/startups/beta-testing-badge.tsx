"use client";

import { useState } from "react";
import { Flask, X, ArrowUpRight, CheckCircle } from "@phosphor-icons/react";

interface BetaTestingBadgeProps {
  betaNotes?: string | null;
  hasQuests?: boolean;
  startupName: string;
  websiteUrl?: string;
  className?: string;
}

export function BetaTestingBadge({
  betaNotes,
  hasQuests = false,
  startupName,
  websiteUrl,
  className = "",
}: BetaTestingBadgeProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Interactive Beta Badge */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669] border border-[#059669]/30 hover:bg-[#059669] hover:text-white transition-all shadow-xs cursor-pointer active:scale-95"
        title="Click to view beta testing directives"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#059669] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#059669] group-hover:bg-white"></span>
        </span>
        <Flask size={14} weight="fill" />
        <span>Beta Testing Active</span>
      </button>

      {/* Flyout Popover on Hover / Click */}
      {open && (
        <>
          {/* Backdrop on mobile for easy dismissal */}
          <div
            className="fixed inset-0 z-30 sm:hidden"
            onClick={() => setOpen(false)}
          />

          <div
            onMouseLeave={() => setOpen(false)}
            className="absolute left-0 top-full mt-2 z-40 w-80 sm:w-96 rounded-2xl border border-[#DADDE1] bg-white p-5 shadow-2xl space-y-3.5 animate-scale-up text-left"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#F0F2F5]">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
                  <Flask size={18} weight="fill" />
                </div>
                <div>
                  <h4 className="font-archivo text-xs font-bold text-[#17181B] uppercase tracking-wider">
                    Beta Testing Program
                  </h4>
                  <p className="text-[11px] text-[#059669] font-medium">Open to Community Testers</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[#666A73] hover:text-[#17181B] p-1 rounded-md"
                aria-label="Close beta details"
              >
                <X size={14} weight="bold" />
              </button>
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-bold text-[#17181B]">Testing Directives:</h5>
              <p className="text-xs text-[#4B5059] leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line">
                {betaNotes ||
                  `${startupName} is currently conducting open beta testing. Try the product, submit feedback, and report any edge case issues.`}
              </p>
            </div>

            {hasQuests && (
              <div className="p-2.5 rounded-xl bg-[#FFF5F4] border border-[#FF4B3E]/20 text-[11px] text-[#FF4B3E] font-medium flex items-center justify-between">
                <span>Earn Karma on Active Quests</span>
                <a href="#quests" onClick={() => setOpen(false)} className="font-bold underline">
                  View Quests ↓
                </a>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[#F0F2F5] text-xs">
              <span className="text-[11px] text-[#A0A4AB] flex items-center gap-1">
                <CheckCircle size={13} weight="fill" className="text-[#059669]" />
                Public Beta
              </span>

              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ink-button inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                >
                  <span>Launch Beta App</span>
                  <ArrowUpRight size={12} weight="bold" />
                </a>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
