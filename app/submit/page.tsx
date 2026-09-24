"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Sparkles, Globe, Rocket, ShieldCheck, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/firebase/auth-context";

const CATEGORIES = [
  "Fintech",
  "AI / ML",
  "DevTools",
  "Agritech",
  "Climate & CleanTech",
  "Legaltech",
  "Logistics & E-commerce",
  "Consumer & Social",
  "EdTech",
  "Healthcare",
];

const STAGES = [
  { id: "beta", label: "Beta (Testing / Invite Only)" },
  { id: "live", label: "Live Product" },
  { id: "idea", label: "Idea / Prototype" },
  { id: "funded", label: "Seed / Funded" },
];

const TARGET_MARKETS = [
  { id: "nepal", label: "Nepal Focus (Local)" },
  { id: "global", label: "Global Focus (Export)" },
  { id: "both", label: "Dual Focus (Nepal + Global)" },
];

const POPULAR_TAGS = [
  "Next.js",
  "React",
  "AI/ML",
  "Flutter",
  "Firebase",
  "Supabase",
  "eSewa",
  "Khalti",
  "Fonepay",
  "Devanagari UI",
  "Offline First",
  "Python",
];

export default function SubmitPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    description: "",
    category: "Fintech",
    stage: "beta",
    market: "nepal",
    websiteUrl: "",
    demoVideoUrl: "",
    selectedTags: [] as string[],
    founderName: user?.displayName || "",
    founderEmail: user?.email || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter((t) => t !== tag)
        : [...prev.selectedTags, tag],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.tagline) return;

    setIsSubmitting(true);
    // Simulate server submission delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-caption font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Explore
      </Link>

      {submitted ? (
        <div className="rounded-2xl border border-border bg-card p-8 md:p-12 text-center shadow-apple-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <Badge variant="outline" className="mb-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
            Submitted Successfully
          </Badge>
          <h1 className="text-display font-bold text-foreground mb-3">
            {formData.name} is on the Launch Radar!
          </h1>
          <p className="mx-auto max-w-md text-body text-muted-foreground mb-6">
            Thank you for submitting your product. Our team and community review new submissions daily for featured batch spotlights.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/">Return to Feed</Link>
            </Button>
            <Button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  name: "",
                  tagline: "",
                  description: "",
                  category: "Fintech",
                  stage: "beta",
                  market: "nepal",
                  websiteUrl: "",
                  demoVideoUrl: "",
                  selectedTags: [],
                  founderName: user?.displayName || "",
                  founderEmail: user?.email || "",
                });
              }}
            >
              Submit Another Product
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Main Form (8 cols on lg) */}
          <div className="lg:col-span-8">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-primary font-medium text-caption uppercase tracking-wider mb-1">
                <Rocket className="h-4 w-4" />
                Founders Launchpad
              </div>
              <h1 className="text-display font-bold tracking-tight text-foreground">
                Submit Your Beta Product
              </h1>
              <p className="mt-1 text-body text-muted-foreground">
                Showcase your startup to early adopters, beta testers, and investors in Nepal & globally.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Info Section */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-apple-sm space-y-4">
                <h2 className="text-subheading font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  Product Identity
                </h2>

                <div>
                  <label className="block text-caption font-semibold text-foreground mb-1">
                    Startup / Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SajhaPay, HamroAI, YatraLabs"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-caption font-semibold text-foreground mb-1">
                    Tagline (One-sentence pitch) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="e.g. Instant cross-border QR payments & billing for Nepali merchants."
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <span className="text-tiny text-muted-foreground mt-1 block text-right">
                    {formData.tagline.length}/100
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-caption font-semibold text-foreground mb-1">
                      Category / Industry *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-caption font-semibold text-foreground mb-1">
                      Current Stage *
                    </label>
                    <select
                      value={formData.stage}
                      onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                      className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {STAGES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-caption font-semibold text-foreground mb-1">
                    Target Market *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {TARGET_MARKETS.map((m) => (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setFormData({ ...formData, market: m.id })}
                        className={`rounded-xl border px-3 py-2.5 text-center text-caption font-medium transition-all ${
                          formData.market === m.id
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : "border-input bg-background text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Details Section */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-apple-sm space-y-4">
                <h2 className="text-subheading font-bold text-foreground flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  Links & Description
                </h2>

                <div>
                  <label className="block text-caption font-semibold text-foreground mb-1">
                    Website or Demo Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://yourproduct.com"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-caption font-semibold text-foreground mb-1">
                    YouTube or Loom Pitch Video URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=... or https://loom.com/share/..."
                    value={formData.demoVideoUrl}
                    onChange={(e) => setFormData({ ...formData, demoVideoUrl: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-caption font-semibold text-foreground mb-1">
                    Full Description & Vision
                  </label>
                  <textarea
                    rows={4}
                    placeholder="What problem are you solving? Who is this built for? What makes your solution unique?"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                  />
                </div>

                <div>
                  <label className="block text-caption font-semibold text-foreground mb-2">
                    Technologies & Tags
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_TAGS.map((tag) => {
                      const isSelected = formData.selectedTags.includes(tag);
                      return (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`rounded-lg px-2.5 py-1 text-tiny font-medium transition-all ${
                            isSelected
                              ? "bg-foreground text-background font-bold shadow-sm"
                              : "bg-secondary text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Founder Section */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-apple-sm space-y-4">
                <h2 className="text-subheading font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Founder Contact
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-caption font-semibold text-foreground mb-1">
                      Founder Name
                    </label>
                    <input
                      type="text"
                      placeholder="Your full name"
                      value={formData.founderName}
                      onChange={(e) => setFormData({ ...formData, founderName: e.target.value })}
                      className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-caption font-semibold text-foreground mb-1">
                      Founder Contact Email
                    </label>
                    <input
                      type="email"
                      placeholder="founder@startup.com"
                      value={formData.founderEmail}
                      onChange={(e) => setFormData({ ...formData, founderEmail: e.target.value })}
                      className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" asChild>
                  <Link href="/">Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.name || !formData.tagline}
                  className="bg-primary text-primary-foreground font-semibold px-6"
                >
                  {isSubmitting ? "Submitting Product..." : "Launch Beta Product"}
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar / Live Card Preview (4 cols on lg) */}
          <div className="lg:col-span-4">
            <div className="sticky top-20 space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-apple-sm">
                <p className="text-tiny font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-accent" />
                  Live Preview
                </p>

                {/* Card mockup */}
                <div className="rounded-xl border border-border bg-background p-4 shadow-apple-sm transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-foreground text-background font-mono text-body font-bold shadow-sm">
                        {(formData.name || "W")[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-body leading-snug">
                          {formData.name || "Your Startup Name"}
                        </h3>
                        <p className="text-caption text-muted-foreground line-clamp-2 mt-0.5">
                          {formData.tagline || "Your compelling one-line pitch goes here."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary" className="text-tiny capitalize">
                      {formData.stage}
                    </Badge>
                    <Badge variant="outline" className="text-tiny">
                      {formData.category}
                    </Badge>
                    {formData.selectedTags.slice(0, 2).map((t) => (
                      <span key={t} className="rounded bg-secondary/80 px-1.5 py-0.5 text-tiny text-muted-foreground">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/50 text-caption">
                    <span className="text-muted-foreground text-tiny">
                      By {formData.founderName || "Founder"}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-primary text-tiny">
                      ▲ 1 Upvote
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/80 bg-secondary/30 p-4 text-caption text-muted-foreground space-y-2">
                <p className="font-semibold text-foreground">💡 Founder Tip</p>
                <p>
                  Products with live demo links, clear taglines, and video walkthroughs receive 4x more upvotes and tester applications on WeFounder.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
