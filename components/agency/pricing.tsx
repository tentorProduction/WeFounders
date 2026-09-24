"use client";

import React from "react";
import { Check, Sparkles, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PRICING_TIERS = [
  {
    name: "Starter Package",
    price: "NPR 15,000",
    subtitle: "Ideal for small local shops, restaurants & freelancers getting online for the first time.",
    popular: false,
    delivery: "1 Week Delivery",
    features: [
      "5 Custom Designed Pages",
      "100% Mobile & Tablet Responsive",
      "WhatsApp & Direct Call Buttons",
      "Google Maps Location Embed",
      "Basic Contact Form",
      "Domain & Hosting Setup Assistance",
    ],
  },
  {
    name: "Business Package",
    price: "NPR 35,000",
    subtitle: "Most Popular — for established clinics, boutiques, agencies & growing businesses.",
    popular: true,
    delivery: "2–3 Weeks Delivery",
    features: [
      "Everything in Starter Package",
      "Up to 10 Custom Pages",
      "Custom UI/UX & Brand Colors",
      "Google SEO Setup & Indexing",
      "Interactive Photo Gallery / Menu",
      "Social Media Feed Integration",
      "1 Month Free Ongoing Support",
      "CMS Training to Update Content",
    ],
  },
  {
    name: "E-commerce Package",
    price: "NPR 80,000+",
    subtitle: "Complete online store for retailers selling products with eSewa & Khalti checkout.",
    popular: false,
    delivery: "3–4 Weeks Delivery",
    features: [
      "Everything in Business Package",
      "Product Catalog & Shopping Cart",
      "eSewa & Khalti Payment Ready",
      "Order Management Dashboard",
      "Customer PDF Invoicing",
      "Automated Order Notifications",
      "3 Months Free Technical Support",
    ],
  },
];

export function AgencyPricing() {
  const getWhatsAppLink = (tierName: string, price: string) => {
    return `https://wa.me/9779800000000?text=${encodeURIComponent(
      `Hello WeFounders! I am interested in the ${tierName} (${price}). Please tell me how to get started.`
    )}`;
  };

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-card border-y border-border">
      <div className="site-container space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge variant="outline" className="font-mono text-tiny">
            Transparent NPR Pricing
          </Badge>
          <h2 className="text-display font-bold tracking-tight text-foreground">
            Clear Packages, Zero Hidden Fees
          </h2>
          <p className="text-body text-muted-foreground">
            High quality website design at honest rates tailored for small businesses in Nepal.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-3 items-stretch">
          {PRICING_TIERS.map((tier, idx) => (
            <div
              key={idx}
              className={`godly-card deck-card p-6 sm:p-8 flex flex-col justify-between space-y-6 relative ${
                tier.popular
                  ? "border-2 border-purple-600 dark:border-purple-500 shadow-apple-lg godly-bg-glow"
                  : "border-border"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-tiny px-3 py-1 shadow-sm">
                    <Sparkles className="h-3 w-3 mr-1" /> Most Popular Choice
                  </Badge>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-tiny font-mono font-bold text-muted-foreground uppercase">
                    {tier.delivery}
                  </span>
                  <h3 className="text-subheading font-bold text-foreground">
                    {tier.name}
                  </h3>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-display font-black text-foreground font-mono">
                    {tier.price}
                  </span>
                  <span className="text-caption text-muted-foreground">starting rate</span>
                </div>

                <p className="text-caption text-muted-foreground leading-relaxed">
                  {tier.subtitle}
                </p>

                <div className="pt-4 border-t border-border space-y-2.5">
                  <p className="text-tiny font-mono font-bold uppercase text-foreground">Package Features:</p>
                  <ul className="space-y-2 text-caption">
                    {tier.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-foreground">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  asChild
                  className={`w-full py-6 font-bold rounded-xl text-caption ${
                    tier.popular
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-apple-md"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  <a
                    href={getWhatsAppLink(tier.name, tier.price)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageSquare className="h-4 w-4 mr-2 fill-current" />
                    <span>Get Started with {tier.name.split(" ")[0]}</span>
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Quote Escape Hatch */}
        <div className="rounded-2xl border border-border bg-secondary/50 p-6 text-center space-y-2 max-w-xl mx-auto">
          <p className="text-body font-bold text-foreground">Need a custom web application or specific feature?</p>
          <p className="text-caption text-muted-foreground">
            We build custom platforms, booking engines, and web apps. Chat with us on WhatsApp — most projects get a quote within 24 hours.
          </p>
        </div>
      </div>
    </section>
  );
}
