import type { Metadata } from "next";
import { AgencyServices } from "@/components/agency/services";
import { AgencyContactSection } from "@/components/agency/contact-section";

export const metadata: Metadata = {
  title: "Services — Website Design & Development",
  description: "Explore our web design, e-commerce, SEO, and speed optimization services for small businesses in Nepal.",
};

export default function ServicesPage() {
  return (
    <div className="pt-6">
      <AgencyServices />
      <AgencyContactSection />
    </div>
  );
}
