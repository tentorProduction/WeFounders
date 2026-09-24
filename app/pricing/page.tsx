import type { Metadata } from "next";
import { AgencyPricing } from "@/components/agency/pricing";
import { AgencyFaq } from "@/components/agency/faq";

export const metadata: Metadata = {
  title: "Pricing — Affordable NPR Website Packages",
  description: "Transparent website design pricing starting at NPR 15,000 for small businesses in Nepal. Zero hidden fees.",
};

export default function PricingPage() {
  return (
    <div className="pt-6">
      <AgencyPricing />
      <AgencyFaq />
    </div>
  );
}
