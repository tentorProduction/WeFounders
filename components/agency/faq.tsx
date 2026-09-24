"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const FAQS = [
  {
    q: "How much does a website cost in Nepal?",
    a: "Our website packages start at NPR 15,000 for a Starter 5-page business site, NPR 35,000 for our most popular Business Package with custom design & SEO, and NPR 80,000+ for complete e-commerce stores. All prices are transparent with zero hidden fees.",
  },
  {
    q: "How long does it take from start to launch?",
    a: "Most business websites are launched in 2 to 3 weeks. Rapid starter sites can be delivered in 1 week once we receive your initial business information.",
  },
  {
    q: "I don't have text or photos prepared — can you help?",
    a: "Absolutely! You don't need to worry about preparing technical documents. We help draft clear, professional copy for your business, organize your menu/services, and select high-resolution imagery.",
  },
  {
    q: "Will my website work fast on mobile phones and 3G/4G networks?",
    a: "Yes! Over 80% of internet visitors in Nepal browse on mobile phones. We optimize every image, font, and script to ensure your site loads in under 2 seconds even on modest mobile connections.",
  },
  {
    q: "Do you handle domain registration (.com / .com.np) and hosting?",
    a: "Yes. We guide you through getting a free .com.np domain or registering a .com domain, and set up fast, reliable cloud hosting so your site is always online.",
  },
  {
    q: "Can I accept eSewa and Khalti payments on my site?",
    a: "Yes! We integrate eSewa and Khalti payment gateways and QR checkout so your Nepali customers can pay instantly from their phones.",
  },
  {
    q: "What happens if I need changes after launch?",
    a: "Every package includes free technical support after launch (1 to 3 months depending on package). We also provide a quick video training so you or your staff can update text, photos, and prices anytime.",
  },
];

export function AgencyFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 sm:py-24 bg-card border-y border-border">
      <div className="site-container max-w-3xl space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <Badge variant="outline" className="font-mono text-tiny">
            Got Questions?
          </Badge>
          <h2 className="text-display font-bold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-body text-muted-foreground">
            Everything you need to know about getting a website for your business.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="godly-card rounded-2xl border border-border bg-background transition-all overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 flex items-center justify-between text-left font-bold text-subheading text-foreground gap-4"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-0 text-body text-muted-foreground leading-relaxed border-t border-border/50 animate-fade-in">
                    <p className="pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
