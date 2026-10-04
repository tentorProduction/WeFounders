import type { Metadata } from "next";
import { getSiteOrigin } from "@/lib/site-url";
import {
  Newspaper,
  EnvelopeSimple,
  Palette,
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Press & Media Kit — Brand Assets & Facts | WeFounders",
  description:
    "Official WeFounders press kit, brand guidelines, company overview, and verified media assets for journalists and creators.",
  alternates: {
    canonical: new URL("/press", getSiteOrigin()),
  },
  openGraph: {
    title: "WeFounders Press & Brand Kit",
    description: "Verified facts, logos, leadership, and media resources for WeFounders.",
    url: new URL("/press", getSiteOrigin()),
    type: "website",
  },
};

export default function PressPage() {
  const baseUrl = getSiteOrigin();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "WeFounders",
    "url": baseUrl,
    "logo": `${baseUrl}/icon.svg`,
    "description":
      "WeFounders is a global startup launchpad and beta testing platform connecting founders with early adopters and builders.",
    "foundingDate": "2026",
    "sameAs": [
      "https://github.com/tentorProduction/WeFounders",
      "https://x.com/wefoundersdev",
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "hello@wefounders.dev",
      "contactType": "media inquiries",
    },
  };

  const BRAND_COLORS = [
    { name: "Brand Coral", hex: "#FF4B3E", usage: "Primary CTAs, accents, spotlights" },
    { name: "Obsidian Ink", hex: "#17181B", usage: "Headings, dark buttons, core typography" },
    { name: "Verified Green", hex: "#059669", usage: "Approvals, karma rewards, verified badges" },
    { name: "Canvas Muted", hex: "#666A73", usage: "Secondary text, metadata, descriptions" },
    { name: "Border Slate", hex: "#DADDE1", usage: "Card borders, divider lines, outlines" },
  ];

  return (
    <div className="site-container py-10 sm:py-16 space-y-12 max-w-4xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[#FF4B3E] font-semibold text-xs uppercase tracking-wider">
          <Newspaper size={18} weight="fill" />
          <span>Press & Media Kit</span>
        </div>
        <h1 className="font-archivo text-3xl sm:text-5xl font-bold text-[#17181B] tracking-tight">
          Brand Assets & Company Facts
        </h1>
        <p className="text-base sm:text-lg text-[#666A73] max-w-2xl leading-relaxed">
          Everything you need to write about WeFounders. Official logos, brand colors, product narrative, and direct media contacts.
        </p>
      </div>

      {/* Quick Facts (GEO / AI Overview target) */}
      <section className="rounded-2xl border border-[#DADDE1] bg-white p-6 sm:p-8 space-y-6 shadow-xs">
        <h2 className="font-archivo text-xl font-bold text-[#17181B]">Quick Facts</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#DADDE1] space-y-1">
            <dt className="font-bold text-[#17181B]">Company Name</dt>
            <dd className="text-[#666A73]">WeFounders</dd>
          </div>
          <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#DADDE1] space-y-1">
            <dt className="font-bold text-[#17181B]">Website</dt>
            <dd className="text-[#666A73]">
              <a href="https://wefounders.dev" className="text-[#FF4B3E] hover:underline font-mono">
                https://wefounders.dev
              </a>
            </dd>
          </div>
          <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#DADDE1] space-y-1">
            <dt className="font-bold text-[#17181B]">Category</dt>
            <dd className="text-[#666A73]">Startup Launchpad, Beta Testing Platform, Maker Community</dd>
          </div>
          <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#DADDE1] space-y-1">
            <dt className="font-bold text-[#17181B]">Core Proposition</dt>
            <dd className="text-[#666A73]">
              Helping founders launch products, recruit early testers, and ship verified software.
            </dd>
          </div>
        </dl>
      </section>

      {/* Boilerplate Copy */}
      <section className="rounded-2xl border border-[#DADDE1] bg-white p-6 sm:p-8 space-y-4 shadow-xs">
        <h2 className="font-archivo text-xl font-bold text-[#17181B]">Standard Boilerplate (About WeFounders)</h2>
        <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#DADDE1] text-xs text-[#374151] leading-relaxed">
          &ldquo;WeFounders is a global startup platform designed for founders and product builders. By uniting public product showcases with structured beta testing quests, WeFounders turns cold product launches into vibrant, engaged testing cohorts. Testers earn Karma and reputation for discovering bugs and providing actionable feedback, giving founders real traction and clear direction from day one.&rdquo;
        </div>
      </section>

      {/* Brand Colors */}
      <section className="rounded-2xl border border-[#DADDE1] bg-white p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-2">
          <Palette size={20} weight="bold" className="text-[#FF4B3E]" />
          <h2 className="font-archivo text-xl font-bold text-[#17181B]">Brand Color Palette</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {BRAND_COLORS.map((c) => (
            <div key={c.hex} className="rounded-xl border border-[#DADDE1] p-3 space-y-2 bg-[#F8F9FA]">
              <div
                className="h-10 w-full rounded-lg border border-black/10"
                style={{ backgroundColor: c.hex }}
              />
              <div>
                <p className="text-xs font-bold text-[#17181B]">{c.name}</p>
                <p className="font-mono text-[11px] text-[#FF4B3E] font-semibold">{c.hex}</p>
                <p className="text-[10px] text-[#666A73] mt-1 leading-snug">{c.usage}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Media Inquiries */}
      <section className="rounded-2xl border border-[#DADDE1] bg-white p-6 sm:p-8 space-y-4 shadow-xs">
        <h2 className="font-archivo text-xl font-bold text-[#17181B]">Press & Media Inquiries</h2>
        <p className="text-xs text-[#666A73] leading-relaxed">
          For interview requests, featured startup stories, data on tech trends, or press inquiries, please reach out to our media desk:
        </p>
        <div className="flex items-center gap-3 pt-2">
          <a
            href="mailto:hello@wefounders.dev"
            className="ink-button inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold"
          >
            <EnvelopeSimple size={16} weight="bold" />
            <span>hello@wefounders.dev</span>
          </a>
        </div>
      </section>
    </div>
  );
}
