import Link from "next/link";
import { member, type ListItem } from "@/lib/platform";
import { sql } from "@/lib/db/neon";
import type { StartupWithTags } from "@/types/database";
import { comment, deleteComment, likeComment, reportItem } from "@/actions/community";
import { ActionForm } from "@/components/platform/action-form";
import { Panel, Field, ItemList } from "@/components/platform/ui";
import { ViewTracker } from "@/components/platform/share";
import {
  ChatCircleDots,
  ThumbsUp,
  Flask,
  Users,
  Eye,
  Target,
  Lightbulb,
  CheckCircle,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";

interface StartupDataRow {
  problem: string | null;
  solution: string | null;
  audience: string | null;
  beta_notes: string | null;
  is_curated: boolean;
  verified_at: string | null;
  username: string | null;
  full_name: string | null;
  founder_verified: string | null;
  followers: number;
  views: number;
  testers: number;
}

interface CommentRow {
  id: string;
  content: string;
  parent_id: string | null;
  user_id: string;
  created_at: string;
  is_founder_reply: boolean;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  likes: number;
  liked: boolean;
  verified_tester: boolean;
}

export async function StartupCommunity({
  startup,
  sort = "newest",
  page = 1,
}: {
  startup: StartupWithTags;
  sort?: string;
  page?: number;
}) {
  const user = await member();

  let data: StartupDataRow = {
    problem: null,
    solution: null,
    audience: null,
    beta_notes: null,
    is_curated: false,
    verified_at: null,
    username: null,
    full_name: null,
    founder_verified: null,
    followers: 0,
    views: 0,
    testers: 0,
  };

  try {
    const rows = (await sql`
      select
        s.problem, s.solution, s.audience, s.beta_notes, s.is_curated, s.verified_at,
        p.username, p.full_name, p.verified_at as founder_verified,
        coalesce((select count(*)::int from follows where target_id = s.id and target_type = 'startup'), s.followers_count, 0) as followers,
        coalesce((select count(*)::int from startup_views where startup_id = s.id), s.views_count, 0) as views,
        coalesce((select count(*)::int from quest_members m join testing_quests q on q.id = m.quest_id where q.startup_id = s.id), 0) as testers
      from startups s
      left join profiles p on p.id = s.founder_id
      where s.id = ${startup.id}::uuid
      limit 1
    `) as unknown as StartupDataRow[];

    if (rows[0]) {
      data = rows[0];
    }
  } catch (err) {
    console.error("[StartupCommunity] Failed to query startup details:", err);
  }

  let comments: CommentRow[] = [];
  try {
    comments = (await sql`
      select
        c.id, c.content, c.parent_id, c.user_id, c.created_at, c.is_founder_reply,
        p.username, p.full_name, p.avatar_url,
        coalesce((select count(*)::int from comment_likes where comment_id = c.id), 0) as likes,
        case when ${user?.id ?? null}::uuid is not null
          then exists(select 1 from comment_likes where comment_id = c.id and user_id = ${user?.id ?? null}::uuid)
          else false
        end as liked,
        exists(
          select 1 from quest_submissions r
          join testing_quests q on q.id = r.quest_id
          where q.startup_id = c.startup_id and r.tester_id = c.user_id and r.status = 'accepted'
        ) as verified_tester
      from comments c
      left join profiles p on p.id = c.user_id
      where c.startup_id = ${startup.id}::uuid and (p.suspended_at is null or p.id is null)
      order by case when ${sort === "popular"}
        then coalesce((select count(*) from comment_likes where comment_id = c.id), 0)
        else 0
      end desc, c.created_at desc
      limit 25 offset ${Math.max(0, page - 1) * 25}
    `) as unknown as CommentRow[];
  } catch (err) {
    console.error("[StartupCommunity] Failed to query comments:", err);
  }

  let related: ListItem[] = [];
  try {
    related = (await sql`
      select id, name as title, tagline as description, '/startups/' || slug as href
      from startups
      where status = 'approved' and archived_at is null and launch_date <= now() and id <> ${startup.id}::uuid
      order by (
        select count(*) from startup_tags a
        join startup_tags b on a.tag_id = b.tag_id
        where a.startup_id = startups.id and b.startup_id = ${startup.id}::uuid
      ) desc, launch_date desc
      limit 3
    `) as unknown as ListItem[];
  } catch (err) {
    console.error("[StartupCommunity] Failed to query related startups:", err);
  }

  const hasProductDetails = Boolean(data.problem || data.solution || data.audience);

  return (
    <div className="space-y-6">
      <ViewTracker id={startup.id} />

      {/* Product Deep Dive (Problem, Solution, Target Audience) */}
      {hasProductDetails && (
        <section
          aria-label="Product Deep Dive"
          className="rounded-2xl border border-[#DADDE1] bg-white p-5 sm:p-6 space-y-5 shadow-xs"
        >
          <div className="flex items-center gap-2">
            <Sparkle size={20} weight="fill" className="text-[#FF4B3E]" />
            <h2 className="font-archivo text-lg font-bold text-[#17181B]">Product Blueprint</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.problem && (
              <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#DADDE1] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF4B3E]">
                  <Target size={16} weight="bold" />
                  <span>The Problem</span>
                </div>
                <p className="text-xs text-[#666A73] leading-relaxed whitespace-pre-line">{data.problem}</p>
              </div>
            )}

            {data.solution && (
              <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#DADDE1] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#059669]">
                  <Lightbulb size={16} weight="bold" />
                  <span>The Solution</span>
                </div>
                <p className="text-xs text-[#666A73] leading-relaxed whitespace-pre-line">{data.solution}</p>
              </div>
            )}

            {data.audience && (
              <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#DADDE1] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#17181B]">
                  <Users size={16} weight="bold" />
                  <span>Target Audience</span>
                </div>
                <p className="text-xs text-[#666A73] leading-relaxed whitespace-pre-line">{data.audience}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Beta Access & Testing Directives */}
      {data.beta_notes && (
        <section
          aria-label="Beta Testing Guidance"
          className="rounded-2xl border border-[#059669]/20 bg-[#ECFDF5]/40 p-5 sm:p-6 space-y-3 shadow-xs"
        >
          <div className="flex items-center gap-2">
            <Flask size={20} weight="fill" className="text-[#059669]" />
            <h2 className="font-archivo text-base font-bold text-[#17181B]">Beta Testing Directives</h2>
          </div>
          <p className="text-xs text-[#374151] leading-relaxed whitespace-pre-line">{data.beta_notes}</p>
        </section>
      )}

      {/* Community Traction Metrics */}
      <section
        aria-label="Community Traction"
        className="rounded-2xl border border-[#DADDE1] bg-white p-5 sm:p-6 shadow-xs"
      >
        <h2 className="font-archivo text-xs uppercase font-bold tracking-wider text-[#666A73] mb-4">
          Community Traction
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E4E7EB]">
            <div className="flex items-center gap-1.5 text-xs text-[#666A73]">
              <Eye size={15} />
              <span>Unique Views</span>
            </div>
            <div className="mt-1 font-mono text-xl font-bold text-[#17181B]">{data.views}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E4E7EB]">
            <div className="flex items-center gap-1.5 text-xs text-[#666A73]">
              <Users size={15} />
              <span>Followers</span>
            </div>
            <div className="mt-1 font-mono text-xl font-bold text-[#17181B]">{data.followers}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E4E7EB]">
            <div className="flex items-center gap-1.5 text-xs text-[#666A73]">
              <Flask size={15} />
              <span>Beta Testers</span>
            </div>
            <div className="mt-1 font-mono text-xl font-bold text-[#17181B]">{data.testers}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E4E7EB]">
            <div className="flex items-center gap-1.5 text-xs text-[#666A73]">
              <ThumbsUp size={15} />
              <span>Upvotes</span>
            </div>
            <div className="mt-1 font-mono text-xl font-bold text-[#17181B]">{startup.upvotes_count}</div>
          </div>
        </div>
      </section>

      {/* Discussion & Community Feedback */}
      <section
        id="discussion"
        aria-label="Discussion"
        className="rounded-2xl border border-[#DADDE1] bg-white p-5 sm:p-6 space-y-5 shadow-xs"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ChatCircleDots size={20} weight="bold" className="text-[#FF4B3E]" />
            <h2 className="font-archivo text-lg font-bold text-[#17181B]">Community Discussion</h2>
            <span className="text-xs font-mono text-[#A0A4AB] ml-1">({comments.length})</span>
          </div>

          <nav aria-label="Comment order" className="flex items-center gap-2 text-xs font-semibold">
            <Link
              href="?sort=newest#discussion"
              className={`px-3 py-1 rounded-full border transition-colors ${
                sort !== "popular"
                  ? "bg-[#17181B] text-white border-[#17181B]"
                  : "bg-white text-[#666A73] border-[#DADDE1] hover:border-[#17181B]"
              }`}
            >
              Newest
            </Link>
            <Link
              href="?sort=popular#discussion"
              className={`px-3 py-1 rounded-full border transition-colors ${
                sort === "popular"
                  ? "bg-[#17181B] text-white border-[#17181B]"
                  : "bg-white text-[#666A73] border-[#DADDE1] hover:border-[#17181B]"
              }`}
            >
              Most Upvoted
            </Link>
          </nav>
        </div>

        {/* Comment input form or sign-in prompt */}
        {user ? (
          <div className="rounded-xl border border-[#DADDE1] bg-[#F8F9FA] p-4">
            <ActionForm action={comment} label="Post feedback or question" className="space-y-3">
              <input type="hidden" name="startupId" value={startup.id} />
              <Field
                name="content"
                label="Share your feedback, bug report, or questions with the founder:"
                type="textarea"
                required
                maxLength={4000}
              />
            </ActionForm>
          </div>
        ) : (
          <div className="rounded-xl border border-[#DADDE1] bg-[#F8F9FA] p-5 text-center space-y-2">
            <p className="text-xs text-[#666A73]">
              Have questions, feedback, or test results for <span className="font-semibold text-[#17181B]">{startup.name}</span>?
            </p>
            <Link
              href={`/sign-in?redirect_url=/startups/${startup.slug}`}
              className="ink-button inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full"
            >
              Sign in to join the discussion
            </Link>
          </div>
        )}

        {/* Comment threads list */}
        {comments.length > 0 ? (
          <ul className="space-y-4 divide-y divide-[#F0F2F5] pt-2">
            {comments.map((c) => {
              const isFounder = c.is_founder_reply || c.user_id === startup.founder_id;
              const isOwner = user?.id === c.user_id || user?.role === "admin";

              return (
                <li key={c.id} className={`pt-4 first:pt-0 ${c.parent_id ? "pl-5 border-l-2 border-[#E4E7EB] ml-2" : ""}`}>
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {c.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={c.avatar_url}
                            alt={c.full_name || "User"}
                            className="h-6 w-6 rounded-full object-cover border border-[#DADDE1]"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-[#17181B] text-white flex items-center justify-center text-[10px] font-bold">
                            {c.full_name?.charAt(0) || c.username?.charAt(0) || "U"}
                          </div>
                        )}

                        {c.username ? (
                          <Link
                            href={`/profile/${c.username}`}
                            className="font-archivo text-xs font-bold text-[#17181B] hover:text-[#FF4B3E]"
                          >
                            {c.full_name || c.username}
                          </Link>
                        ) : (
                          <span className="font-archivo text-xs font-bold text-[#17181B]">
                            {c.full_name || "Community Member"}
                          </span>
                        )}

                        {isFounder && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#FF4B3E] bg-[#FFF5F4] px-1.5 py-0.5 rounded-full border border-[#FF4B3E]/20">
                            Founder
                          </span>
                        )}

                        {c.verified_tester && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#059669] bg-[#ECFDF5] px-1.5 py-0.5 rounded-full border border-[#059669]/20">
                            <CheckCircle size={10} weight="fill" />
                            Verified Tester
                          </span>
                        )}
                      </div>

                      <time className="text-[11px] text-[#A0A4AB]" dateTime={c.created_at}>
                        {new Date(c.created_at).toLocaleDateString()}
                      </time>
                    </div>

                    <p className="text-xs text-[#374151] leading-relaxed whitespace-pre-wrap break-words">
                      {c.content}
                    </p>

                    {/* Actions on comment */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                      {user ? (
                        <>
                          <ActionForm
                            action={likeComment}
                            label={`${c.liked ? "Liked" : "Like"} (${c.likes})`}
                            className="inline-block"
                          >
                            <input type="hidden" name="id" value={c.id} />
                            <input type="hidden" name="active" value={String(c.liked)} />
                          </ActionForm>

                          <details className="inline-block">
                            <summary className="cursor-pointer text-[#666A73] hover:text-[#17181B] font-semibold py-1">
                              Reply
                            </summary>
                            <div className="mt-2 p-3 rounded-lg border border-[#DADDE1] bg-[#F8F9FA]">
                              <ActionForm action={comment} label="Send reply">
                                <input type="hidden" name="startupId" value={startup.id} />
                                <input type="hidden" name="parentId" value={c.id} />
                                <Field name="content" label="Reply:" type="textarea" required />
                              </ActionForm>
                            </div>
                          </details>

                          {isOwner && (
                            <ActionForm
                              action={deleteComment}
                              label="Delete"
                              confirm="Delete this comment and its replies?"
                              className="inline-block"
                            >
                              <input type="hidden" name="id" value={c.id} />
                            </ActionForm>
                          )}

                          <details className="inline-block">
                            <summary className="cursor-pointer text-[#A0A4AB] hover:text-[#FF4B3E] py-1 text-[11px]">
                              Report
                            </summary>
                            <div className="mt-2 p-3 rounded-lg border border-[#DADDE1] bg-white">
                              <ActionForm action={reportItem} label="Submit report">
                                <input type="hidden" name="id" value={c.id} />
                                <input type="hidden" name="kind" value="comment" />
                                <select
                                  aria-label="Report reason"
                                  name="reason"
                                  className="w-full rounded-md border border-[#DADDE1] bg-white p-2 text-xs mb-2"
                                >
                                  {["spam", "abuse", "misleading", "fraud", "other"].map((r) => (
                                    <option key={r} value={r}>
                                      {r}
                                    </option>
                                  ))}
                                </select>
                                <Field name="description" label="Details" />
                              </ActionForm>
                            </div>
                          </details>
                        </>
                      ) : (
                        <span className="text-[11px] text-[#A0A4AB] flex items-center gap-1">
                          <ThumbsUp size={12} /> {c.likes} upvotes
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-xs text-[#666A73] italic py-2">
            No comments or discussions yet. Be the first to start a conversation with the founder!
          </p>
        )}

        {/* Comment pagination */}
        {(page > 1 || comments.length === 25) && (
          <nav aria-label="Comment pages" className="flex items-center gap-3 pt-2 text-xs font-semibold">
            {page > 1 && (
              <Link
                href={`?sort=${sort}&page=${page - 1}#discussion`}
                className="px-3 py-1.5 rounded-lg border border-[#DADDE1] hover:border-[#17181B]"
              >
                ← Previous
              </Link>
            )}
            {comments.length === 25 && (
              <Link
                href={`?sort=${sort}&page=${page + 1}#discussion`}
                className="px-3 py-1.5 rounded-lg border border-[#DADDE1] hover:border-[#17181B]"
              >
                Next →
              </Link>
            )}
          </nav>
        )}
      </section>

      {/* Related Launches */}
      {related.length > 0 && (
        <Panel title="Related Launches">
          <ItemList items={related} />
        </Panel>
      )}
    </div>
  );
}
