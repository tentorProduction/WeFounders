import { getSiteOrigin } from "@/lib/site-url";
import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Serif, IBM_Plex_Mono } from "next/font/google";

import { SiteChrome } from "@/components/layout/site-chrome";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CookieConsent } from "@/components/privacy/cookie-consent";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/firebase/auth-context";

import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-archivo",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-instrument",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-ibm-mono",
});

const siteUrl = getSiteOrigin();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "WeFounders — Nepal's Startup Launch & Beta Platform",
    template: "%s · WeFounders",
  },
  description:
    "WeFounders is Nepal's launchpad for world-class startups. Discover new products, get early beta users, upvote, and track local founder bounties.",
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
  openGraph: {
    siteName: "WeFounders",
    locale: "en_US",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "WeFounders — startup launches from Nepal" }],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@wefounders_dev",
    images: ["/opengraph-image"],
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
  themeColor: "#F2F3F5",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "WeFounders",
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
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
      className={`${archivo.variable} ${instrumentSerif.variable} ${ibmPlexMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans bg-background text-foreground min-h-screen">
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
            <SiteChrome header={<SiteHeader />} footer={<SiteFooter />}>{children}</SiteChrome>
            <CookieConsent measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
