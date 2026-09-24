"use client";

import React from "react";
import { Layout, ShoppingBag, Zap, RefreshCw, Search, ShieldCheck, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SERVICES = [
  {
    icon: Layout,
    title: "Business Websites",
    priceAnchor: "Starting at NPR 15,000",
    description: "Custom 5-page website for restaurants, boutiques, clinics, bakeries, and local shops in Nepal.",
    deliverables: [
      "5 Custom Designed Pages",
      "WhatsApp & Direct Call Buttons",
      "Google Maps Location Embed",
      "Mobile & Tablet 100% Responsive",
    ],
  },
  {
    icon: ShoppingBag,
    title: "E-commerce Stores",
    priceAnchor: "Starting at NPR 80,000",
    description: "Sell products online with integrated eSewa, Khalti, and cash-on-delivery checkout.",
    deliverables: [
      "Product Catalog & Cart",
      "eSewa & Khalti QR Payment Ready",
      "Order Management Dashboard",
      "Customer Invoice Generation",
    ],
  },
  {
    icon: Zap,
    title: "Landing Pages & Lead Gen",
    priceAnchor: "Starting at NPR 12,000",
    description: "High-converting single-page websites tailored for marketing campaigns, product launches, or ad traffic.",
    deliverables: [
      "High-Impact Hero Section",
      "Direct Inquiry Form",
      "Social Proof & Testimonials",
      "Fast 2-Second Page Load",
    ],
  },
  {
    icon: RefreshCw,
    title: "Website Redesign",
    priceAnchor: "Starting at NPR 20,000",
    description: "Transform your outdated, slow website into a modern, mobile-friendly sales machine.",
    deliverables: [
      "Modern UI/UX Design System",
      "Speed & Asset Optimization",
      "SEO URL Preservation",
      "Content & Image Cleanup",
    ],
  },
  {
    icon: Search,
    title: "SEO & Speed Optimization",
    priceAnchor: "Starting at NPR 10,000",
    description: "Rank higher on Google searches in Nepal and make your website load instantly on 3G/4G phones.",
    deliverables: [
      "Google Business Profile Setup",
      "Local Nepali Keyword Strategy",
      "Image & Font Compression",
      "PageSpeed 90+ Score Guarantee",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Maintenance & Support",
    priceAnchor: "Starting at NPR 3,000 / mo",
    description: "Hassle-free monthly maintenance so you never worry about hosting, domain renewals, or updates.",
    deliverables: [
      "Regular Content Updates",
      "Domain & Hosting Management",
      "Security & Backup Checks",
      "Priority WhatsApp Support",
    ],
  },
];

export function AgencyServices() {
  return (
    <section id="services" className="py-16 sm:py-24 bg-background">
      <div className="site-container space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge variant="outline" className="font-mono text-tiny">
            Our Core Services
          </Badge>
          <h2 className="text-display font-bold tracking-tight text-foreground">
            Web Solutions Built for Nepali Businesses
          </h2>
          <p className="text-body text-muted-foreground">
            We handle everything — design, coding, domain, hosting, and mobile optimization — so you can focus on growing your business.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, idx) => {
            const Icon = service.icon;
            return (
              <div
                key={idx}
                className="godly-card deck-card p-6 flex flex-col justify-between space-y-4 hover:border-primary/50 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="font-mono text-tiny font-bold text-accent">
                      {service.priceAnchor}
                    </span>
                  </div>

                  <h3 className="text-subheading font-bold text-foreground">
                    {service.title}
                  </h3>

                  <p className="text-caption text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-border space-y-2">
                  <p className="text-tiny font-mono font-bold uppercase text-foreground">Included Deliverables:</p>
                  <ul className="space-y-1.5 text-caption">
                    {service.deliverables.map((item, dIdx) => (
                      <li key={dIdx} className="flex items-center gap-2 text-muted-foreground">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
