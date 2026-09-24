"use client";

import React from "react";
import { MessageCircle, Phone, ArrowUpRight } from "lucide-react";

export function FloatingContact() {
  const whatsappNumber = "9779800000000"; // Real Nepali format
  const phoneNumber = "+977 9800000000";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hello WeFounders! I would like to get a free website consultation and quote for my business."
  )}`;

  return (
    <>
      {/* Desktop Floating WhatsApp Badge (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-50 hidden sm:flex items-center gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3.5 rounded-full border border-emerald-500/30 bg-emerald-600 px-4 py-3 text-white font-medium shadow-apple-lg hover:bg-emerald-500 hover:scale-105 transition-all duration-200"
        >
          <div className="relative flex h-3 w-3 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </div>
          <MessageCircle className="h-5 w-5 fill-current" />
          <div className="flex flex-col text-left text-xs leading-tight">
            <span className="font-bold">Chat on WhatsApp</span>
            <span className="text-[10px] opacity-90">Free Consultation &amp; Quote</span>
          </div>
          <ArrowUpRight className="h-4 w-4 opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      </div>

      {/* Mobile Sticky Bottom Action Bar (Fixed across mobile screens) */}
      <div className="fixed bottom-0 inset-x-0 z-50 flex items-center gap-2 border-t border-border/80 bg-background/95 p-3 backdrop-blur-lg sm:hidden shadow-apple-lg">
        <a
          href={`tel:${phoneNumber.replace(/\s+/g, "")}`}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-border bg-secondary py-3 text-caption font-bold text-foreground press-scale"
        >
          <Phone className="h-4 w-4 text-primary" />
          <span>Call Us</span>
        </a>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-caption font-bold text-white shadow-apple-sm press-scale hover:bg-emerald-500"
        >
          <MessageCircle className="h-4 w-4 fill-current" />
          <span>WhatsApp</span>
        </a>
      </div>
    </>
  );
}
