import { getStartupFeed } from "@/lib/data/startups";
import { LaunchList } from "@/components/startups/launch-list";
import { sql } from "@/lib/db/neon";
import type { Tag } from "@/types/database";
import { Compass, Flame, Sparkle, Trophy } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Discover Startups — WeFounders",
  description: "Browse world-class startups, indie tools, and open beta programs.",
};

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; tag?: string }>;
}) {
  const { tab = "trending", tag } = await searchParams;

  const startups = await getStartupFeed({
    orderBy: tab === "newest" ? "newest" : "upvotes",
  });

  const allTags = (await sql`
    SELECT id, slug, name, category FROM tags ORDER BY name ASC
  `) as unknown as Tag[];

  // Filter in memory for tag if selected
  const filtered = tag
    ? startups.filter((s) => s.tags?.some((t) => t.slug === tag))
    : startups;

  const TABS = [
    { id: "trending", label: "Trending", icon: Flame },
    { id: "newest", label: "New Launches", icon: Sparkle },
    { id: "upvoted", label: "Most Upvoted", icon: Trophy },
  ];

  return (
    <div className="site-container py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[#FF4B3E] font-semibold text-xs uppercase tracking-wider">
          <Compass size={18} weight="fill" />
          <span>Product Radar</span>
        </div>
        <h1 className="font-archivo text-3xl sm:text-5xl font-bold text-[#17181B] tracking-tight">
          Discover Products
        </h1>
        <p className="text-sm sm:text-base text-[#666A73] max-w-2xl">
          Explore breakthrough startups, test private betas, and support indie makers shipping worldwide.
        </p>
      </div>

      {/* Tabs & Tags bar */}
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#DADDE1]">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <Link
                key={t.id}
                href={`/discover?tab=${t.id}${tag ? `&tag=${tag}` : ""}`}
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

        {/* Category Tag Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Link
            href={`/discover?tab=${tab}`}
            className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap border transition-colors ${
              !tag
                ? "bg-[#FF4B3E] text-white border-[#FF4B3E]"
                : "bg-white text-[#666A73] border-[#DADDE1] hover:border-[#17181B]"
            }`}
          >
            All Categories
          </Link>
          {allTags.map((t) => {
            const isTagActive = tag === t.slug;
            return (
              <Link
                key={t.slug}
                href={`/discover?tab=${tab}&tag=${t.slug}`}
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

      {/* Grid of Startups */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#DADDE1] rounded-[28px] p-12 text-center space-y-3">
          <p className="text-sm font-semibold text-[#17181B]">No startups found in this category.</p>
          <p className="text-xs text-[#666A73]">Try selecting &quot;All Categories&quot; or check back shortly.</p>
          <div className="pt-2">
            <Link
              href="/discover"
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
