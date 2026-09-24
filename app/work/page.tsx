import type { Metadata } from "next";
import { AgencyPortfolio } from "@/components/agency/portfolio";
import { AgencyContactSection } from "@/components/agency/contact-section";

export const metadata: Metadata = {
  title: "Our Work — Portfolio & Client Success Stories",
  description: "Browse our featured client website projects delivered across Kathmandu, Biratnagar, Lalitpur, and Pokhara.",
};

export default function WorkPage() {
  return (
    <div className="pt-6">
      <AgencyPortfolio />
      <AgencyContactSection />
    </div>
  );
}
