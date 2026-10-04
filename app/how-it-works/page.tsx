import Link from "next/link";
import type { Metadata } from "next";
import { getSiteOrigin } from "@/lib/site-url";
import {
  Rocket,
  Flask,
  ArrowRight,
  CheckCircle,
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "How It Works — Launch, Test, and Ship | WeFounders",
  description:
    "Learn how WeFounders connects ambitious founders with passionate beta testers and builders to launch, test, and scale world-class software.",
  alternates: {
    canonical: new URL("/how-it-works", getSiteOrigin()),
  },
  openGraph: {
    title: "How WeFounders Works — The Global Startup Launchpad",
    description:
      "A complete guide for founders launching products and testers earning Karma by completing beta testing quests.",
    url: new URL("/how-it-works", getSiteOrigin()),
    type: "website",
  },
};

const FAQS = [
  {
    question: "What is WeFounders?",
    answer:
      "WeFounders is a global launchpad and beta testing platform that connects early-stage founders with verified testers, builders, and early adopters. Founders ship products and create testing challenges, while community members test software, report bugs, provide UX feedback, and earn Karma.",
  },
  {
    question: "How do founders launch a startup on WeFounders?",
    answer:
      "Founders sign up, click 'Launch Startup', and fill in their product details (pitch, website URL, problem/solution, screenshots, video demo). Once submitted, the launch is reviewed and listed in the public directory where the community can discover, upvote, and follow the product.",
  },
  {
    question: "What are Testing Quests?",
    answer:
      "Testing Quests are structured beta testing tasks posted by founders. Each quest specifies instructions, target devices (e.g., iOS, Android, Desktop Chrome), testing scope, and rewards. Testers accept the quest, complete the test, submit structured feedback and screenshots, and receive Karma upon founder approval.",
  },
  {
    question: "What is Karma and how does it work?",
    answer:
      "Karma is the reputation currency of WeFounders. Testers earn Karma by submitting high-quality bug reports and testing feedback. Founders earn Karma by launching products, shipping changelog updates, and engaging constructively with the community. Top members appear on the global Leaderboard.",
  },
  {
    question: "Can anyone browse and view startups on WeFounders?",
    answer:
      "Yes. All startup showcase pages, product directories, and leaderboards are completely public and accessible without logging in. An account is only required when you want to upvote, bookmark, join beta quests, comment, or launch a product.",
  },
];

export default function HowItWorksPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HowTo",
        "name": "How to Launch and Test Products on WeFounders",
        "description": "Step-by-step guide for founders to launch startups and for builders to test betas on WeFounders.",
        "step": [
          {
            "@type": "HowToStep",
            "position": 1,
            "name": "Submit Your Launch",
            "text": "Submit your product name, pitch, website, and target audience to the WeFounders directory.",
          },
          {
            "@type": "HowToStep",
            "position": 2,
            "name": "Create Testing Quests",
            "text": "Define specific testing challenges, target devices, and feedback criteria for beta testers.",
          },
          {
            "@type": "HowToStep",
            "position": 3,
            "name": "Collect Validated Feedback",
            "text": "Review submissions, accept bug reports, reward testers with Karma, and iterate with confidence.",
          },
        ],
      },
      {
        "@type": "FAQPage",
        "mainEntity": FAQS.map((faq) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <div className="site-container py-10 sm:py-16 space-y-16 max-w-4xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <div className="text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#FF4B3E] bg-[#FFF5F4] px-3 py-1 rounded-full border border-[#FF4B3E]/20">
          The WeFounders Lifecycle
        </span>
        <h1 className="font-archivo text-3xl sm:text-5xl font-bold text-[#17181B] tracking-tight">
          How WeFounders Works
        </h1>
        <p className="text-base sm:text-lg text-[#666A73] max-w-2xl mx-auto leading-relaxed">
          From first prototype to global traction. WeFounders bridges the gap between shipping code and finding dedicated early adopters.
        </p>
      </div>

      {/* Two Sides: For Founders & For Testers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Founders Flow */}
        <div className="rounded-2xl border border-[#DADDE1] bg-white p-6 sm:p-8 space-y-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#FFF5F4] text-[#FF4B3E] flex items-center justify-center">
                <Rocket size={24} weight="bold" />
              </div>
              <div>
                <h2 className="font-archivo text-xl font-bold text-[#17181B]">For Founders</h2>
                <p className="text-xs text-[#666A73]">Launch, test, and recruit early adopters</p>
              </div>
            </div>

            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-[#17181B] text-white flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#17181B]">List Your Startup</h3>
                  <p className="text-xs text-[#666A73] mt-0.5">
                    Create a public showcase with your tagline, problem statement, demo video, and website link.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-[#17181B] text-white flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#17181B]">Post Testing Quests</h3>
                  <p className="text-xs text-[#666A73] mt-0.5">
                    Define targeted tasks (e.g. signup flow, speed, UI usability) with specific device requirements.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-[#17181B] text-white flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#17181B]">Receive Actionable Feedback</h3>
                  <p className="text-xs text-[#666A73] mt-0.5">
                    Review structured bug reports and ratings from genuine builders, award Karma, and iterate.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <Link
            href="/submit"
            className="ink-button flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold"
          >
            <span>Launch Your Startup</span>
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>

        {/* Testers Flow */}
        <div className="rounded-2xl border border-[#DADDE1] bg-white p-6 sm:p-8 space-y-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
                <Flask size={24} weight="bold" />
              </div>
              <div>
                <h2 className="font-archivo text-xl font-bold text-[#17181B]">For Testers & Builders</h2>
                <p className="text-xs text-[#666A73]">Explore early software and earn Karma</p>
              </div>
            </div>

            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-[#059669] text-white flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#17181B]">Discover Live Quests</h3>
                  <p className="text-xs text-[#666A73] mt-0.5">
                    Explore active challenges across AI, SaaS, Mobile, and Web tools looking for testers.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-[#059669] text-white flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#17181B]">Test & Submit Proof</h3>
                  <p className="text-xs text-[#666A73] mt-0.5">
                    Complete the testing instructions, note performance or UX issues, and upload screenshots.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-[#059669] text-white flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#17181B]">Earn Karma & Reputation</h3>
                  <p className="text-xs text-[#666A73] mt-0.5">
                    Gain verified tester status, climb the global leaderboard, and get discovered by founders.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <Link
            href="/quests"
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold bg-[#F0F2F5] text-[#17181B] hover:bg-[#E4E7EB] transition-colors"
          >
            <span>Browse Active Quests</span>
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>
      </div>

      {/* Frequently Asked Questions (AEO Target) */}
      <div className="space-y-6 pt-6">
        <div className="text-center space-y-2">
          <h2 className="font-archivo text-2xl font-bold text-[#17181B]">Frequently Asked Questions</h2>
          <p className="text-xs text-[#666A73]">Direct answers to common questions about the platform.</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-[#DADDE1] bg-white p-5 sm:p-6 space-y-2 shadow-xs"
            >
              <h3 className="font-archivo text-base font-bold text-[#17181B] flex items-center gap-2">
                <CheckCircle size={18} weight="fill" className="text-[#059669] shrink-0" />
                <span>{faq.question}</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#666A73] leading-relaxed pl-6.5">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
