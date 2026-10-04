import { notFound } from "next/navigation";
import { sql } from "@/lib/db/neon";
import { readSession } from "@/lib/auth/session";
import { isFollowing } from "@/lib/data/follows";
import { FollowButton } from "@/components/platform/follow-button";
import { LaunchList } from "@/components/startups/launch-list";
import { 
  MapPin, 
  Globe, 
  GithubLogo, 
  TwitterLogo, 
  Rocket 
} from "@phosphor-icons/react/dist/ssr";
import type { StartupWithTags, Profile } from "@/types/database";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const decoded = decodeURIComponent(username).trim();
  const rows = (await sql`
    SELECT full_name, username, bio FROM profiles 
    WHERE lower(username) = lower(${decoded}) OR id::text = ${decoded}
    LIMIT 1
  `) as { full_name: string; username: string; bio: string | null }[];

  const profile = rows[0];
  if (!profile) return { title: "Profile Not Found — WeFounders" };

  return {
    title: `${profile.full_name || profile.username} (@${profile.username}) — WeFounders`,
    description: profile.bio || `Check out ${profile.full_name}'s launches and builder profile on WeFounders.`,
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const decoded = decodeURIComponent(username).trim();

  const rows = (await sql`
    SELECT * FROM profiles 
    WHERE lower(username) = lower(${decoded}) OR id::text = ${decoded}
    LIMIT 1
  `) as unknown as Profile[];

  const profile = rows[0];
  if (!profile) {
    notFound();
  }

  const session = await readSession();
  const isOwner = session?.userId === profile.id;
  const following = session ? await isFollowing(session.userId, "user", profile.id) : false;

  // Get launches
  const launches = (await sql`
    SELECT s.*, 
      coalesce(
        (select json_agg(json_build_object('id', t.id, 'name', t.name, 'slug', t.slug, 'category', t.category))
         from startup_tags st join tags t on t.id = st.tag_id where st.startup_id = s.id),
        '[]'::json
      ) as tags
    FROM startups s
    WHERE s.founder_id = ${profile.id}::uuid AND s.status = 'approved'
    ORDER BY s.upvotes_count DESC
  `) as unknown as StartupWithTags[];

  return (
    <div className="site-container py-8 sm:py-12 space-y-8 max-w-4xl mx-auto">
      {/* Profile Card */}
      <div className="godly-card bg-white border border-[#DADDE1] rounded-[28px] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover border border-[#DADDE1] shrink-0"
              />
            ) : (
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-[#17181B] text-white flex items-center justify-center font-bold text-2xl shrink-0 font-archivo">
                {profile.full_name?.charAt(0) || profile.username?.charAt(0) || "U"}
              </div>
            )}

            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-archivo text-xl sm:text-2xl font-bold text-[#17181B] tracking-tight">
                  {profile.full_name || profile.username}
                </h1>
                {profile.role === "admin" && (
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#17181B] text-white">
                    Team
                  </span>
                )}
                <span className="text-xs text-[#A0A4AB] font-mono">@{profile.username}</span>
              </div>

              {/* Roles */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                {(profile.roles || [profile.role || "builder"]).map((role: string) => (
                  <span
                    key={role}
                    className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F0F2F5] text-[#17181B]"
                  >
                    {role}
                  </span>
                ))}
              </div>

              {profile.bio && (
                <p className="text-xs sm:text-sm text-[#666A73] leading-relaxed pt-1 max-w-xl">
                  {profile.bio}
                </p>
              )}

              {/* Meta links */}
              <div className="flex items-center gap-4 text-xs text-[#666A73] pt-2 flex-wrap">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{profile.location}</span>
                  </span>
                )}
                {profile.website_url && (
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 hover:text-[#FF4B3E] transition-colors"
                  >
                    <Globe size={14} />
                    <span>Website</span>
                  </a>
                )}
                {profile.github_handle && (
                  <a
                    href={`https://github.com/${profile.github_handle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 hover:text-[#FF4B3E] transition-colors"
                  >
                    <GithubLogo size={14} />
                    <span>GitHub</span>
                  </a>
                )}
                {profile.twitter_handle && (
                  <a
                    href={`https://twitter.com/${profile.twitter_handle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 hover:text-[#FF4B3E] transition-colors"
                  >
                    <TwitterLogo size={14} />
                    <span>Twitter</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action / Follow Button */}
          {!isOwner && (
            <FollowButton
              targetType="user"
              targetId={profile.id}
              initialFollowing={following}
            />
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 border-t border-[#DADDE1] pt-5">
          <div className="text-center p-3 rounded-[16px] bg-[#F8F9FA]">
            <div className="text-lg font-bold font-archivo text-[#17181B]">{profile.karma_score || 0}</div>
            <div className="text-[11px] font-semibold text-[#666A73] uppercase tracking-wider">Karma</div>
          </div>
          <div className="text-center p-3 rounded-[16px] bg-[#F8F9FA]">
            <div className="text-lg font-bold font-archivo text-[#17181B]">{launches.length}</div>
            <div className="text-[11px] font-semibold text-[#666A73] uppercase tracking-wider">Launches</div>
          </div>
          <div className="text-center p-3 rounded-[16px] bg-[#F8F9FA]">
            <div className="text-lg font-bold font-archivo text-[#17181B]">{profile.followers_count || 0}</div>
            <div className="text-[11px] font-semibold text-[#666A73] uppercase tracking-wider">Followers</div>
          </div>
        </div>
      </div>

      {/* Products launched */}
      <div className="space-y-4">
        <h2 className="font-archivo text-xl font-bold text-[#17181B] flex items-center gap-2">
          <Rocket size={20} weight="fill" className="text-[#FF4B3E]" />
          <span>Launches by {profile.full_name || profile.username}</span>
        </h2>

        {launches.length === 0 ? (
          <div className="bg-white border border-[#DADDE1] rounded-[22px] p-8 text-center text-xs text-[#666A73]">
            No live products published yet.
          </div>
        ) : (
          <LaunchList startups={launches} />
        )}
      </div>
    </div>
  );
}
