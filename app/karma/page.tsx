import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth/session";
import { sql } from "@/lib/db/neon";
import { getUserKarmaHistory } from "@/lib/data/karma";
import { Medal, Sparkle, Trophy, CheckCircle, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Karma & Reputation — WeFounders",
  description: "Track your builder Karma, testing reputation, and community achievements.",
};

const RULES = [
  { points: "+50", title: "Launch a Startup", desc: "Submit and launch a verified product on WeFounders" },
  { points: "+25", title: "Verified Bug Report", desc: "Report reproducible bugs with screenshots/steps" },
  { points: "+20", title: "Complete Testing Quest", desc: "Finish founder-assigned test scenarios" },
  { points: "+15", title: "Founder Collaboration", desc: "Provide high-signal product feedback or help" },
  { points: "+10", title: "Constructive Feedback", desc: "Submit helpful suggestions on beta launches" },
];

export default async function KarmaPage() {
  const session = await readSession();
  if (!session) {
    redirect("/sign-in");
  }

  const profile = (await sql`
    SELECT karma_score, full_name, username FROM profiles WHERE id = ${session.userId}::uuid
  `) as { karma_score: number; full_name: string; username: string }[];

  const karma = profile[0]?.karma_score || 0;
  const history = await getUserKarmaHistory(session.userId);

  return (
    <div className="site-container py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="godly-card bg-white border border-[#DADDE1] rounded-[28px] p-6 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[#FF4B3E] font-semibold text-xs uppercase tracking-wider mb-2">
            <Trophy size={18} weight="fill" />
            <span>Reputation Engine</span>
          </div>
          <h1 className="font-archivo text-2xl sm:text-4xl font-bold text-[#17181B] tracking-tight">
            Your Community Karma
          </h1>
          <p className="mt-2 text-sm text-[#666A73] max-w-xl">
            Karma represents your trustworthiness, testing contributions, and builder reputation across the global WeFounders network.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#F8F9FA] border border-[#DADDE1] p-5 rounded-[22px] shrink-0">
          <div className="h-12 w-12 rounded-full bg-[#FFF5F4] text-[#FF4B3E] flex items-center justify-center font-bold text-xl">
            <Sparkle size={24} weight="fill" />
          </div>
          <div>
            <div className="text-3xl font-extrabold font-archivo text-[#17181B]">
              {karma}
            </div>
            <div className="text-xs uppercase font-semibold text-[#666A73] tracking-wider">
              Total Karma Points
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Karma History */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-archivo text-lg font-bold text-[#17181B]">
              Transaction History
            </h2>
            <span className="text-xs text-[#666A73] font-medium">
              {history.length} records
            </span>
          </div>

          <div className="bg-white border border-[#DADDE1] rounded-[22px] divide-y divide-[#DADDE1] overflow-hidden">
            {history.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <Medal size={36} className="mx-auto text-[#A0A4AB]" />
                <p className="text-sm font-semibold text-[#17181B]">No Karma transactions yet</p>
                <p className="text-xs text-[#666A73] max-w-sm mx-auto">
                  Earn your first Karma points by testing products in our testing marketplace or launching your startup.
                </p>
                <Link
                  href="/quests"
                  className="ink-button inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full mt-2"
                >
                  <span>Explore Quests</span>
                  <ArrowUpRight size={14} weight="bold" />
                </Link>
              </div>
            ) : (
              history.map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#F8F9FA] transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#17181B] truncate">{tx.reason}</p>
                    <p className="text-xs text-[#666A73]">{new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="shrink-0 text-sm font-bold font-mono text-[#059669]">
                    +{tx.amount}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* How to Earn */}
        <div className="space-y-4">
          <h2 className="font-archivo text-lg font-bold text-[#17181B]">
            How to Earn Karma
          </h2>

          <div className="bg-white border border-[#DADDE1] rounded-[22px] p-5 space-y-3.5">
            {RULES.map((rule, idx) => (
              <div key={idx} className="flex items-start gap-3 pb-3 border-b border-[#F0F2F5] last:border-0 last:pb-0">
                <span className="text-xs font-extrabold font-mono text-[#FF4B3E] bg-[#FFF5F4] px-2 py-0.5 rounded-full shrink-0">
                  {rule.points}
                </span>
                <div>
                  <h4 className="text-xs font-semibold text-[#17181B]">{rule.title}</h4>
                  <p className="text-[11px] text-[#666A73] mt-0.5">{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-[22px] bg-[#17181B] text-white space-y-2">
            <h4 className="text-sm font-semibold font-archivo flex items-center gap-2">
              <CheckCircle size={16} weight="fill" className="text-[#34D399]" />
              <span>Anti-Manipulation</span>
            </h4>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Karma transactions are verified on-chain in our audit ledger. Self-upvoting or duplicated submissions are blocked server-side.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
