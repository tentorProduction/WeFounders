import { DiscoveryFeed } from "@/components/startups/discovery-feed";
import { getFeaturedStartup, getStartupFeed } from "@/lib/data/startups";
import { getActiveFeatured } from "@/lib/promotions/store";
import { getSiteStats } from "@/lib/data/siteStats";

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

  const batchDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kathmandu",
  }).format(new Date());

  return (
    <div className="site-container py-6 sm:py-8">
      <DiscoveryFeed
        startups={startups}
        featured={featured}
        batchDate={batchDate}
        siteStats={siteStats}
      />
    </div>
  );
}
