import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Supabase Storage + common CDNs used for startup logos/screenshots
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  // The /docs/[doc] route reads these markdown files from the repo root at
  // request time — make sure they're bundled in serverless deployments.
  outputFileTracingIncludes: {
    "/docs/[doc]": [
      "./PRD.md",
      "./TRD.md",
      "./DESIGN.md",
      "./FREE_DEPLOYMENT_GUIDE.md.txt",
    ],
  },
};

export default nextConfig;
