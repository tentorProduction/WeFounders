import type { Metadata } from "next";
import { AgencyContactSection } from "@/components/agency/contact-section";

export const metadata: Metadata = {
  title: "Contact Us — Request a Free Website Quote",
  description: "Get in touch with WeFounders for a free 1-on-1 website consultation and quote within 24 hours.",
};

export default function ContactPage() {
  return (
    <div className="pt-6">
      <AgencyContactSection />
    </div>
  );
}
