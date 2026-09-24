import React from "react";
import Link from "next/link";
import { MessageSquare, Phone, Mail, MapPin, CheckCircle2, ArrowUpRight } from "lucide-react";

const SERVICES_FOOTER = [
  { href: "#services", label: "Business Websites" },
  { href: "#services", label: "E-commerce Stores (eSewa/Khalti)" },
  { href: "#services", label: "Landing Pages & Lead Gen" },
  { href: "#services", label: "Website Redesign" },
  { href: "#services", label: "SEO & Speed Optimization" },
];

const QUICK_LINKS = [
  { href: "#work", label: "Our Work / Portfolio" },
  { href: "#pricing", label: "Pricing & Packages" },
  { href: "#process", label: "4-Step Process" },
  { href: "#faq", label: "Frequently Asked Questions" },
  { href: "#contact", label: "Request a Free Quote" },
];

export function SiteFooter() {
  const whatsappUrl = "https://wa.me/9779800000000?text=Hello%20WeFounders!%20I%20would%20like%20a%20free%20quote.";

  return (
    <footer className="border-t border-border bg-card mt-16 pt-12 pb-24 sm:pb-12">
      <div className="site-container grid gap-8 sm:grid-cols-2 lg:grid-cols-4 pb-10">
        {/* Col 1: Brand & Identity */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-rose-500 font-mono text-sm font-black text-white shadow-sm"
            >
              W
            </span>
            <span className="text-subheading font-black tracking-tight text-foreground font-sans">
              WeFounders
            </span>
          </div>
          <p className="text-caption text-muted-foreground leading-relaxed">
            Affordable, high-converting website design &amp; development agency built for small businesses in Nepal and South Asia.
          </p>
          <div className="flex items-center gap-2 text-tiny font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>Official Registered Agency in Nepal</span>
          </div>
        </div>

        {/* Col 2: Services */}
        <div className="space-y-3">
          <h3 className="text-caption font-bold uppercase tracking-wider text-foreground font-mono">
            Services
          </h3>
          <ul className="space-y-2 text-caption">
            {SERVICES_FOOTER.map((item, idx) => (
              <li key={idx}>
                <a href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Quick Links */}
        <div className="space-y-3">
          <h3 className="text-caption font-bold uppercase tracking-wider text-foreground font-mono">
            Quick Navigation
          </h3>
          <ul className="space-y-2 text-caption">
            {QUICK_LINKS.map((item, idx) => (
              <li key={idx}>
                <a href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4: Contact Info */}
        <div className="space-y-3">
          <h3 className="text-caption font-bold uppercase tracking-wider text-foreground font-mono">
            Direct Contact
          </h3>
          <ul className="space-y-2.5 text-caption">
            <li>
              <a
                href="mailto:hello@wefounders.dev"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>hello@wefounders.dev</span>
              </a>
            </li>
            <li>
              <a
                href="tel:+9779800000000"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>+977 9800000000</span>
              </a>
            </li>
            <li>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                <MessageSquare className="h-4 w-4 fill-current shrink-0" />
                <span>Chat on WhatsApp</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </li>
            <li className="flex items-center gap-2 text-muted-foreground text-tiny pt-1">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>Kathmandu &amp; Biratnagar, Nepal</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <div className="site-container flex flex-col sm:flex-row items-center justify-between gap-3 text-tiny text-muted-foreground font-mono">
          <p>© {new Date().getFullYear()} WeFounders. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>Built with Next.js &amp; Tailwind CSS</span>
            <span>•</span>
            <span>Nepal 🇳🇵</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
