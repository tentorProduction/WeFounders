import { getSiteOrigin } from "@/lib/site-url";
import { DiscoveryFeed } from "@/components/startups/discovery-feed";
import { getFeaturedStartup, getStartupFeed } from "@/lib/data/startups";
import { getActiveFeatured } from "@/lib/promotions/store";
import { getSiteStats } from "@/lib/data/siteStats";
import type { Metadata } from "next";

const baseUrl = getSiteOrigin();

export const metadata: Metadata = {
  alternates: { canonical: new URL("/", baseUrl) },
  openGraph: { url: baseUrl },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [startups, featuredLaunch, activeFeatured, siteStats] = await Promise.all([
    getStartupFeed(),
    getFeaturedStartup(),
    getActiveFeatured(),
    getSiteStats(),
  ]);
  // A paid promotion wins the spotlight over the founder-flagged launch.
  const featured = activeFeatured?.startup ?? featuredLaunch;

  // Computed once on the server: the client must not call `new Date()` during
  // render or the batch label hydrates against a different timestamp.
  const now = new Date();
  const batchDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(now);

  return (
    <div className="site-container py-6 sm:py-8">
      <DiscoveryFeed
        startups={startups}
        featured={featured}
        batchDate={batchDate}
        batchDateIso={now.toISOString()}
        siteStats={siteStats}
      />
    </div>
  );
}
