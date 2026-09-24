"use client";

import React from "react";
import { MessageSquare, Layout, Code2, Rocket, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Discover & Consult",
    duration: "Day 1",
    icon: MessageSquare,
    description: "Free 15-minute call or WhatsApp consultation. We understand your business goals, target audience, and content.",
    highlights: ["0 advance needed to talk", "Custom package quote", "Content checklist"],
  },
  {
    step: "02",
    title: "Design Homepage Mockup",
    duration: "3–5 Days",
    icon: Layout,
    description: "We craft a custom design mockup tailored for your brand color, typography, and local Nepali market appeal.",
    highlights: ["Mobile & Desktop design", "100% revision policy", "Client approval"],
  },
  {
    step: "03",
    title: "Build & Payment Setup",
    duration: "1–2 Weeks",
    icon: Code2,
    description: "We code your site using Next.js & Tailwind CSS, add WhatsApp order buttons, and integrate eSewa / Khalti QR payments.",
    highlights: ["Fast 2-second load times", "eSewa & Khalti ready", "Google Maps location"],
  },
  {
    step: "04",
    title: "Launch & Support",
    duration: "Day 14–21",
    icon: Rocket,
    description: "We connect your custom domain (.com or .com.np), configure hosting, train you to update text, and provide 1 month free support.",
    highlights: ["Custom domain setup", "Google SEO submission", "30-day free support"],
  },
];

export function AgencyProcess() {
  return (
    <section id="process" className="py-16 sm:py-24 bg-background">
      <div className="site-container space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge variant="outline" className="font-mono text-tiny">
            Simple &amp; Transparent
          </Badge>
          <h2 className="text-display font-bold tracking-tight text-foreground">
            Our 4-Step Website Process
          </h2>
          <p className="text-body text-muted-foreground">
            From first conversation to live website in <strong className="text-foreground">2 to 3 weeks</strong> — zero stress, zero technical jargon.
          </p>
        </div>

        {/* Process Timeline Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="godly-card deck-card p-6 flex flex-col justify-between space-y-4 relative group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-display font-black text-primary/30 group-hover:text-accent transition-colors">
                      {step.step}
                    </span>
                    <Badge variant="secondary" className="gap-1 font-mono text-tiny">
                      <Clock className="h-3 w-3" /> {step.duration}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-subheading font-bold text-foreground">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-caption text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-border space-y-1 text-tiny text-foreground font-medium">
                  {step.highlights.map((h, hIdx) => (
                    <div key={hIdx} className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
