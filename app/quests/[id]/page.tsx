import { notFound } from "next/navigation";
import { getQuestById } from "@/lib/data/quests";
import { readSession } from "@/lib/auth/session";
import { QuestActionButton } from "@/components/quests/quest-action-button";
import { SaveButton } from "@/components/platform/save-button";
import { isItemSaved } from "@/lib/data/saved";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { StartupLogo } from "@/components/startups/startup-logo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quest = await getQuestById(id);
  if (!quest) return { title: "Quest Not Found — WeFounders" };

  return {
    title: `${quest.title} — Testing Quest on WeFounders`,
    description: quest.task_instructions.slice(0, 160),
  };
}

export default async function QuestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quest = await getQuestById(id);

  if (!quest) {
    notFound();
  }

  const session = await readSession();
  const saved = session ? await isItemSaved(session.userId, "quest", quest.id) : false;
  const isFull = quest.submissions_count >= quest.max_submissions;

  return (
    <div className="site-container py-8 sm:py-12 space-y-8 max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/quests"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#666A73] hover:text-[#17181B] transition-colors"
        >
          <ArrowLeft size={14} weight="bold" />
          <span>Back to Quest Marketplace</span>
        </Link>
      </div>

      {/* Quest Hero Card */}
      <div className="godly-card bg-white border border-[#DADDE1] rounded-[28px] p-6 sm:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <StartupLogo
              name={quest.startup.name}
              logoUrl={quest.startup.logo_url}
              seed={quest.startup.slug}
              size={64}
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Link
                  href={`/startups/${quest.startup.slug}`}
                  className="text-xs font-semibold text-[#FF4B3E] hover:underline"
                >
                  {quest.startup.name}
                </Link>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#ECFDF5] text-[#059669]">
                  {quest.status}
                </span>
              </div>
              <h1 className="font-archivo text-xl sm:text-3xl font-bold text-[#17181B] tracking-tight">
                {quest.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <SaveButton itemType="quest" itemId={quest.id} initialSaved={saved} showLabel />
          </div>
        </div>

        {/* Quest Parameters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-b border-[#DADDE1] py-4">
          <div>
            <span className="text-[11px] uppercase font-semibold text-[#666A73] tracking-wider block">Reward</span>
            <span className="font-archivo text-sm font-bold text-[#059669] block mt-0.5">
              {quest.reward_description || "Karma Points"}
            </span>
          </div>
          <div>
            <span className="text-[11px] uppercase font-semibold text-[#666A73] tracking-wider block">Target Device</span>
            <span className="font-archivo text-sm font-semibold text-[#17181B] block mt-0.5">
              {quest.target_devices || "Any Browser / OS"}
            </span>
          </div>
          <div>
            <span className="text-[11px] uppercase font-semibold text-[#666A73] tracking-wider block">Capacity</span>
            <span className="font-archivo text-sm font-semibold text-[#17181B] block mt-0.5">
              {quest.submissions_count} / {quest.max_submissions} slots
            </span>
          </div>
          <div>
            <span className="text-[11px] uppercase font-semibold text-[#666A73] tracking-wider block">Created</span>
            <span className="font-archivo text-sm font-semibold text-[#17181B] block mt-0.5">
              {new Date(quest.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Task Instructions */}
        <div className="space-y-3">
          <h2 className="font-archivo text-base font-bold text-[#17181B]">
            Testing Instructions & Scope
          </h2>
          <div className="p-5 rounded-[18px] bg-[#F8F9FA] border border-[#DADDE1] text-xs sm:text-sm text-[#17181B] leading-relaxed whitespace-pre-line">
            {quest.task_instructions}
          </div>
        </div>

        {/* Expected Feedback */}
        <div className="space-y-3">
          <h2 className="font-archivo text-base font-bold text-[#17181B]">
            What to Deliver
          </h2>
          <ul className="text-xs sm:text-sm text-[#666A73] space-y-2 list-disc pl-5">
            <li>Detailed UX observations and pain points encountered during testing.</li>
            <li>System & device specifications (browser version, OS, screen resolution).</li>
            <li>1-5 rating on User Experience and App Speed.</li>
            <li>Bug reproduction steps if issues were discovered.</li>
          </ul>
        </div>

        {/* Action Button */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#DADDE1]">
          <div className="text-xs text-[#666A73]">
            Submissions are reviewed by the founder. Verified reports receive Karma into your audit ledger.
          </div>

          <QuestActionButton
            questId={quest.id}
            questTitle={quest.title}
            reward={quest.reward_description}
            testerNameHint={session?.name ?? ""}
            isFull={isFull}
          />
        </div>
      </div>
    </div>
  );
}
