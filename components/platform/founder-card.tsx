import Link from "next/link";
import { sql } from "@/lib/db/neon";
import { readSession } from "@/lib/auth/session";
import { isFollowing } from "@/lib/data/follows";
import { FollowButton } from "@/components/platform/follow-button";
import { Sparkle } from "@phosphor-icons/react/dist/ssr";

interface FounderProfile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  website_url: string | null;
  github_handle: string | null;
  karma_score: number;
}

export async function FounderCard({ founderId }: { founderId: string }) {
  if (!founderId) return null;

  let founder: FounderProfile | null = null;
  try {
    const rows = (await sql`
      SELECT id, full_name, username, avatar_url, bio, website_url, github_handle, karma_score
      FROM profiles
      WHERE id = ${founderId}::uuid
      LIMIT 1
    `) as unknown as FounderProfile[];
    founder = rows[0] ?? null;
  } catch (err) {
    console.error("[FounderCard] Failed to fetch founder profile:", err);
    return null;
  }

  if (!founder) return null;

  const session = await readSession();
  const following = session ? await isFollowing(session.userId, "user", founder.id) : false;
  const isSelf = session?.userId === founder.id;

  return (
    <div className="rounded-2xl border border-[#DADDE1] bg-white p-5 space-y-3.5 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase font-semibold text-[#666A73] tracking-wider">Meet the Maker</span>
        <span className="text-[11px] font-semibold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full">
          Verified Founder
        </span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {founder.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={founder.avatar_url}
              alt={founder.full_name}
              className="h-12 w-12 rounded-full object-cover border border-[#DADDE1] shrink-0"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-[#17181B] text-white flex items-center justify-center font-bold text-base shrink-0 font-archivo">
              {founder.full_name?.charAt(0) || founder.username?.charAt(0) || "F"}
            </div>
          )}

          <div className="min-w-0">
            <Link
              href={`/profile/${founder.username}`}
              className="font-archivo text-sm font-bold text-[#17181B] hover:text-[#FF4B3E] transition-colors truncate block"
            >
              {founder.full_name || founder.username}
            </Link>
            <span className="text-xs text-[#A0A4AB] font-mono block">@{founder.username}</span>
          </div>
        </div>

        {!isSelf && (
          <FollowButton
            targetType="user"
            targetId={founder.id}
            initialFollowing={following}
          />
        )}
      </div>

      {founder.bio && (
        <p className="text-xs text-[#666A73] line-clamp-2 leading-relaxed">
          {founder.bio}
        </p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-[#F0F2F5] text-xs text-[#666A73]">
        <div className="flex items-center gap-1.5 font-semibold text-[#17181B]">
          <Sparkle size={14} weight="fill" className="text-[#FF4B3E]" />
          <span>{founder.karma_score || 0} Karma</span>
        </div>

        <Link
          href={`/profile/${founder.username}`}
          className="text-xs font-semibold text-[#17181B] hover:text-[#FF4B3E]"
        >
          View Full Profile →
        </Link>
      </div>
    </div>
  );
}
