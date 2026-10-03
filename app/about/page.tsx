import { getSiteOrigin } from "@/lib/site-url";
import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck, Rocket, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const baseUrl = getSiteOrigin();

/** The five criteria every submission is reviewed against. */
const CURATION_CRITERIA = [
  {
    title: "Working Live URL or Demo",
    body: "No placeholder URLs or dead domains (e.g. example.com). Must have an active website, app store link, or interactive pitch.",
  },
  {
    title: "Clear One-Line Tagline",
    body: "A concise description under 80 characters explaining what problem your product solves and who it is built for.",
  },
  {
    title: "High-Resolution Logo & Screenshot",
    body: "Crisp branding assets so launch cards render beautifully on desktop and mobile viewports.",
  },
  {
    title: "Verified Founder Contact",
    body: "Verified founder email and social profile (X or LinkedIn) for authentic community interactions.",
  },
  {
    title: "Clear Target Market & Positioning",
    body: "Explicit indication of Global vs Regional focus, target user personas, and active product onboarding rails.",
  },
];

export const metadata: Metadata = {
  title: "About & Manifesto — WeFounders",
  description:
    "Learn about WeFounders, our curation acceptance bar, submission guidelines, and how we help founders reach early beta users worldwide.",
  alternates: { canonical: new URL("/about", baseUrl) },
};

export default function AboutPage() {
  return (
    <div className="site-container py-8 max-w-4xl space-y-12">
      {/* Hero */}
      <div className="space-y-4 text-center md:text-left">
        <Badge variant="outline" className="font-mono text-tiny border-accent/40 text-accent">
          About &amp; Manifesto
        </Badge>
        <h1 className="text-display font-black tracking-tight text-foreground">
          Global Launchpad for World-Class Startups
        </h1>
        <p className="text-body text-muted-foreground max-w-2xl leading-relaxed">
          WeFounders is where founders globally launch their products, get their real beta users, collect feedback, and build verified traction.
        </p>
      </div>

      {/* Manifesto Cards */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="godly-card deck-card p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Rocket className="h-5 w-5" />
          </div>
          <h3 className="text-subheading font-bold text-foreground">Fast &amp; Transparent Launch</h3>
          <p className="text-caption text-muted-foreground leading-relaxed">
            Legacy directories charge $39–$129 and queue founders for weeks. WeFounders provides fast, transparent review and queue positioning so your product launches when you are ready.
          </p>
        </div>

        <div className="godly-card deck-card p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-subheading font-bold text-foreground">Verified Proof of Work</h3>
          <p className="text-caption text-muted-foreground leading-relaxed">
            Instead of self-reported bio revenue numbers, WeFounders measures verified user upvotes, double opt-in waitlist entries, and completed testing reports.
          </p>
        </div>
      </div>

      {/* Curation standard: the 5 review criteria, as reusable cards */}
      <div id="curation" className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-apple-md godly-bg-glow">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold">
              Quality Benchmark
            </Badge>
            <span className="text-caption text-muted-foreground font-mono">Curation Standard</span>
          </div>
          <h2 className="text-display font-bold text-foreground">What Gets Featured on WeFounders</h2>
          <p className="text-body text-muted-foreground">
            To protect our community of early adopters, every submission is reviewed against our 5 core quality criteria before appearing on today&apos;s feed:
          </p>
        </div>

        <div id="guidelines" className="grid gap-3 sm:grid-cols-2">
          {CURATION_CRITERIA.map((criterion, index) => (
            <div
              key={criterion.title}
              className="flex items-start gap-3 rounded-[16px] border border-border/70 bg-background/60 p-4"
            >
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
              <div className="space-y-1">
                <h4 className="text-caption font-bold text-foreground">
                  <span className="mr-1.5 font-mono text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {criterion.title}
                </h4>
                <p className="text-tiny leading-relaxed text-muted-foreground">
                  {criterion.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4">
          <p className="text-caption text-muted-foreground">
            Ready to show your product to the global builder community?
          </p>
          <Button asChild className="bg-primary text-primary-foreground font-semibold">
            <Link href="/submit">
              Submit Your Startup <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
