import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth/session";
import { getFollowedStartups } from "@/lib/data/follows";
import { LaunchList } from "@/components/startups/launch-list";
import { Sparkle, Compass } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { StartupWithTags } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Following — WeFounders",
  description: "Keep track of startups and builders you follow.",
};

export default async function FollowingPage() {
  const session = await readSession();
  if (!session) {
    redirect("/sign-in");
  }

  const startups = (await getFollowedStartups(session.userId)) as unknown as StartupWithTags[];

  return (
    <div className="site-container py-8 sm:py-12 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-[#FF4B3E] font-semibold text-xs uppercase tracking-wider mb-2">
          <Sparkle size={18} weight="fill" />
          <span>Your Followed Launches</span>
        </div>
        <h1 className="font-archivo text-2xl sm:text-4xl font-bold text-[#17181B] tracking-tight">
          Following
        </h1>
        <p className="mt-2 text-sm text-[#666A73]">
          Get instant updates whenever founders ship new versions, changelogs, or open testing quests.
        </p>
      </div>

      {startups.length === 0 ? (
        <div className="bg-white border border-[#DADDE1] rounded-[28px] p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="h-12 w-12 rounded-full bg-[#F4F4F5] text-[#666A73] flex items-center justify-center mx-auto">
            <Compass size={24} weight="bold" />
          </div>
          <h3 className="font-archivo text-lg font-bold text-[#17181B]">
            You aren&apos;t following any startups yet
          </h3>
          <p className="text-xs text-[#666A73] leading-relaxed">
            Browse trending launches and click the Follow button on any product profile to receive changelogs and quest notifications.
          </p>
          <div className="pt-2">
            <Link
              href="/discover"
              className="ink-button inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-full"
            >
              <span>Explore Startups</span>
            </Link>
          </div>
        </div>
      ) : (
        <LaunchList startups={startups} />
      )}
    </div>
  );
}
