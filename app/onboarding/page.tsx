import { readSession } from "@/lib/auth/session";
import { sql } from "@/lib/db/neon";
import { Sparkle, ArrowRight, CheckCircle, Rocket } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Welcome to WeFounders — Set up your profile",
  description: "Select your role and customize your builder profile.",
};

const ROLES = [
  { id: "founder", label: "Founder", desc: "Building & launching new startups" },
  { id: "builder", label: "Builder", desc: "Full-stack engineer & creator" },
  { id: "tester", label: "Beta Tester", desc: "Testing products & earning Karma" },
  { id: "designer", label: "Designer", desc: "Product, UI & visual craft" },
  { id: "developer", label: "Developer", desc: "Frontend, backend & systems" },
  { id: "marketer", label: "Marketer", desc: "Growth, content & distribution" },
  { id: "investor", label: "Investor / Advisor", desc: "Backing and advising teams" },
];

export default async function OnboardingPage() {
  const session = await readSession();

  // If visitor is unauthenticated, render a clean sign-in screen
  if (!session) {
    return (
      <div className="site-container min-h-[75vh] py-12 flex items-center justify-center">
        <div className="w-full max-w-md bg-white border border-[#DADDE1] rounded-[28px] p-8 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF5F4] text-[#FF4B3E] flex items-center justify-center mx-auto">
            <Rocket size={24} weight="fill" />
          </div>
          <h1 className="font-archivo text-2xl font-bold text-[#17181B] tracking-tight">
            Sign In to Complete Setup
          </h1>
          <p className="text-xs text-[#666A73] leading-relaxed">
            Connect your account to finish onboarding and customize your builder profile.
          </p>
          <div className="pt-2 flex justify-center">
            <Link
              href="/sign-in?redirect_url=/onboarding"
              className="ink-button inline-flex items-center justify-center gap-1.5 px-6 py-2.5 text-xs font-semibold rounded-full"
            >
              <span>Continue to Sign In</span>
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Resiliently query current profile
  let profile: { onboarding_completed?: boolean; full_name?: string; bio?: string | null } | null = null;
  try {
    const rows = (await sql`
      SELECT onboarding_completed, full_name, bio FROM profiles WHERE id = ${session.userId}::uuid
    `) as { onboarding_completed: boolean; full_name: string; bio: string | null }[];
    profile = rows[0] ?? null;
  } catch (err) {
    console.error("[onboarding] failed to query profile:", err);
  }

  // If already onboarded, present direct next step
  if (profile?.onboarding_completed) {
    return (
      <div className="site-container min-h-[75vh] py-12 flex items-center justify-center">
        <div className="w-full max-w-md bg-white border border-[#DADDE1] rounded-[28px] p-8 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center mx-auto">
            <CheckCircle size={24} weight="fill" />
          </div>
          <h1 className="font-archivo text-2xl font-bold text-[#17181B] tracking-tight">
            Profile Setup Complete
          </h1>
          <p className="text-xs text-[#666A73] leading-relaxed">
            Your builder profile is already configured and active in the community.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link
              href="/discover"
              className="ink-button w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-2.5 text-xs font-semibold rounded-full"
            >
              <span>Explore Launches</span>
              <ArrowRight size={14} weight="bold" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 text-xs font-semibold rounded-full border border-[#DADDE1] text-[#17181B] hover:bg-[#F8F9FA] transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="site-container min-h-[85vh] py-12 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white border border-[#DADDE1] rounded-[28px] p-6 sm:p-10 shadow-xs">
        <div className="flex items-center gap-2.5 text-[#FF4B3E] font-semibold text-xs uppercase tracking-wider mb-2">
          <Sparkle size={18} weight="fill" />
          <span>Quick 60-Second Setup</span>
        </div>

        <h1 className="font-archivo text-2xl sm:text-3xl font-bold text-[#17181B] tracking-tight">
          What brings you to WeFounders?
        </h1>
        <p className="mt-2 text-sm text-[#666A73]">
          Personalize your experience. Every field is required to build a trusted founder & tester network.
        </p>

        <OnboardingForm roles={ROLES} initialBio={profile?.bio || ""} />
      </div>
    </div>
  );
}
