"use client";

import React, { useState } from "react";
import { MessageSquare, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const HERO_SHOWCASES = [
  {
    id: "bakery",
    name: "Himalayan Artisan Bakery",
    category: "Food & Dining · Kathmandu",
    tagline: "Online orders up +45% in first month",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1000&auto=format&fit=crop&q=80",
    link: "https://himalayanbakery.example.com",
    metrics: "5-Page Custom Site • eSewa Menu • Launched in 10 Days",
  },
  {
    id: "clinic",
    name: "Biratnagar Dental Care",
    category: "Healthcare & Clinic · Biratnagar",
    tagline: "+120 appointment bookings monthly via WhatsApp",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1000&auto=format&fit=crop&q=80",
    link: "https://biratnagardental.example.com",
    metrics: "Doctor Roster • Direct Booking • Google Maps Embed",
  },
  {
    id: "boutique",
    name: "Poshak Fashion Studio",
    category: "E-commerce & Retail · Lalitpur",
    tagline: "Khalti & eSewa QR checkout integrated",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=80",
    link: "https://poshakfashion.example.com",
    metrics: "Catalog • Mobile First • 3-Week Delivery",
  },
];

export function AgencyHero() {
  const [activeShowcase, setActiveShowcase] = useState(HERO_SHOWCASES[0]);

  const whatsappUrl = `https://wa.me/9779800000000?text=${encodeURIComponent(
    "Hello WeFounders! I saw your website and would like a free quote for my business."
  )}`;

  return (
    <section className="relative pt-8 pb-12 sm:py-16 godly-bg-glow overflow-hidden">
      <div className="site-container grid gap-10 lg:grid-cols-12 items-center">
        {/* Left Column: Headline & Value Prop */}
        <div className="lg:col-span-7 space-y-6 text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3.5 py-1 text-caption font-semibold text-purple-600 dark:text-purple-400">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span>Nepal&apos;s Web Design &amp; Development Agency</span>
          </div>

          {/* Main H1 Headline */}
          <h1 className="text-display font-black tracking-tight text-foreground leading-[1.1] sm:text-display">
            We build <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-500 bg-clip-text text-transparent">affordable websites</span> that bring you customers.
          </h1>

          {/* Subline with Price Anchor */}
          <p className="text-subheading font-medium text-muted-foreground leading-relaxed max-w-xl">
            Professional business websites starting at <strong className="text-foreground font-black">NPR 15,000</strong> — designed, mobile-optimized, and launched in <strong className="text-foreground font-black">2–3 weeks</strong>.
          </p>

          {/* Reassurance pills */}
          <div className="flex flex-wrap items-center gap-4 text-caption text-muted-foreground pt-1">
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>No advance needed to consult</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>1-on-1 Free Strategy Call</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>eSewa &amp; Khalti Integration</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-7 py-6 rounded-2xl shadow-apple-md press-scale text-body"
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="h-5 w-5 mr-2 fill-current" />
                <span>Get a Free Quote on WhatsApp</span>
              </a>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-border hover:bg-secondary font-semibold px-6 py-6 rounded-2xl text-body"
            >
              <a href="#work">
                <span>See Our Work</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>

        {/* Right Column: Interactive Mockup Showcase */}
        <div className="lg:col-span-5">
          <div className="godly-card deck-card p-4 sm:p-5 shadow-apple-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-rose-500" />
                <span className="flex h-3 w-3 rounded-full bg-amber-500" />
                <span className="flex h-3 w-3 rounded-full bg-emerald-500" />
              </div>
              <Badge variant="outline" className="font-mono text-tiny">
                Recent Agency Launch
              </Badge>
            </div>

            {/* Main Showcase Preview */}
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-card group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeShowcase.image}
                alt={activeShowcase.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end text-white">
                <Badge variant="secondary" className="w-fit text-[10px] mb-1 font-bold">
                  {activeShowcase.category}
                </Badge>
                <h3 className="font-bold text-subheading">{activeShowcase.name}</h3>
                <p className="text-caption text-white/80 line-clamp-1">{activeShowcase.tagline}</p>
              </div>
            </div>

            {/* Switcher Pills */}
            <div className="space-y-1.5 pt-1">
              <p className="text-tiny font-mono font-bold uppercase text-muted-foreground">Select Project Preview:</p>
              <div className="grid grid-cols-3 gap-1.5">
                {HERO_SHOWCASES.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => setActiveShowcase(sc)}
                    className={`rounded-xl px-2.5 py-2 text-tiny text-left transition-all ${
                      activeShowcase.id === sc.id
                        ? "bg-primary text-primary-foreground font-bold shadow-apple-xs"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="block truncate font-semibold">{sc.name.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
