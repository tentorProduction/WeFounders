import { getSiteOrigin } from "@/lib/site-url";
import type { MetadataRoute } from "next";

import { sql } from "@/lib/db/neon";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteOrigin();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/discover`,
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
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // ponytail: one sitemap; split when public URLs approach the 50,000 URL limit.
  const publicPages = await sql`
    select 'startups' as route, slug as key, updated_at from startups
    where status='approved' and archived_at is null and launch_date<=now()
    union all select 'profile',username,updated_at from profiles
    where suspended_at is null and username<>''
    union all select 'quests',q.id::text,q.updated_at from testing_quests q
    join startups s on s.id=q.startup_id
    where q.approval_status='approved' and s.status='approved'
      and s.archived_at is null and s.launch_date<=now()
    union all select 'collab',id::text,created_at from collab_posts
    where is_active and approval_status='approved'
  ` as { route: string; key: string; updated_at: string }[];
  const publicRoutes: MetadataRoute.Sitemap = publicPages.map((page) => ({
    url: `${baseUrl}/${page.route}/${encodeURIComponent(page.key)}`,
    lastModified: new Date(page.updated_at),
    changeFrequency: "weekly",
    priority: page.route === "startups" ? 0.8 : 0.6,
  }));

  return [...staticRoutes, ...publicRoutes];
}
