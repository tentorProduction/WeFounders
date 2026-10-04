import { getSiteOrigin } from "@/lib/site-url";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteOrigin();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/payments/", "/promote", "/startups/*/promote", "/startups/*/waitlist/", "/dashboard", "/settings", "/onboarding", "/notifications", "/saved", "/following", "/karma", "/submit", "/sign-in", "/sign-up"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
