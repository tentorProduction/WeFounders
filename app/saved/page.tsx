import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth/session";
import { getUserSavedItems } from "@/lib/data/saved";
import { LaunchList } from "@/components/startups/launch-list";
import { BookmarkSimple, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { StartupWithTags } from "@/types/database";

interface SavedQuestItem {
  id: string;
  title: string;
  task_instructions?: string;
  reward_description?: string;
  startup_name: string;
  startup_slug: string;
}

interface SavedCollabItem {
  id: string;
  title: string;
  description: string;
  role_type: string;
  contact_channel: string;
}

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Saved Bookmarks — WeFounders",
  description: "View your saved startups, testing quests, and collaboration opportunities.",
};

export default async function SavedPage() {
  const session = await readSession();
  if (!session) {
    redirect("/sign-in");
  }

  const { startups, quests, collab } = await getUserSavedItems(session.userId);
  const totalCount = startups.length + quests.length + collab.length;

  return (
    <div className="site-container py-8 sm:py-12 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-[#FF4B3E] font-semibold text-xs uppercase tracking-wider mb-2">
          <BookmarkSimple size={18} weight="fill" />
          <span>Personal Library</span>
        </div>
        <h1 className="font-archivo text-2xl sm:text-4xl font-bold text-[#17181B] tracking-tight">
          Saved Items
        </h1>
        <p className="mt-2 text-sm text-[#666A73]">
          Quickly access products, testing quests, and opportunities you bookmarked for later.
        </p>
      </div>

      {totalCount === 0 ? (
        <div className="bg-white border border-[#DADDE1] rounded-[28px] p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="h-12 w-12 rounded-full bg-[#F4F4F5] text-[#666A73] flex items-center justify-center mx-auto">
            <BookmarkSimple size={24} weight="bold" />
          </div>
          <h3 className="font-archivo text-lg font-bold text-[#17181B]">
            Your saved list is empty
          </h3>
          <p className="text-xs text-[#666A73] leading-relaxed">
            Click the bookmark icon on any startup, quest, or collaboration listing to save it here for fast access.
          </p>
          <div className="pt-2">
            <Link
              href="/discover"
              className="ink-button inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-full"
            >
              <span>Discover Startups</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Saved Startups */}
          {startups.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-archivo text-lg font-bold text-[#17181B] flex items-center gap-2">
                <span>Saved Startups</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#F0F2F5] text-[#666A73]">
                  {startups.length}
                </span>
              </h2>
              <LaunchList startups={startups as unknown as StartupWithTags[]} />
            </div>
          )}

          {/* Saved Quests */}
          {quests.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-archivo text-lg font-bold text-[#17181B] flex items-center gap-2">
                <span>Saved Testing Quests</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#F0F2F5] text-[#666A73]">
                  {quests.length}
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(quests as unknown as SavedQuestItem[]).map((q) => (
                  <div key={q.id} className="godly-card bg-white border border-[#DADDE1] rounded-[22px] p-5 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-medium text-[#666A73]">{q.startup_name}</div>
                      <h3 className="font-archivo text-base font-bold text-[#17181B] mt-1">{q.title}</h3>
                      <p className="text-xs text-[#666A73] line-clamp-2 mt-2">{q.task_instructions}</p>
                    </div>
                    <div className="pt-4 border-t border-[#F0F2F5] mt-4 flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#059669] bg-[#ECFDF5] px-2.5 py-1 rounded-full">
                        {q.reward_description || "Karma"}
                      </span>
                      <Link
                        href={`/startups/${q.startup_slug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#17181B] hover:text-[#FF4B3E]"
                      >
                        <span>View Quest</span>
                        <ArrowUpRight size={14} weight="bold" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saved Collab */}
          {collab.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-archivo text-lg font-bold text-[#17181B] flex items-center gap-2">
                <span>Saved Collaboration Posts</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#F0F2F5] text-[#666A73]">
                  {collab.length}
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(collab as unknown as SavedCollabItem[]).map((c) => (
                  <div key={c.id} className="godly-card bg-white border border-[#DADDE1] rounded-[22px] p-5 space-y-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#FF4B3E]">
                      {c.role_type}
                    </span>
                    <h3 className="font-archivo text-base font-bold text-[#17181B]">{c.title}</h3>
                    <p className="text-xs text-[#666A73] line-clamp-2">{c.description}</p>
                    <div className="pt-2">
                      <a
                        href={c.contact_channel}
                        target="_blank"
                        rel="noreferrer"
                        className="ink-button inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full"
                      >
                        <span>Connect</span>
                        <ArrowUpRight size={14} weight="bold" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
