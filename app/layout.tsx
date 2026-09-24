import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { FloatingContact } from "@/components/layout/floating-contact";
import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

const siteUrl = "https://www.wefounders.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Affordable Website Design & Development in Nepal | WeFounders",
    template: "%s | WeFounders Agency",
  },
  description:
    "WeFounders builds professional, mobile-optimized business websites, e-commerce stores with eSewa & Khalti, and landing pages in Nepal starting at NPR 15,000. Launched in 2–3 weeks.",
  keywords: [
    "Web design agency Nepal",
    "Website development Nepal",
    "Affordable website design Kathmandu",
    "E-commerce website Nepal",
    "eSewa payment integration website",
    "Khalti payment integration",
    "WeFounders agency",
    "Website design cost Nepal",
  ],
  authors: [{ name: "WeFounders Agency", url: siteUrl }],
  creator: "WeFounders Agency",
  publisher: "WeFounders",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Affordable Website Design & Development in Nepal | WeFounders",
    description:
      "Professional business websites starting at NPR 15,000 — launched in 2–3 weeks with mobile optimization & WhatsApp support.",
    url: siteUrl,
    siteName: "WeFounders Agency",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "WeFounders Agency — Affordable Web Design & Development in Nepal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Affordable Website Design & Development in Nepal | WeFounders",
    description:
      "Professional business websites starting at NPR 15,000 — launched in 2–3 weeks.",
    images: [`${siteUrl}/og-image.png`],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#09090B" },
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
      <body className="font-sans bg-background text-foreground min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <FloatingContact />
        </ThemeProvider>
      </body>
    </html>
  );
}
