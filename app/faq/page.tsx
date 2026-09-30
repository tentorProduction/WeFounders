import { getSiteOrigin } from "@/lib/site-url";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const baseUrl = getSiteOrigin();

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about launching a product, joining a beta waitlist, and testing quests on WeFounders.",
  alternates: { canonical: new URL("/faq", baseUrl) },
};

const questions = [
  { q: "How do I launch a startup on WeFounders?", a: <>Sign in with Google, complete the four-step submission form, and send it for review. We publish accepted startups after review. Start with <Link className="text-primary underline" href="/submit">Submit your startup</Link>.</> },
  { q: "Does it cost anything to submit?", a: "Standard startup submissions are free. Paid spotlight promotion is optional and uses the eSewa or Khalti checkout shown before payment." },
  { q: "How long does review take?", a: "Every submission is reviewed, but we do not promise a fixed review time. You can see your submission status from your profile." },
  { q: "Can I submit a product for customers outside Nepal?", a: "Yes. Choose Made for Nepal, Built for World, or Hybrid Focus in the submission form." },
  { q: "How do I join a testing quest?", a: <>Open <Link className="text-primary underline" href="/quests">Testing Quests</Link>, choose an active task, follow its instructions, and file a report. Any listed reward is subject to the quest terms and founder review.</> },
  { q: "Who can see my waitlist details?", a: "A founder can access the contact details submitted to that startup’s waitlist. Those details are not displayed on the public startup page." },
  { q: "How can I request an update or removal of my information?", a: <>Email <a className="text-primary underline" href="mailto:hello@wefounders.dev">hello@wefounders.dev</a> from the account address and describe your request.</> },
];

export default function FAQPage() {
  return (
    <div className="site-container max-w-3xl space-y-8 py-10 sm:py-14">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Help center</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Frequently asked questions</h1>
        <p className="max-w-2xl text-muted-foreground">A quick guide to launching, testing, and growing products with the WeFounders community.</p>
      </header>
      <div className="divide-y divide-border rounded-xl border border-border bg-card px-5 sm:px-6">
        {questions.map(({ q, a }) => <details key={q} className="group py-5"><summary className="cursor-pointer list-none pr-6 font-semibold text-foreground marker:hidden">{q}<span aria-hidden className="float-right text-primary group-open:rotate-45">+</span></summary><p className="mt-3 leading-relaxed text-muted-foreground">{a}</p></details>)}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">Ready to share what you are building?</p>
        <Button asChild><Link href="/submit">Submit your startup <ArrowRight className="ml-1.5 h-4 w-4" /></Link></Button>
      </div>
    </div>
  );
}
