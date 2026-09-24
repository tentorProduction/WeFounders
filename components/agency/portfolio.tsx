"use client";

import React, { useState, useMemo } from "react";
import { CheckCircle2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PORTFOLIO_PROJECTS = [
  {
    id: "himalayan-bakery",
    title: "Himalayan Artisan Bakery",
    category: "Food & Dining",
    location: "Kathmandu, Nepal",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1000&auto=format&fit=crop&q=80",
    outcome: "Online cake & pastry orders up +45% in first 30 days",
    deliverables: ["Custom 6-Page Site", "WhatsApp Order Form", "Google Maps Embed", "SEO Setup"],
    demoUrl: "https://himalayanbakery.example.com",
    priceTier: "NPR 25,000",
  },
  {
    id: "biratnagar-dental",
    title: "Biratnagar Dental Care Clinic",
    category: "Healthcare",
    location: "Biratnagar, Nepal",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1000&auto=format&fit=crop&q=80",
    outcome: "+120 patient appointment requests per month",
    deliverables: ["Doctor Roster", "WhatsApp Direct Booking", "Service Menu", "Mobile Optimized"],
    demoUrl: "https://biratnagardental.example.com",
    priceTier: "NPR 35,000",
  },
  {
    id: "poshak-fashion",
    title: "Poshak Fashion Studio",
    category: "Retail & Fashion",
    location: "Lalitpur, Nepal",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=80",
    outcome: "eSewa & Khalti QR checkout integrated for online sales",
    deliverables: ["E-commerce Catalog", "Payment Gateway", "Instagram Feed Sync", "Inventory System"],
    demoUrl: "https://poshakfashion.example.com",
    priceTier: "NPR 80,000",
  },
  {
    id: "valley-logistics",
    title: "Kathmandu Valley Express Logistics",
    category: "Services & B2B",
    location: "Kathmandu, Nepal",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1000&auto=format&fit=crop&q=80",
    outcome: "Freight inquiries increased by 3x with instant rate calculator",
    deliverables: ["Rate Calculator Form", "Fleet Showcase", "Corporate B2B Portal", "Fast 1.5s Load"],
    demoUrl: "https://valleylogistics.example.com",
    priceTier: "NPR 35,000",
  },
  {
    id: "everest-gym",
    title: "Everest Power & Fitness Gym",
    category: "Healthcare",
    location: "Pokhara, Nepal",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1000&auto=format&fit=crop&q=80",
    outcome: "+85 new membership signups from local Google search",
    deliverables: ["Class Schedule Grid", "Trainer Profiles", "Membership Pricing", "Local SEO Rank #1"],
    demoUrl: "https://everestfitness.example.com",
    priceTier: "NPR 25,000",
  },
  {
    id: "hamro-handicrafts",
    title: "Hamro Heritage Handicrafts",
    category: "Retail & Fashion",
    location: "Bhaktapur, Nepal",
    image: "https://images.unsplash.com/photo-1606744888344-493238951221?w=1000&auto=format&fit=crop&q=80",
    outcome: "Exporting handmade products to US & Europe",
    deliverables: ["Global Export Site", "Multi-Currency Display", "Inquiry Form", "High-Res Gallery"],
    demoUrl: "https://hamrohandicrafts.example.com",
    priceTier: "NPR 45,000",
  },
];

const CATEGORIES = ["All Work", "Food & Dining", "Healthcare", "Retail & Fashion", "Services & B2B"];

export function AgencyPortfolio() {
  const [selectedCategory, setSelectedCategory] = useState("All Work");
  const [previewProject, setPreviewProject] = useState<typeof PORTFOLIO_PROJECTS[0] | null>(null);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === "All Work") return PORTFOLIO_PROJECTS;
    return PORTFOLIO_PROJECTS.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <section id="work" className="py-16 sm:py-24 bg-card border-y border-border">
      <div className="site-container space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge variant="outline" className="font-mono text-tiny">
            Proven Results
          </Badge>
          <h2 className="text-display font-bold tracking-tight text-foreground">
            Our Featured Client Projects
          </h2>
          <p className="text-body text-muted-foreground">
            Real websites delivered for businesses across Kathmandu, Biratnagar, Lalitpur, and Pokhara.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-4 py-2 text-caption font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground font-bold shadow-apple-xs"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Portfolio Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="godly-card deck-card overflow-hidden group flex flex-col justify-between"
            >
              {/* Image Preview */}
              <div className="relative aspect-video w-full overflow-hidden bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="font-mono text-[10px] font-bold shadow-sm">
                    {project.priceTier}
                  </Badge>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-tiny text-muted-foreground font-medium">
                    <span>{project.category}</span>
                    <span>• {project.location}</span>
                  </div>

                  <h3 className="text-subheading font-bold text-foreground group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>

                  <p className="text-caption font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{project.outcome}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {project.deliverables.slice(0, 2).map((d, idx) => (
                      <span key={idx} className="rounded bg-secondary px-2 py-0.5 text-tiny text-muted-foreground">
                        {d}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setPreviewProject(project)}
                    className="text-caption font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>View Case</span>
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Case Study Modal */}
      {previewProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="godly-card bg-card p-6 max-w-lg w-full space-y-4 shadow-apple-lg border-border">
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="outline" className="text-tiny font-mono">
                  {previewProject.category}
                </Badge>
                <h3 className="text-subheading font-bold text-foreground mt-1">
                  {previewProject.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewProject(null)}
                className="text-muted-foreground hover:text-foreground text-caption"
              >
                ✕
              </button>
            </div>

            <div className="aspect-video w-full overflow-hidden rounded-xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewProject.image} alt={previewProject.title} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-2">
              <p className="text-body font-semibold text-emerald-600 dark:text-emerald-400">
                🎯 Outcome: {previewProject.outcome}
              </p>
              <p className="text-caption text-muted-foreground">
                Location: {previewProject.location} • Tier: {previewProject.priceTier}
              </p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-border">
              <p className="text-tiny font-mono font-bold uppercase text-foreground">Project Deliverables:</p>
              <div className="flex flex-wrap gap-1.5">
                {previewProject.deliverables.map((d, idx) => (
                  <span key={idx} className="rounded-lg bg-secondary px-2.5 py-1 text-tiny text-foreground font-medium">
                    ✓ {d}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setPreviewProject(null)}>
                Close
              </Button>
              <Button size="sm" asChild className="bg-emerald-600 text-white hover:bg-emerald-500">
                <a
                  href={`https://wa.me/9779800000000?text=${encodeURIComponent(
                    `Hello WeFounders! I liked your work on ${previewProject.title}. I want a similar website for my business.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get Similar Website
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
