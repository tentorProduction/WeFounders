import { getSiteOrigin } from "@/lib/site-url";
import type { Metadata } from "next";

const baseUrl = getSiteOrigin();

export const metadata: Metadata = {
  title: "Submit Your Startup",
  description: "Submit your product for review and launch to the WeFounders builder community.",
  alternates: { canonical: new URL("/submit", baseUrl) },
};

export default function SubmitLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
