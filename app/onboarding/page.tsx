import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth/session";
import { sql } from "@/lib/db/neon";
import { completeOnboardingAction } from "@/actions/onboarding";
import { Sparkle, ArrowRight } from "@phosphor-icons/react/dist/ssr";

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
  if (!session) {
    redirect("/sign-in");
  }

  const profile = (await sql`
    SELECT onboarding_completed, full_name, bio FROM profiles WHERE id = ${session.userId}::uuid
  `) as { onboarding_completed: boolean; full_name: string; bio: string | null }[];

  if (profile[0]?.onboarding_completed) {
    redirect("/discover");
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
          Personalize your experience. Select all roles that represent what you do.
        </p>

        <form action={completeOnboardingAction} className="mt-8 space-y-8">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#17181B] mb-3">
              Your Primary Roles (Select all that apply)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ROLES.map((role) => (
                <label
                  key={role.id}
                  className="flex items-start gap-3.5 p-3.5 rounded-[16px] border border-[#DADDE1] hover:border-[#17181B] cursor-pointer transition-colors bg-[#F8F9FA] has-checked:border-[#FF4B3E] has-checked:bg-[#FFF5F4]"
                >
                  <input
                    type="checkbox"
                    name="roles"
                    value={role.id}
                    className="mt-1 h-4 w-4 rounded accent-[#FF4B3E]"
                  />
                  <div>
                    <div className="text-sm font-semibold text-[#17181B]">{role.label}</div>
                    <div className="text-xs text-[#666A73]">{role.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-[#DADDE1] pt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#17181B] mb-1.5">
                Quick Bio (Optional)
              </label>
              <textarea
                name="bio"
                defaultValue={profile[0]?.bio || ""}
                rows={2}
                placeholder="What are you building or interested in?"
                className="w-full rounded-[14px] border border-[#DADDE1] px-4 py-2.5 text-sm text-[#17181B] placeholder-[#A0A4AB] focus:border-[#FF4B3E] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#17181B] mb-1.5">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. San Francisco, CA / London / Remote"
                  className="w-full rounded-[14px] border border-[#DADDE1] px-4 py-2 text-sm text-[#17181B] placeholder-[#A0A4AB] focus:border-[#FF4B3E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#17181B] mb-1.5">
                  Portfolio or GitHub (Optional)
                </label>
                <input
                  type="url"
                  name="portfolioUrl"
                  placeholder="https://..."
                  className="w-full rounded-[14px] border border-[#DADDE1] px-4 py-2 text-sm text-[#17181B] placeholder-[#A0A4AB] focus:border-[#FF4B3E] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#17181B] mb-1.5">
                Top Skills or Stack (Optional, comma separated)
              </label>
              <input
                type="text"
                name="skills"
                placeholder="e.g. Next.js, Kotlin, AI/ML, Figma, Growth"
                className="w-full rounded-[14px] border border-[#DADDE1] px-4 py-2 text-sm text-[#17181B] placeholder-[#A0A4AB] focus:border-[#FF4B3E] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="submit"
              className="ink-button inline-flex items-center gap-2 px-6 py-3 font-archivo text-sm font-semibold rounded-full"
            >
              <span>Get Started</span>
              <ArrowRight size={16} weight="bold" />
            </button>

            <span className="text-xs text-[#666A73]">
              You can update your profile anytime.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
