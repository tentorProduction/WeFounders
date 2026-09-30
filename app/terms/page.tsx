import { getSiteOrigin } from "@/lib/site-url";
import type { Metadata } from "next";
import Link from "next/link";

const baseUrl = getSiteOrigin();

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using WeFounders to discover startups, publish launches, join waitlists, and complete testing quests.",
  alternates: { canonical: new URL("/terms", baseUrl) },
};

export default function TermsPage() {
  return (
    <article className="site-container max-w-3xl space-y-8 py-10 sm:py-14">
      <header className="space-y-3"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">WeFounders.dev</p><h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Terms of Service</h1><p className="text-sm text-muted-foreground">Last updated: September 25, 2026</p></header>
      <p className="leading-relaxed text-muted-foreground">These terms apply when you browse or use WeFounders.dev. By using the service, you agree to them. If you do not agree, do not use the service. For questions, contact <a className="text-primary underline" href="mailto:hello@wefounders.dev">hello@wefounders.dev</a>.</p>

      <section className="space-y-3"><h2 className="text-xl font-semibold text-foreground">Accounts and conduct</h2><p className="leading-relaxed text-muted-foreground">Use accurate account and submission details, keep control of your sign-in account, and only submit information and materials you have permission to share. Do not impersonate others, interfere with the site, send spam, abuse other members, or use the service for unlawful activity.</p></section>

      <section className="space-y-3"><h2 className="text-xl font-semibold text-foreground">Startup submissions and public content</h2><p className="leading-relaxed text-muted-foreground">You keep ownership of the materials you submit. You give WeFounders permission to store, review, format, and display those materials as needed to operate the service, including showing approved launches to visitors. You are responsible for the accuracy and rights to your content. We may decline, remove, or limit content that violates these terms or harms the community.</p></section>

      <section className="space-y-3"><h2 className="text-xl font-semibold text-foreground">Waitlists, quests, and rewards</h2><p className="leading-relaxed text-muted-foreground">A founder may access the contact details submitted to their startup&apos;s waitlist. Quest instructions and any stated rewards are specific to that quest. Testers must provide honest reports; founders review reports before a reward is accepted. WeFounders does not guarantee that a project, waitlist, or quest will be available or that a particular outcome will occur.</p></section>

      <section className="space-y-3"><h2 className="text-xl font-semibold text-foreground">Paid promotions</h2><p className="leading-relaxed text-muted-foreground">Optional spotlight promotions show their price and duration before checkout. Payments are processed by the selected payment provider. A promotion becomes active only after WeFounders verifies the provider&apos;s payment response. Contact us about a payment using its transaction or reference ID.</p></section>

      <section className="space-y-3"><h2 className="text-xl font-semibold text-foreground">Third-party services</h2><p className="leading-relaxed text-muted-foreground">Sign-in, payments, and linked startup sites may be operated by third parties. Their services have their own terms and privacy practices. WeFounders is not responsible for third-party products or content.</p></section>

      <section className="space-y-3"><h2 className="text-xl font-semibold text-foreground">Availability and changes</h2><p className="leading-relaxed text-muted-foreground">We work to keep the service useful and secure, but do not promise uninterrupted availability. We may change features or these terms; updated terms will appear on this page with a revised date. Continued use after an update means you accept the updated terms.</p></section>

      <section className="space-y-3"><h2 className="text-xl font-semibold text-foreground">Privacy</h2><p className="leading-relaxed text-muted-foreground">Our <Link className="text-primary underline" href="/privacy">Privacy Policy</Link> explains what information we handle and the choices available to you.</p></section>
    </article>
  );
}
