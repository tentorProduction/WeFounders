import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import { AnnouncementBanner } from "@/components/layout/announcement-banner";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/firebase/auth-context";

import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.wefounders.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "WeFounders — Nepal's Startup Launch & Beta Platform",
    template: "%s · WeFounders",
  },
  description:
    "WeFounders is Nepal's premiere launchpad for world-class startups. Discover new products, get early beta users, upvote, and track local founder bounties.",
  keywords: [
    "WeFounders",
    "Nepal startups",
    "Launchpad",
    "BetaList Nepal",
    "Nepali products",
    "Tech startups",
    "eSewa payments",
    "Khalti billing",
    "Katmandu builders",
  ],
  authors: [{ name: "WeFounders Team", url: siteUrl }],
  creator: "WeFounders",
  publisher: "WeFounders.dev",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "WeFounders — Nepal's Startup Launch & Beta Platform",
    description:
      "Get your first 1,000 beta users from Nepal's builder community. Discover, test, upvote, and launch tech products built in Nepal and for the world.",
    url: siteUrl,
    siteName: "WeFounders",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WeFounders — Nepal's Startup Launch & Beta Platform",
    description:
      "Nepal's premiere launchpad for world-class startups. Discover, upvote, and launch tech products.",
    creator: "@wefounders_dev",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#09090B" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "WeFounders",
      url: siteUrl,
      logo: `${siteUrl}/icon.svg`,
      sameAs: [
        "https://twitter.com/wefounders_dev",
        "https://linkedin.com/company/wefounders-dev",
        "https://github.com/tentorProduction/WeFounders",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "WeFounders",
      description: "Nepal's Startup Launch & Beta Platform",
      publisher: { "@id": `${siteUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans bg-background text-foreground min-h-screen">
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex min-h-screen flex-col pb-20 sm:pb-0">
              <AnnouncementBanner />
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
            <MobileNav />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
