import { readSession } from "@/lib/auth/session";
import { sql } from "@/lib/db/neon";
import { createProjectUpdateAction } from "@/actions/updates";
import { Rocket, Plus, Export, ArrowUpRight, CheckCircle, Eye } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { Startup } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Founder Dashboard — WeFounders",
  description: "Manage your launches, track waitlists, publish changelogs, and run testing quests.",
};

export default async function FounderDashboardPage() {
  const session = await readSession();
  if (!session) {
    return (
      <div className="site-container py-16 sm:py-24">
        <div className="max-w-md mx-auto bg-white border border-[#DADDE1] rounded-[24px] p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF5F4] text-[#FF4B3E] flex items-center justify-center mx-auto">
            <Rocket size={28} weight="fill" />
          </div>
          <h1 className="font-archivo text-2xl font-bold text-[#17181B] tracking-tight">
            Sign In to Founder Dashboard
          </h1>
          <p className="text-xs text-[#666A73] leading-relaxed">
            Connect your account to manage startup launches, track waitlists, publish updates, and run quests.
          </p>
          <div className="pt-2 flex justify-center">
            <Link
              href="/sign-in?redirect_url=/dashboard/founder"
              className="ink-button rounded-full px-6 py-2.5 text-xs font-semibold"
            >
              Continue to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get founder's startups
  const startups = (await sql`
    SELECT * FROM startups
    WHERE founder_id = ${session.userId}::uuid
    ORDER BY created_at DESC
  `) as unknown as Startup[];

  // Get total waitlist leads
  const waitlistStats = (await sql`
    SELECT count(*)::int as count
    FROM waitlist_entries w
    JOIN startups s ON w.startup_id = s.id
    WHERE s.founder_id = ${session.userId}::uuid
  `) as { count: number }[];

  // Get quests created
  const questStats = (await sql`
    SELECT count(*)::int as count
    FROM testing_quests q
    JOIN startups s ON q.startup_id = s.id
    WHERE s.founder_id = ${session.userId}::uuid
  `) as { count: number }[];

  // Get total upvotes
  const totalUpvotes = startups.reduce((acc, s) => acc + (s.upvotes_count || 0), 0);
  const totalViews = startups.reduce((acc, s) => acc + (s.views_count || 0), 0);
  const totalFollowers = startups.reduce((acc, s) => acc + (s.followers_count || 0), 0);

  return (
    <div className="site-container py-8 sm:py-12 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DADDE1] pb-6">
        <div>
          <div className="flex items-center gap-2 text-[#FF4B3E] font-semibold text-xs uppercase tracking-wider mb-1">
            <Rocket size={16} weight="fill" />
            <span>Mission Control</span>
          </div>
          <h1 className="font-archivo text-2xl sm:text-4xl font-bold text-[#17181B] tracking-tight">
            Founder Dashboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#666A73]">
            Track product traction, collect tester feedback, and grow your early adopter community.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/submit"
            className="ink-button inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-full shadow-xs"
          >
            <Plus size={16} weight="bold" />
            <span>Launch Startup</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-[#DADDE1] rounded-[22px] p-5 space-y-2">
          <div className="text-xs uppercase font-semibold text-[#666A73] tracking-wider">Page Views</div>
          <div className="text-3xl font-extrabold font-archivo text-[#17181B]">{totalViews}</div>
          <div className="text-[11px] text-[#666A73] flex items-center gap-1">
            <Eye size={12} weight="bold" />
            <span>Launch impressions</span>
          </div>
        </div>

        <div className="bg-white border border-[#DADDE1] rounded-[22px] p-5 space-y-2">
          <div className="text-xs uppercase font-semibold text-[#666A73] tracking-wider">Total Upvotes</div>
          <div className="text-3xl font-extrabold font-archivo text-[#17181B]">{totalUpvotes}</div>
          <div className="text-[11px] text-[#059669] font-medium flex items-center gap-1">
            <CheckCircle size={12} weight="fill" />
            <span>Community Verified</span>
          </div>
        </div>

        <div className="bg-white border border-[#DADDE1] rounded-[22px] p-5 space-y-2">
          <div className="text-xs uppercase font-semibold text-[#666A73] tracking-wider">Waitlist Leads</div>
          <div className="text-3xl font-extrabold font-archivo text-[#17181B]">{waitlistStats[0]?.count || 0}</div>
          <div className="text-[11px] text-[#666A73]">Direct beta signups</div>
        </div>

        <div className="bg-white border border-[#DADDE1] rounded-[22px] p-5 space-y-2">
          <div className="text-xs uppercase font-semibold text-[#666A73] tracking-wider">Followers</div>
          <div className="text-3xl font-extrabold font-archivo text-[#17181B]">{totalFollowers}</div>
          <div className="text-[11px] text-[#666A73]">Subscribed to changelogs</div>
        </div>

        <div className="bg-white border border-[#DADDE1] rounded-[22px] p-5 space-y-2">
          <div className="text-xs uppercase font-semibold text-[#666A73] tracking-wider">Testing Quests</div>
          <div className="text-3xl font-extrabold font-archivo text-[#17181B]">{questStats[0]?.count || 0}</div>
          <div className="text-[11px] text-[#666A73]">Active test scenarios</div>
        </div>
      </div>

      {/* Startups List & Changelog Publisher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: My Startups */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-archivo text-lg font-bold text-[#17181B]">
            Your Launched Startups
          </h2>

          {startups.length === 0 ? (
            <div className="bg-white border border-[#DADDE1] rounded-[22px] p-10 text-center space-y-3">
              <Rocket size={32} className="mx-auto text-[#A0A4AB]" />
              <p className="text-sm font-semibold text-[#17181B]">No startups launched yet</p>
              <p className="text-xs text-[#666A73] max-w-sm mx-auto">
                Ready to introduce your product to global early adopters? Launch your startup in a few simple steps.
              </p>
              <Link
                href="/submit"
                className="ink-button inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full mt-2"
              >
                <span>Submit Product</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {startups.map((s) => (
                <div
                  key={s.id}
                  className="bg-white border border-[#DADDE1] rounded-[22px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-archivo text-base font-bold text-[#17181B] truncate">{s.name}</h3>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-[#ECFDF5] text-[#059669]">
                        {s.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#666A73] line-clamp-1">{s.tagline}</p>
                    <div className="flex items-center gap-3 text-xs text-[#A0A4AB] pt-1">
                      <span>{s.upvotes_count || 0} upvotes</span>
                      <span>•</span>
                      <span>{s.waitlist_count || 0} waitlist</span>
                      <span>•</span>
                      <span>{s.followers_count || 0} followers</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`/startups/${s.slug}/waitlist/export`}
                      download
                      className="px-3 py-1.5 rounded-full border border-[#DADDE1] text-xs font-semibold text-[#17181B] hover:bg-[#F8F9FA] flex items-center gap-1.5 transition-colors"
                      title="Download waitlist leads CSV"
                    >
                      <Export size={14} weight="bold" />
                      <span>Export CSV</span>
                    </a>
                    <Link
                      href={`/startups/${s.slug}`}
                      className="ink-button inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold rounded-full"
                    >
                      <span>View</span>
                      <ArrowUpRight size={14} weight="bold" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Publish Product Update */}
        <div className="space-y-4">
          <h2 className="font-archivo text-lg font-bold text-[#17181B]">
            Publish Changelog / Update
          </h2>

          <div className="bg-white border border-[#DADDE1] rounded-[22px] p-5 shadow-xs">
            {startups.length === 0 ? (
              <p className="text-xs text-[#666A73]">Launch a product first to start posting version updates and changelogs.</p>
            ) : (
              <form
                action={async (formData: FormData) => {
                  "use server";
                  await createProjectUpdateAction(formData);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#17181B] mb-1">
                    Select Startup
                  </label>
                  <select
                    name="startupId"
                    className="w-full rounded-[12px] border border-[#DADDE1] px-3 py-2 text-xs text-[#17181B] focus:border-[#FF4B3E] focus:outline-none bg-white"
                  >
                    {startups.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#17181B] mb-1">
                      Version
                    </label>
                    <input
                      type="text"
                      name="version"
                      defaultValue="v1.1"
                      required
                      className="w-full rounded-[12px] border border-[#DADDE1] px-3 py-2 text-xs text-[#17181B] focus:border-[#FF4B3E] focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#17181B] mb-1">
                      Headline
                    </label>
                    <input
                      type="text"
                      name="title"
                      placeholder="e.g. Added dark mode"
                      required
                      className="w-full rounded-[12px] border border-[#DADDE1] px-3 py-2 text-xs text-[#17181B] focus:border-[#FF4B3E] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#17181B] mb-1">
                    What Changed? (Markdown)
                  </label>
                  <textarea
                    name="content"
                    rows={4}
                    placeholder="List release highlights, performance improvements, or new features..."
                    required
                    className="w-full rounded-[12px] border border-[#DADDE1] px-3 py-2 text-xs text-[#17181B] focus:border-[#FF4B3E] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="ink-button w-full inline-flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-full"
                >
                  <span>Broadcast Update</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
