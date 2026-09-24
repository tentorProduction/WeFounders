import React from "react";
import { AgencyHero } from "@/components/agency/hero";
import { AgencyTrustBar } from "@/components/agency/trust-bar";
import { AgencyServices } from "@/components/agency/services";
import { AgencyPortfolio } from "@/components/agency/portfolio";
import { AgencyProcess } from "@/components/agency/process";
import { AgencyPricing } from "@/components/agency/pricing";
import { AgencyTestimonials } from "@/components/agency/testimonials";
import { AgencyFaq } from "@/components/agency/faq";
import { AgencyContactSection } from "@/components/agency/contact-section";

export const revalidate = 3600;

export default function AgencyHomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AgencyHero />
      <AgencyTrustBar />
      <AgencyServices />
      <AgencyPortfolio />
      <AgencyProcess />
      <AgencyPricing />
      <AgencyTestimonials />
      <AgencyFaq />
      <AgencyContactSection />
    </div>
  );
}
