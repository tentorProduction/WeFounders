import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ...(process.env.NODE_ENV === "production"
        ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
        : []),
    ];
    return [{ source: "/:path*", headers: securityHeaders }];
  },
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
