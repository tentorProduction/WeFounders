import { getStartupFeed } from "@/lib/data/startups";
import { LaunchList } from "@/components/startups/launch-list";
import { sql } from "@/lib/db/neon";
import type { Tag } from "@/types/database";
import { Rocket, Flame, Sparkle, Trophy, Tag as TagIcon, Funnel } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { Metadata } from "next";
import { getSiteOrigin } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getSiteOrigin();
  const canonical = new URL("/startups", baseUrl);

  return {
    title: "Startups Directory — Discover & Test New Products | WeFounders",
    description:
      "Explore the index of world-class startups, open beta programs, and developer tools shipping on WeFounders.",
    alternates: { canonical },
    openGraph: {
      title: "Startups Directory — WeFounders",
      description: "Browse vetted launches, join active testing cohorts, and upvote the best products.",
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Startups Directory — WeFounders",
      description: "Browse vetted launches, join active testing cohorts, and upvote the best products.",
    },
  };
}

export default async function StartupsDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; tag?: string; stage?: string }>;
}) {
  const { tab = "trending", tag, stage } = await searchParams;

  const startups = await getStartupFeed({
    orderBy: tab === "newest" ? "newest" : "upvotes",
  });

  const allTags = (await sql`
    SELECT id, slug, name, category FROM tags ORDER BY name ASC
  `) as unknown as Tag[];

  // Filter in memory for tag and stage
  const filtered = startups.filter((s) => {
    if (tag && !s.tags?.some((t) => t.slug === tag)) return false;
    if (stage && s.stage !== stage) return false;
    return true;
  });

  const baseUrl = getSiteOrigin();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "WeFounders Startups Directory",
    "description": "Directory of startups, beta launches, and tech products shipping worldwide.",
    "url": `${baseUrl}/startups`,
    "itemListElement": filtered.slice(0, 20).map((s, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": s.name,
      "url": `${baseUrl}/startups/${s.slug}`,
      "description": s.tagline,
    })),
  };

  const TABS = [
    { id: "trending", label: "Trending", icon: Flame },
    { id: "newest", label: "New Launches", icon: Sparkle },
    { id: "upvoted", label: "Top Rated", icon: Trophy },
  ];

  const STAGES = [
    { id: "all", label: "All Stages" },
    { id: "public_beta", label: "Public Beta" },
    { id: "mvp", label: "MVP" },
    { id: "early_traction", label: "Early Traction" },
    { id: "scaling", label: "Scaling" },
  ];

  return (
    <div className="site-container py-8 sm:py-12 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Directory Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[#FF4B3E] font-semibold text-xs uppercase tracking-wider">
          <Rocket size={18} weight="fill" />
          <span>Global Product Index</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-archivo text-3xl sm:text-5xl font-bold text-[#17181B] tracking-tight">
              Startups Directory
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[#666A73] max-w-2xl leading-relaxed">
              Discover, test, and support live startups. Join beta cohorts, provide actionable feedback, and earn Karma for helping founders ship.
            </p>
          </div>
          <Link
            href="/submit"
            className="ink-button inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold shrink-0"
          >
            <Rocket size={16} weight="bold" />
            <span>Launch Your Startup</span>
          </Link>
        </div>
      </div>

      {/* Filtering Controls */}
      <div className="space-y-4 rounded-2xl border border-[#DADDE1] bg-white p-4 sm:p-5 shadow-xs">
        {/* Sort Tabs & Stage Filter */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#F0F2F5]">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              const isActive = tab === t.id;
              return (
                <Link
                  key={t.id}
                  href={`/startups?tab=${t.id}${tag ? `&tag=${tag}` : ""}${stage ? `&stage=${stage}` : ""}`}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-[#17181B] text-white"
                      : "bg-[#F8F9FA] text-[#666A73] hover:text-[#17181B] border border-[#DADDE1]"
                  }`}
                >
                  <Icon size={14} weight={isActive ? "fill" : "regular"} />
                  <span>{t.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Stage Dropdown / Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs text-[#A0A4AB] font-medium flex items-center gap-1 mr-1">
              <Funnel size={13} /> Stage:
            </span>
            {STAGES.map((s) => {
              const isStageActive = (!stage && s.id === "all") || stage === s.id;
              const href =
                s.id === "all"
                  ? `/startups?tab=${tab}${tag ? `&tag=${tag}` : ""}`
                  : `/startups?tab=${tab}&stage=${s.id}${tag ? `&tag=${tag}` : ""}`;
              return (
                <Link
                  key={s.id}
                  href={href}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-colors ${
                    isStageActive
                      ? "bg-[#F0F2F5] text-[#17181B] font-bold"
                      : "text-[#666A73] hover:text-[#17181B]"
                  }`}
                >
                  {s.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Categories / Tags */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1">
          <span className="text-xs text-[#A0A4AB] font-medium flex items-center gap-1 shrink-0 mr-1">
            <TagIcon size={13} /> Tags:
          </span>
          <Link
            href={`/startups?tab=${tab}${stage ? `&stage=${stage}` : ""}`}
            className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap border transition-colors ${
              !tag
                ? "bg-[#FF4B3E] text-white border-[#FF4B3E]"
                : "bg-white text-[#666A73] border-[#DADDE1] hover:border-[#17181B]"
            }`}
          >
            All
          </Link>
          {allTags.map((t) => {
            const isTagActive = tag === t.slug;
            return (
              <Link
                key={t.slug}
                href={`/startups?tab=${tab}&tag=${t.slug}${stage ? `&stage=${stage}` : ""}`}
                className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap border transition-colors ${
                  isTagActive
                    ? "bg-[#FF4B3E] text-white border-[#FF4B3E]"
                    : "bg-white text-[#666A73] border-[#DADDE1] hover:border-[#17181B]"
                }`}
              >
                {t.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Directory Count */}
      <div className="flex items-center justify-between text-xs text-[#666A73]">
        <span>
          Showing <span className="font-semibold text-[#17181B] font-mono">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "startup" : "startups"}
        </span>
        {(tag || stage) && (
          <Link href="/startups" className="text-[#FF4B3E] hover:underline font-semibold">
            Clear all filters
          </Link>
        )}
      </div>

      {/* Grid of Startups */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#DADDE1] rounded-[28px] p-12 text-center space-y-3">
          <p className="text-sm font-semibold text-[#17181B]">No startups match the selected filters.</p>
          <p className="text-xs text-[#666A73]">Try resetting your filter selection or browse all startups.</p>
          <div className="pt-2">
            <Link
              href="/startups"
              className="ink-button inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full"
            >
              <span>Reset Filters</span>
            </Link>
          </div>
        </div>
      ) : (
        <LaunchList startups={filtered} />
      )}
    </div>
  );
}
