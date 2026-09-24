import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck, Rocket, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "About & Manifesto — WeFounders",
  description:
    "Learn about WeFounders.dev, our 21% curation acceptance bar, submission guidelines, and how we help Nepali founders reach their first 1,000 beta users.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 space-y-12">
      {/* Hero */}
      <div className="space-y-4 text-center md:text-left">
        <Badge variant="outline" className="font-mono text-tiny border-accent/40 text-accent">
          About &amp; Manifesto
        </Badge>
        <h1 className="text-display font-black tracking-tight text-foreground">
          Nepal&apos;s Launchpad for World-Class Startups
        </h1>
        <p className="text-body text-muted-foreground max-w-2xl leading-relaxed">
          WeFounders is where founders in Nepal and globally launch their products, get their first 1,000 real beta users, collect feedback, and earn karma bounties.
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
            Legacy directories charge \$39–\$129 and queue founders for weeks. WeFounders provides fast, transparent review and queue positioning so your product launches when you are ready.
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

      {/* 21% Curation Bar Section */}
      <div id="curation" className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-apple-md godly-bg-glow">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold">
              Quality Benchmark
            </Badge>
            <span className="text-caption text-muted-foreground font-mono">21% Curation Standard</span>
          </div>
          <h2 className="text-display font-bold text-foreground">What Gets Featured on WeFounders</h2>
          <p className="text-body text-muted-foreground">
            To protect our community of 1,850+ daily builders, every submission is reviewed against our 5 core quality criteria before appearing on today&apos;s feed:
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-caption font-bold text-foreground">1. Working Live URL or Demo</h4>
              <p className="text-tiny text-muted-foreground">
                No placeholder URLs or dead domains (e.g. example.com). Must have an active website, app store link, or interactive pitch.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-caption font-bold text-foreground">2. Clear One-Line Tagline</h4>
              <p className="text-tiny text-muted-foreground">
                A concise description under 80 characters explaining what problem your product solves and who it is built for.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-caption font-bold text-foreground">3. High-Resolution Logo &amp; Screenshot</h4>
              <p className="text-tiny text-muted-foreground">
                Crisp branding assets so launch cards render beautifully on desktop and mobile viewports.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-caption font-bold text-foreground">4. Verified Founder Contact</h4>
              <p className="text-tiny text-muted-foreground">
                Verified founder email and social profile (X or LinkedIn) for authentic community interactions.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-caption font-bold text-foreground">5. Clear Target Market &amp; Local Integration</h4>
              <p className="text-tiny text-muted-foreground">
                Explicit indication of Made for Nepal vs Built for World, along with any local payment rails (eSewa, Khalti, Fonepay).
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4">
          <p className="text-caption text-muted-foreground">
            Ready to show your product to Nepal&apos;s builder community?
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
