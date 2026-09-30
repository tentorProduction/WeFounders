import { getSiteOrigin } from "@/lib/site-url";
import type { Metadata } from "next";

const baseUrl = getSiteOrigin();

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How WeFounders collects, uses, and protects account, startup, waitlist, and testing information.",
  alternates: { canonical: new URL("/privacy", baseUrl) },
};

export default function PrivacyPage() {
  return (
    <article className="site-container max-w-3xl space-y-8 py-10 sm:py-14">
      <header className="space-y-3"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">WeFounders.dev</p><h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Privacy Policy</h1><p className="text-sm text-muted-foreground">Last updated: September 25, 2026</p></header>
      <p className="leading-relaxed text-muted-foreground">This policy describes the information WeFounders handles when you browse the site, sign in, launch a product, join a waitlist, or submit a testing report. Contact <a className="text-primary underline" href="mailto:hello@wefounders.dev">hello@wefounders.dev</a> with privacy questions or requests.</p>

      <section className="space-y-3"><h2 className="text-xl font-semibold text-foreground">Information we receive</h2><ul className="list-disc space-y-2 pl-5 text-muted-foreground"><li><strong className="text-foreground">Account details:</strong> Google account email, name, profile image, and a Firebase user identifier when you sign in.</li><li><strong className="text-foreground">Profile and product details:</strong> usernames, profile information, startup name, pitch, links, media, market, tags, and comments you provide.</li><li><strong className="text-foreground">Waitlist details:</strong> email address and any optional phone, note, or referral details a visitor submits for a startup. The startup founder can access those leads.</li><li><strong className="text-foreground">Quest reports:</strong> tester name, written feedback, ratings, proof links, and device details included with a report.</li><li><strong className="text-foreground">Promotion records:</strong> payment provider, amount, reference and transaction identifiers, and payment status. eSewa or Khalti handles the checkout; WeFounders does not ask you to enter payment credentials into its own forms.</li></ul></section>

      <section className="space-y-3"><h2 className="text-xl font-semibold text-foreground">How we use information</h2><p className="leading-relaxed text-muted-foreground">We use it to operate accounts, publish approved launches, deliver waitlist leads to the relevant founder, administer testing quests and rewards, process and verify promotions, protect the service, and respond to support requests.</p></section>

      <section className="space-y-3"><h2 className="text-xl font-semibold text-foreground">What is public</h2><p className="leading-relaxed text-muted-foreground">Approved startup pages, their submitted product materials, and selected public profile details such as display name, username, avatar, and community score may be visible to visitors. Waitlist email addresses and phone numbers are not shown on public startup pages. Do not include secrets or sensitive personal information in a public pitch, comment, or quest report.</p></section>

      <section className="space-y-3"><h2 className="text-xl font-semibold text-foreground">Service providers and storage</h2><p className="leading-relaxed text-muted-foreground">We use Firebase and Google for sign-in, Supabase for application data and storage, and eSewa or Khalti when you choose a paid promotion. If Google Analytics is configured for this deployment, its script loads only after you allow optional analytics in Cookie settings. We do not load that analytics script when it is unconfigured or declined.</p></section>

      <section className="space-y-3"><h2 className="text-xl font-semibold text-foreground">Cookies and local storage</h2><p className="leading-relaxed text-muted-foreground">Sign-in requires essential Firebase state and a secure, HTTP-only server session cookie. When optional analytics is enabled, your allow or reject choice is stored in this browser so we can honor it on later visits. You can change that choice using Cookie settings in the footer.</p></section>

      <section className="space-y-3"><h2 className="text-xl font-semibold text-foreground">Retention and your choices</h2><p className="leading-relaxed text-muted-foreground">We keep account and product information while it is needed to operate the service, meet payment and security obligations, or resolve disputes. Founders can export their waitlist leads from their startup page. To request access, correction, or deletion of account information, email us from the address on the account. Some public startup information or payment records may need to remain available for service, safety, or accounting reasons.</p></section>

      <section className="space-y-3"><h2 className="text-xl font-semibold text-foreground">Children</h2><p className="leading-relaxed text-muted-foreground">WeFounders is intended for founders and testers old enough to use the service under the laws that apply to them. Do not submit another person&apos;s information without permission.</p></section>
    </article>
  );
}
