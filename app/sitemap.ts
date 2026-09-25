import type { MetadataRoute } from "next";

import { getStartupFeed } from "@/lib/data/startups";

/** Rebuilt hourly so newly approved launches appear without a redeploy. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.wefounders.dev";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/quests`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/collab`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/promote`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Approved launches straight from the database — no static list to maintain.
  const startups = await getStartupFeed({ orderBy: "newest" });
  const startupRoutes: MetadataRoute.Sitemap = startups.map((startup) => ({
    url: `${baseUrl}/startups/${startup.slug}`,
    lastModified: new Date(startup.updated_at || startup.created_at || now),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...startupRoutes];
}
