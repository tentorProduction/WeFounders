import type { Metadata } from "next";

import { getStartupFeed } from "@/lib/data/startups";
import { SearchExplorer } from "@/components/search/search-explorer";

export const metadata: Metadata = {
  title: "Search Startups & Betas",
  description:
    "Explore Nepali products and betas by category, tech stack, payment rail, or keyword.",
};

export const dynamic = "force-dynamic";

/**
 * Search route. Data is fetched on the server so the full startup list never
 * ships to the browser; filtering itself stays client-side for instant
 * feedback.
 */
export default async function SearchPage() {
  const startups = await getStartupFeed({ orderBy: "newest" });

  return <SearchExplorer startups={startups} />;
}
