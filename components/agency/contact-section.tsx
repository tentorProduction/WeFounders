"use client";

import React, { useState } from "react";
import { MessageSquare, Phone, Mail, CheckCircle2, Sparkles, Send, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AgencyContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    phone: "",
    package: "Business Package (NPR 35,000)",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const phoneNumber = "+9779800000000";
  const whatsappUrl = `https://wa.me/9779800000000?text=${encodeURIComponent(
    `Hello WeFounders! My name is ${formData.name || "Client"}. My business is ${
      formData.businessName || "My Business"
    }. I am interested in ${formData.package}. Phone: ${formData.phone || "N/A"}. Message: ${formData.message}`
  )}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setIsSubmitting(true);
    // Simulate server submission delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-16 sm:py-24 bg-background godly-bg-glow">
      <div className="site-container max-w-5xl space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-mono text-tiny">
            Free Consultation
          </Badge>
          <h2 className="text-display font-black tracking-tight text-foreground">
            Let&apos;s Build Your Website
          </h2>
          <p className="text-body text-muted-foreground">
            Tell us about your business — get a free 1-on-1 consultation and quote within 24 hours.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Form Side (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="godly-card deck-card p-6 sm:p-8 space-y-6">
              {submitted ? (
                <div className="text-center py-8 space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h3 className="text-subheading font-bold text-foreground">
                    Quote Request Received!
                  </h3>
                  <p className="text-body text-muted-foreground max-w-md mx-auto">
                    Thank you, <strong className="text-foreground">{formData.name}</strong>. Our team will review your business details and contact you at <strong className="text-foreground">{formData.phone}</strong> within 24 hours.
                  </p>
                  <div className="pt-2 flex flex-wrap justify-center gap-3">
                    <Button
                      asChild
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                    >
                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                        <MessageSquare className="h-4 w-4 mr-2 fill-current" />
                        Chat Immediately on WhatsApp
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-subheading font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    Request a Free Quote
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-caption font-semibold text-foreground mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Shrestha"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div>
                      <label className="block text-caption font-semibold text-foreground mb-1">
                        Phone or WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +977 98XXXXXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-caption font-semibold text-foreground mb-1">
                        Business Name &amp; City
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Himalayan Bakery, Kathmandu"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div>
                      <label className="block text-caption font-semibold text-foreground mb-1">
                        Package Interest
                      </label>
                      <select
                        value={formData.package}
                        onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                        className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="Starter Package (NPR 15,000)">Starter Package (NPR 15,000)</option>
                        <option value="Business Package (NPR 35,000)">Business Package (NPR 35,000)</option>
                        <option value="E-commerce Package (NPR 80,000+)">E-commerce Package (NPR 80,000+)</option>
                        <option value="Custom Project">Custom Website / Web App</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-caption font-semibold text-foreground mb-1">
                      Tell Us About Your Website Needs (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="What does your business do? What features do you need (menu, booking, eSewa payment)?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                    />
                  </div>

                  <div className="pt-2 flex flex-wrap gap-3">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !formData.name || !formData.phone}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-6 text-caption rounded-xl"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Submitting Request..." : "Submit Quote Request"}
                    </Button>

                    <Button
                      type="button"
                      asChild
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-6 text-caption rounded-xl"
                    >
                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                        <MessageSquare className="h-4 w-4 mr-2 fill-current" />
                        Chat on WhatsApp
                      </a>
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Contact Direct Cards (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="godly-card p-6 space-y-4">
              <h3 className="text-subheading font-bold text-foreground">Direct Agency Contacts</h3>
              <p className="text-caption text-muted-foreground">
                Prefer talking directly? Call or WhatsApp us anytime between 9:00 AM – 7:00 PM NPT.
              </p>

              <div className="space-y-3 pt-2">
                <a
                  href="https://wa.me/9779800000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500/20 transition-all"
                >
                  <MessageSquare className="h-5 w-5 fill-current shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="text-caption">WhatsApp Chat</span>
                    <span className="text-tiny font-normal">Instant 5-Minute Reply</span>
                  </div>
                </a>

                <a
                  href={`tel:${phoneNumber}`}
                  className="flex items-center gap-3.5 p-3.5 rounded-xl border border-border bg-secondary text-foreground font-bold hover:bg-secondary/80 transition-all"
                >
                  <Phone className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="text-caption">Call Us Directly</span>
                    <span className="text-tiny font-normal text-muted-foreground">+977 9800000000</span>
                  </div>
                </a>

                <a
                  href="mailto:hello@wefounders.dev"
                  className="flex items-center gap-3.5 p-3.5 rounded-xl border border-border bg-secondary text-foreground font-bold hover:bg-secondary/80 transition-all"
                >
                  <Mail className="h-5 w-5 text-purple-500 shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="text-caption">Email Support</span>
                    <span className="text-tiny font-normal text-muted-foreground">hello@wefounders.dev</span>
                  </div>
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 text-caption text-muted-foreground space-y-2">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <MapPin className="h-4 w-4 text-accent" />
                <span>Office Locations</span>
              </div>
              <p>Kathmandu &amp; Biratnagar, Nepal.</p>
              <p className="text-tiny text-muted-foreground">Serving clients across Nepal, South Asia, and worldwide export businesses.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
