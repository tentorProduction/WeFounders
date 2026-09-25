"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";
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



const TARGET_MARKETS = [
  { id: "nepal_domestic", label: "Made for Nepal 🇳🇵" },
  { id: "global_export", label: "Built for World 🌍" },
  { id: "hybrid", label: "Hybrid Focus 🌐" },
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
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    description: "",
    category: "Fintech",
    stage: "public_beta",
    market: "nepal_domestic",
    websiteUrl: "",
    demoVideoUrl: "",
    selectedTags: ["Next.js", "eSewa"] as string[],
    founderName: user?.displayName || "",
    founderEmail: user?.email || "",
    founderSocial: "",
  });

  const [validationError, setValidationError] = useState<string | null>(null);
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

  const validateStep1 = () => {
    setValidationError(null);
    if (!formData.name.trim()) {
      setValidationError("Startup name is required.");
      return false;
    }
    if (!formData.tagline.trim() || formData.tagline.length > 80) {
      setValidationError("Tagline is required and must be 80 characters or fewer.");
      return false;
    }
    if (formData.websiteUrl.includes("example.com")) {
      setValidationError("Please enter your real product website URL (example.com placeholder is not permitted).");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="site-container py-8 max-w-4xl space-y-6">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-caption font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Feed
      </Link>

      {submitted ? (
        <div className="rounded-3xl border border-border bg-card p-8 md:p-12 text-center shadow-apple-md space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold">
            Submission Submitted to Queue
          </Badge>
          <h1 className="text-display font-bold text-foreground">
            {formData.name} is in Curation Queue!
          </h1>
          <p className="mx-auto max-w-md text-body text-muted-foreground">
            Thank you for submitting to WeFounders. Our team reviews submissions against our 21% curation standard daily. You will receive an email update at <strong className="text-foreground">{formData.founderEmail || "your email"}</strong>.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <Button asChild variant="outline">
              <Link href="/">Return to Feed</Link>
            </Button>
            <Button
              onClick={() => {
                setSubmitted(false);
                setStep(1);
                setFormData({
                  name: "",
                  tagline: "",
                  description: "",
                  category: "Fintech",
                  stage: "public_beta",
                  market: "nepal_domestic",
                  websiteUrl: "",
                  demoVideoUrl: "",
                  selectedTags: ["Next.js"],
                  founderName: user?.displayName || "",
                  founderEmail: user?.email || "",
                  founderSocial: "",
                });
              }}
            >
              Submit Another Startup
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <Badge variant="outline" className="mb-2 font-mono text-tiny border-accent/40 text-accent">
              4-Step Launch Wizard
            </Badge>
            <h1 className="text-display font-bold tracking-tight text-foreground">
              Submit Your Startup to WeFounders
            </h1>
            <p className="mt-1 text-body text-muted-foreground">
              Get early beta users, feedback, and exposure from Nepal&apos;s 1,850+ daily builder community.
            </p>
          </div>

          {/* Wizard Progress Bar */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <button
              onClick={() => setStep(1)}
              className={`flex items-center gap-2 text-caption font-bold ${
                step === 1 ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-tiny">1</span>
              <span>1. Basics</span>
            </button>

            <button
              onClick={() => validateStep1() && setStep(2)}
              className={`flex items-center gap-2 text-caption font-bold ${
                step === 2 ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-tiny">2</span>
              <span>2. Media &amp; Tech</span>
            </button>

            <button
              onClick={() => validateStep1() && setStep(3)}
              className={`flex items-center gap-2 text-caption font-bold ${
                step === 3 ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-tiny">3</span>
              <span>3. Founder Info</span>
            </button>

            <button
              onClick={() => validateStep1() && setStep(4)}
              className={`flex items-center gap-2 text-caption font-bold ${
                step === 4 ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-tiny">4</span>
              <span>4. Review</span>
            </button>
          </div>

          {validationError && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-caption text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: BASICS */}
            {step === 1 && (
              <div className="rounded-3xl border border-border bg-card p-6 shadow-apple-sm space-y-4">
                <h2 className="text-subheading font-bold text-foreground">Step 1: Product Identity</h2>

                <div>
                  <label className="block text-caption font-semibold text-foreground mb-1">
                    Startup Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SajhaPay, Lekhani AI, Chhito"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-caption font-semibold text-foreground mb-1">
                    One-Sentence Pitch Tagline (≤ 80 Chars) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    placeholder="e.g. Recurring billing for Nepali freelancers with eSewa & Khalti."
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <span className="text-tiny text-muted-foreground mt-1 block text-right font-mono">
                    {formData.tagline.length}/80
                  </span>
                </div>

                <div>
                  <label className="block text-caption font-semibold text-foreground mb-1">
                    Product Website or App Store URL * (Must be live; no placeholder URLs)
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://yourstartup.com"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-caption font-semibold text-foreground mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                      Target Market *
                    </label>
                    <select
                      value={formData.market}
                      onChange={(e) => setFormData({ ...formData, market: e.target.value })}
                      className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {TARGET_MARKETS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    onClick={() => validateStep1() && setStep(2)}
                    className="bg-primary text-primary-foreground font-semibold px-6 rounded-2xl"
                  >
                    Next: Media &amp; Tech →
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: MEDIA & TECH */}
            {step === 2 && (
              <div className="rounded-3xl border border-border bg-card p-6 shadow-apple-sm space-y-4">
                <h2 className="text-subheading font-bold text-foreground">Step 2: Media &amp; Tech Stack</h2>

                <div>
                  <label className="block text-caption font-semibold text-foreground mb-1">
                    YouTube or Loom Video Walkthrough URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={formData.demoVideoUrl}
                    onChange={(e) => setFormData({ ...formData, demoVideoUrl: e.target.value })}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-caption font-semibold text-foreground mb-1">
                    Detailed Product Story &amp; Vision
                  </label>
                  <textarea
                    rows={4}
                    placeholder="What problem are you solving? Who is this for? What makes your solution unique?"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                  />
                </div>

                <div>
                  <label className="block text-caption font-semibold text-foreground mb-2">
                    Technologies &amp; Integrations
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_TAGS.map((tag) => {
                      const isSelected = formData.selectedTags.includes(tag);
                      return (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`rounded-xl px-3 py-1.5 text-caption font-semibold transition-all ${
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-apple-xs"
                              : "bg-secondary text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    ← Back
                  </Button>
                  <Button type="button" onClick={() => setStep(3)} className="bg-primary text-primary-foreground font-semibold px-6 rounded-2xl">
                    Next: Founder Info →
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: FOUNDER INFO */}
            {step === 3 && (
              <div className="rounded-3xl border border-border bg-card p-6 shadow-apple-sm space-y-4">
                <h2 className="text-subheading font-bold text-foreground">Step 3: Founder Contact &amp; Identity</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-caption font-semibold text-foreground mb-1">
                      Founder Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aman Founder"
                      value={formData.founderName}
                      onChange={(e) => setFormData({ ...formData, founderName: e.target.value })}
                      className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-caption font-semibold text-foreground mb-1">
                      Founder Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="founder@wefounders.dev"
                      value={formData.founderEmail}
                      onChange={(e) => setFormData({ ...formData, founderEmail: e.target.value })}
                      className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-caption font-semibold text-foreground mb-1">
                    X (Twitter) or LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://x.com/yourhandle or https://linkedin.com/in/yourprofile"
                    value={formData.founderSocial}
                    onChange={(e) => setFormData({ ...formData, founderSocial: e.target.value })}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="flex justify-between pt-2">
                  <Button type="button" variant="outline" onClick={() => setStep(2)}>
                    ← Back
                  </Button>
                  <Button type="button" onClick={() => setStep(4)} className="bg-primary text-primary-foreground font-semibold px-6 rounded-2xl">
                    Next: Review &amp; Launch →
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & SCHEDULE */}
            {step === 4 && (
              <div className="rounded-3xl border border-border bg-card p-6 shadow-apple-sm space-y-6">
                <h2 className="text-subheading font-bold text-foreground">Step 4: Final Review &amp; Submit</h2>

                <div className="rounded-2xl border border-border bg-background p-4 space-y-2">
                  <h3 className="font-bold text-foreground text-body">{formData.name || "Startup Name"}</h3>
                  <p className="text-caption text-muted-foreground">{formData.tagline || "Tagline"}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <Badge variant="outline">{formData.category}</Badge>
                    <Badge variant="secondary">{formData.market}</Badge>
                    {formData.selectedTags.map((t) => (
                      <span key={t} className="text-tiny text-muted-foreground font-mono">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button type="button" variant="outline" onClick={() => setStep(3)}>
                    ← Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 py-6 text-body rounded-2xl shadow-apple-sm"
                  >
                    {isSubmitting ? "Submitting..." : "🚀 Launch Beta Product"}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
