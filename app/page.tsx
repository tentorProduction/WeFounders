import { DiscoveryFeed } from "@/components/startups/discovery-feed";
import { getFeaturedStartup, getStartupFeed } from "@/lib/fixtures/startups";
import { getActiveFeatured } from "@/lib/promotions/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [startups, fixtureFeatured, activeFeatured] = await Promise.all([
    getStartupFeed(),
    getFeaturedStartup(),
    getActiveFeatured(),
  ]);
  const featured = activeFeatured?.startup ?? fixtureFeatured;

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
      />
    </div>
  );
}
