import { readSession } from "@/lib/auth/session";
import { sql } from "@/lib/db/neon";
import { Flask, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

interface TesterSubmission {
  id: string;
  quest_id: string;
  status: string;
  quest_title: string;
  reward_description?: string;
  startup_name: string;
  startup_slug: string;
  created_at: string;
  feedback_text?: string;
  founder_feedback?: string;
}

interface AvailableQuest {
  id: string;
  title: string;
  reward_description?: string;
  startup_name: string;
  startup_slug: string;
  submissions_count?: number;
  max_submissions?: number;
}

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tester Dashboard — WeFounders",
  description: "Track your active testing quests, feedback submissions, and earned Karma rewards.",
};

export default async function TesterDashboardPage() {
  const session = await readSession();
  if (!session) {
    return (
      <div className="site-container py-16 sm:py-24">
        <div className="max-w-md mx-auto bg-white border border-[#DADDE1] rounded-[24px] p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF5F4] text-[#FF4B3E] flex items-center justify-center mx-auto">
            <Flask size={28} weight="fill" />
          </div>
          <h1 className="font-archivo text-2xl font-bold text-[#17181B] tracking-tight">
            Sign In to Tester Dashboard
          </h1>
          <p className="text-xs text-[#666A73] leading-relaxed">
            Connect your account to track your test reports, complete testing quests, and view earned Karma.
          </p>
          <div className="pt-2 flex justify-center">
            <Link
              href="/sign-in?redirect_url=/dashboard/tester"
              className="ink-button rounded-full px-6 py-2.5 text-xs font-semibold"
            >
              Continue to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get tester submissions
  const submissions = (await sql`
    SELECT qs.*, q.title as quest_title, q.reward_description, s.name as startup_name, s.slug as startup_slug
    FROM quest_submissions qs
    JOIN testing_quests q ON qs.quest_id = q.id
    JOIN startups s ON q.startup_id = s.id
    WHERE qs.tester_id = ${session.userId}::uuid
    ORDER BY qs.created_at DESC
  `) as unknown as TesterSubmission[];

  // Get available active quests
  const availableQuests = (await sql`
    SELECT q.*, s.name as startup_name, s.slug as startup_slug, s.logo_url as startup_logo
    FROM testing_quests q
    JOIN startups s ON q.startup_id = s.id
    WHERE q.status = 'active'
    ORDER BY q.created_at DESC
    LIMIT 6
  `) as unknown as AvailableQuest[];

  const acceptedCount = submissions.filter((s) => s.status === "accepted").length;
  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  return (
    <div className="site-container py-8 sm:py-12 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DADDE1] pb-6">
        <div>
          <div className="flex items-center gap-2 text-[#FF4B3E] font-semibold text-xs uppercase tracking-wider mb-1">
            <Flask size={16} weight="fill" />
            <span>Tester Marketplace</span>
          </div>
          <h1 className="font-archivo text-2xl sm:text-4xl font-bold text-[#17181B] tracking-tight">
            Tester Dashboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#666A73]">
            Complete testing challenges, uncover edge cases, and build your builder reputation.
          </p>
        </div>

        <Link
          href="/quests"
          className="ink-button inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-full"
        >
          <span>Browse All Quests</span>
          <ArrowUpRight size={14} weight="bold" />
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#DADDE1] rounded-[22px] p-5 space-y-1">
          <div className="text-xs uppercase font-semibold text-[#666A73] tracking-wider">Reports Filed</div>
          <div className="text-3xl font-extrabold font-archivo text-[#17181B]">{submissions.length}</div>
          <div className="text-[11px] text-[#666A73]">Total submissions</div>
        </div>

        <div className="bg-white border border-[#DADDE1] rounded-[22px] p-5 space-y-1">
          <div className="text-xs uppercase font-semibold text-[#666A73] tracking-wider">Accepted Reports</div>
          <div className="text-3xl font-extrabold font-archivo text-[#17181B]">{acceptedCount}</div>
          <div className="text-[11px] text-[#059669] font-medium">Verified by founders</div>
        </div>

        <div className="bg-white border border-[#DADDE1] rounded-[22px] p-5 space-y-1">
          <div className="text-xs uppercase font-semibold text-[#666A73] tracking-wider">Under Review</div>
          <div className="text-3xl font-extrabold font-archivo text-[#17181B]">{pendingCount}</div>
          <div className="text-[11px] text-[#F59E0B]">Pending founder review</div>
        </div>

        <div className="bg-white border border-[#DADDE1] rounded-[22px] p-5 space-y-1">
          <div className="text-xs uppercase font-semibold text-[#666A73] tracking-wider">Karma Balance</div>
          <div className="text-3xl font-extrabold font-archivo text-[#17181B]">
            <Link href="/karma" className="hover:text-[#FF4B3E]">
              View Karma →
            </Link>
          </div>
          <div className="text-[11px] text-[#666A73]">Audited reputation ledger</div>
        </div>
      </div>

      {/* Submissions & Available Quests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: My Submissions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-archivo text-lg font-bold text-[#17181B]">
            Your Test Reports
          </h2>

          {submissions.length === 0 ? (
            <div className="bg-white border border-[#DADDE1] rounded-[22px] p-10 text-center space-y-3">
              <Flask size={32} className="mx-auto text-[#A0A4AB]" />
              <p className="text-sm font-semibold text-[#17181B]">No test submissions yet</p>
              <p className="text-xs text-[#666A73] max-w-sm mx-auto">
                Pick an open quest from the marketplace, test the product, and submit your bug report or UX rating.
              </p>
              <Link
                href="/quests"
                className="ink-button inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full mt-2"
              >
                <span>Find a Quest</span>
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-[#DADDE1] rounded-[22px] divide-y divide-[#DADDE1] overflow-hidden">
              {submissions.map((sub) => (
                <div key={sub.id} className="p-4 sm:p-5 space-y-2 hover:bg-[#F8F9FA] transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#666A73]">{sub.startup_name}</span>
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                        sub.status === "accepted"
                          ? "bg-[#ECFDF5] text-[#059669]"
                          : sub.status === "rejected"
                          ? "bg-[#FEF2F2] text-[#DC2626]"
                          : "bg-[#FFFBEB] text-[#D97706]"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>
                  <h4 className="font-archivo text-sm font-bold text-[#17181B]">{sub.quest_title}</h4>
                  <p className="text-xs text-[#666A73] line-clamp-2">{sub.feedback_text}</p>
                  {sub.founder_feedback && (
                    <div className="p-2.5 rounded-[12px] bg-[#F0F2F5] text-xs text-[#17181B] mt-2">
                      <span className="font-semibold text-[#FF4B3E]">Founder Note: </span>
                      {sub.founder_feedback}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Open Testing Quests */}
        <div className="space-y-4">
          <h2 className="font-archivo text-lg font-bold text-[#17181B]">
            Available Quests
          </h2>

          <div className="space-y-3">
            {availableQuests.map((q) => (
              <div key={q.id} className="bg-white border border-[#DADDE1] rounded-[20px] p-4 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#666A73]">
                  <span>{q.startup_name}</span>
                  <span className="text-[#059669] font-bold">{q.reward_description}</span>
                </div>
                <h4 className="font-archivo text-xs sm:text-sm font-bold text-[#17181B]">{q.title}</h4>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[#A0A4AB]">
                    {q.submissions_count}/{q.max_submissions} slots
                  </span>
                  <Link
                    href={`/startups/${q.startup_slug}`}
                    className="text-xs font-semibold text-[#FF4B3E] hover:underline"
                  >
                    View Quest →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
