import { getSiteOrigin } from "@/lib/site-url";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CaretRight,
  Globe,
  ArrowUpRight,
  Download,
  Flask,
  Target,
  Lightbulb,
  Users,
  Sparkle,
  Eye,
  TrendUp,
  ArrowUpRight as ArrowUpRightIcon,
} from "@phosphor-icons/react/dist/ssr";

import { timeAgo } from "@/lib/utils";
import { countOf } from "@/lib/pluralize";
import { renderMarkdown } from "@/lib/markdown";
import { getViewer, isFounderViewer } from "@/lib/auth/viewer";
import { getStartupBySlug } from "@/lib/data/startups";
import { getStartupMedia, getStartupVideoUrl } from "@/lib/data/media";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StartupCommunity } from "@/components/platform/startup-community";
import { MARKET_LABELS, STAGE_LABELS } from "@/components/startups/startup-card";
import { ShowcaseUpvote } from "@/components/startups/showcase-upvote";
import { StartupGallery } from "@/components/startups/startup-gallery";
import { StartupLogo } from "@/components/startups/startup-logo";
import { TagPill } from "@/components/startups/tag-pill";
import { WaitlistForm } from "@/components/startups/waitlist";
import { FollowButton } from "@/components/platform/follow-button";
import { SaveButton } from "@/components/platform/save-button";
import { ShareButton } from "@/components/platform/share-button";
import { ReportButton } from "@/components/platform/report-modal";
import { FounderCard } from "@/components/platform/founder-card";
import { StartupUpdatesList } from "@/components/platform/startup-updates";
import { BetaTestingBadge } from "@/components/startups/beta-testing-badge";
import { StartupStatPills } from "@/components/startups/startup-stat-pills";
import { isFollowing } from "@/lib/data/follows";
import { isItemSaved } from "@/lib/data/saved";
import { getQuestsByStartupId } from "@/lib/data/quests";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const startup = await getStartupBySlug(slug);

  if (!startup) return { title: "Startup not found" };

  const baseUrl = getSiteOrigin();
  const canonical = new URL(`/startups/${startup.slug}`, baseUrl);
  const description = (startup.description || startup.tagline || "").slice(0, 160);

  return {
    title: `${startup.name} — ${startup.tagline}`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${startup.name} — ${startup.tagline}`,
      description,
      url: canonical,
      type: "website",
      images: startup.logo_url ? [{ url: startup.logo_url, alt: startup.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${startup.name} — ${startup.tagline}`,
      description,
    },
  };
}

export default async function StartupShowcasePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const startup = await getStartupBySlug(slug);

  if (!startup) notFound();

  const [media, videoUrl, viewer, quests] = await Promise.all([
    getStartupMedia(startup.id),
    getStartupVideoUrl(startup.id),
    getViewer(),
    getQuestsByStartupId(startup.id),
  ]);

  const [followed, saved] = viewer.userId
    ? await Promise.all([
        isFollowing(viewer.userId, "startup", startup.id),
        isItemSaved(viewer.userId, "startup", startup.id),
      ])
    : [false, false];

  const pitch = startup.description || "";
  const canManage = isFounderViewer(viewer, startup);
  const totalWaitlist = startup.waitlist_count;
  const query = await searchParams;
  const primaryTag =
    startup.tags.find((tag) => tag.category === "industry") ?? startup.tags[0];

  const exportHref = `/startups/${startup.slug}/waitlist/export`;
  const baseUrl = getSiteOrigin();

  const hasBlueprint = Boolean(startup.problem || startup.solution || startup.audience);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": startup.name,
        "headline": startup.tagline,
        "description": startup.description || startup.tagline,
        "url": startup.website_url || `${baseUrl}/startups/${startup.slug}`,
        "image": startup.logo_url || undefined,
        "applicationCategory": primaryTag?.name || "Productivity",
        "operatingSystem": "Web, iOS, Android",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": baseUrl,
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Startups",
            "item": `${baseUrl}/startups`,
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": startup.name,
            "item": `${baseUrl}/startups/${startup.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="site-container max-w-7xl py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#666A73]">
        <Link href="/" className="hover:text-[#17181B] transition-colors">
          Home
        </Link>
        <CaretRight size={12} aria-hidden />
        <Link href="/startups" className="hover:text-[#17181B] transition-colors">
          Startups
        </Link>
        {primaryTag && (
          <>
            <CaretRight size={12} aria-hidden />
            <Link
              href={`/startups?tag=${primaryTag.slug}`}
              className="hover:text-[#17181B] transition-colors"
            >
              {primaryTag.name}
            </Link>
          </>
        )}
        <CaretRight size={12} aria-hidden />
        <span className="font-semibold text-[#17181B]">{startup.name}</span>
      </nav>

      {/* 2-Column Responsive Layout: Left Sticky Sidebar + Right Flowing Main Body */}
      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* LEFT COLUMN: Persistent Sticky Startup Identity & Actions (Smooth eased-in sidebar) */}
        <aside className="w-full lg:w-[380px] xl:w-[420px] shrink-0 lg:sticky lg:top-24 space-y-5 transition-all duration-300 ease-out z-10">
          {/* Main Startup Showcase Card */}
          <div className="rounded-2xl border border-[#DADDE1] bg-white p-5 sm:p-6 space-y-5 shadow-xs">
            {/* Top row: Logo + Showcase Upvote */}
            <div className="flex items-start justify-between gap-3">
              <StartupLogo
                name={startup.name}
                logoUrl={startup.logo_url}
                seed={startup.slug}
                size={80}
              />
              <ShowcaseUpvote
                startupId={startup.id}
                count={startup.upvotes_count}
                label="Upvote"
                className="shrink-0"
              />
            </div>

            {/* Name, Badges, Beta Testing Trigger, and Tagline */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <h1 className="font-archivo text-2xl font-bold tracking-tight text-[#17181B]">
                  {startup.name}
                </h1>
                <Badge variant="stage">{STAGE_LABELS[startup.stage]}</Badge>
                <Badge
                  variant={
                    startup.target_market === "global_export" ? "global" : "regional"
                  }
                >
                  {MARKET_LABELS[startup.target_market]}
                </Badge>
              </div>

              {/* Clear Interactive Beta Testing Pill */}
              <div>
                <BetaTestingBadge
                  betaNotes={startup.beta_notes}
                  hasQuests={quests.length > 0}
                  startupName={startup.name}
                  websiteUrl={startup.website_url}
                />
              </div>

              <p className="text-xs sm:text-sm text-[#4B5059] leading-relaxed">
                {startup.tagline}
              </p>
            </div>

            {/* Sleek Tag Pills (dots removed) */}
            {startup.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {startup.tags.map((tag) => (
                  <TagPill key={tag.id} tag={tag} />
                ))}
              </div>
            )}

            {/* Interactive Stats Pills: Waitlist, Comments, Launched, Wishlist with Hover Tooltips */}
            <div className="pt-2 border-t border-[#F0F2F5]">
              <StartupStatPills
                startupId={startup.id}
                waitlistCount={totalWaitlist}
                commentsCount={startup.comments_count}
                launchedText={timeAgo(startup.launch_date ?? startup.created_at)}
                initialSaved={saved}
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-3 border-t border-[#F0F2F5]">
              <Button asChild className="w-full justify-center ink-button">
                <a href="#waitlist">Join the beta waitlist</a>
              </Button>
              <Button asChild variant="outline" className="w-full justify-center">
                <a href={startup.website_url} target="_blank" rel="noreferrer">
                  <Globe className="h-4 w-4" aria-hidden />
                  Visit Website / Demo
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </a>
              </Button>
              {startup.demo_video_url && (
                <Button asChild variant="ghost" className="w-full justify-center text-xs">
                  <a href={startup.demo_video_url} target="_blank" rel="noreferrer">
                    Watch demo video
                  </a>
                </Button>
              )}
            </div>

            {/* Follow, Wishlist, Share, Report Row */}
            <div className="flex items-center justify-between pt-3 border-t border-[#F0F2F5]">
              <FollowButton
                targetType="startup"
                targetId={startup.id}
                initialFollowing={followed}
              />
              <div className="flex items-center gap-1.5">
                <SaveButton itemType="startup" itemId={startup.id} initialSaved={saved} />
                <ShareButton title={startup.name} />
                <ReportButton targetType="startup" targetId={startup.id} />
              </div>
            </div>
          </div>

          {/* Meet the Maker Card (placed smoothly under identity card in sidebar) */}
          <FounderCard founderId={startup.founder_id} />
        </aside>

        {/* RIGHT COLUMN: Expansive Body Content (uses full width of container) */}
        <main className="flex-1 min-w-0 w-full space-y-8">
          {/* Gallery (Screenshots / Demo Video) */}
          <StartupGallery
            startupName={startup.name}
            media={media}
            videoUrl={videoUrl ?? startup.demo_video_url}
          />

          {/* About the Product (with smart auto-formatter) */}
          <section
            aria-label="About the product"
            className="rounded-2xl border border-[#DADDE1] bg-white p-6 sm:p-7 space-y-4 shadow-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
              <h2 className="font-archivo text-xl font-bold text-[#17181B]">
                About the Product
              </h2>
              {startup.website_url && (
                <a
                  href={startup.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#FF4B3E] hover:underline font-semibold flex items-center gap-1"
                >
                  <span>Visit website</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            {pitch.trim() ? (
              <div
                className="mt-3 leading-relaxed text-sm text-[#374151] space-y-3 font-sans"
                // Rendered from smart auto-formatting markdown engine
                dangerouslySetInnerHTML={{ __html: renderMarkdown(pitch) }}
              />
            ) : (
              <div className="mt-3 space-y-3">
                <p className="text-sm text-[#666A73]">
                  The founder hasn&apos;t added a detailed description yet.
                </p>
                <Button asChild variant="outline" size="sm">
                  <a href={startup.website_url} target="_blank" rel="noreferrer">
                    Visit Website
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                  </a>
                </Button>
              </div>
            )}
          </section>

          {/* Reorganized Non-Vertical Section: Product Blueprint + Community Traction & Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Column 1: Product Blueprint (The Problem, The Solution, Target Audience) */}
            {hasBlueprint ? (
              <div className="rounded-2xl border border-[#DADDE1] bg-white p-5 sm:p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2">
                  <Sparkle size={18} weight="fill" className="text-[#FF4B3E]" />
                  <h3 className="font-archivo text-base font-bold text-[#17181B]">
                    Product Blueprint
                  </h3>
                </div>

                <div className="space-y-3">
                  {startup.problem && (
                    <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#DADDE1] space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#FF4B3E]">
                        <Target size={14} weight="bold" />
                        <span>The Problem</span>
                      </div>
                      <p className="text-xs text-[#4B5059] leading-relaxed whitespace-pre-line">
                        {startup.problem}
                      </p>
                    </div>
                  )}

                  {startup.solution && (
                    <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#DADDE1] space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#059669]">
                        <Lightbulb size={14} weight="bold" />
                        <span>The Solution</span>
                      </div>
                      <p className="text-xs text-[#4B5059] leading-relaxed whitespace-pre-line">
                        {startup.solution}
                      </p>
                    </div>
                  )}

                  {startup.audience && (
                    <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#DADDE1] space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#17181B]">
                        <Users size={14} weight="bold" />
                        <span>Target Audience</span>
                      </div>
                      <p className="text-xs text-[#4B5059] leading-relaxed whitespace-pre-line">
                        {startup.audience}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Column 2: Community Traction + Changelog Updates */}
            <div className="space-y-6">
              {/* Traction 4-box tile */}
              <div className="rounded-2xl border border-[#DADDE1] bg-white p-5 sm:p-6 space-y-3.5 shadow-xs">
                <h3 className="font-archivo text-xs uppercase font-bold tracking-wider text-[#666A73]">
                  Community Traction
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E4E7EB]">
                    <span className="text-[11px] text-[#666A73] flex items-center gap-1">
                      <Eye size={13} /> Views
                    </span>
                    <p className="font-mono text-lg font-bold text-[#17181B] mt-0.5">
                      {startup.views_count ?? 0}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E4E7EB]">
                    <span className="text-[11px] text-[#666A73] flex items-center gap-1">
                      <Users size={13} /> Followers
                    </span>
                    <p className="font-mono text-lg font-bold text-[#17181B] mt-0.5">
                      {startup.followers_count ?? 0}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E4E7EB]">
                    <span className="text-[11px] text-[#666A73] flex items-center gap-1">
                      <Flask size={13} /> Quests
                    </span>
                    <p className="font-mono text-lg font-bold text-[#17181B] mt-0.5">
                      {quests.length}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E4E7EB]">
                    <span className="text-[11px] text-[#666A73] flex items-center gap-1">
                      <TrendUp size={13} /> Upvotes
                    </span>
                    <p className="font-mono text-lg font-bold text-[#17181B] mt-0.5">
                      {startup.upvotes_count}
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Changelog & Updates */}
              <StartupUpdatesList startupId={startup.id} />
            </div>
          </div>

          {/* Active Testing Quests Section (if quests exist) */}
          {quests.length > 0 && (
            <section
              id="quests"
              aria-label="Testing Quests"
              className="rounded-2xl border border-[#DADDE1] bg-white p-5 sm:p-6 space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flask size={20} weight="fill" className="text-[#FF4B3E]" />
                  <h2 className="font-archivo text-lg font-bold text-[#17181B]">
                    Active Testing Challenges
                  </h2>
                </div>
                <span className="text-xs text-[#059669] font-bold bg-[#ECFDF5] px-2.5 py-1 rounded-full">
                  Earn Karma
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quests.map((q) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-[18px] border border-[#DADDE1] bg-[#F8F9FA] space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#059669]">
                        {q.reward_description}
                      </span>
                      <span className="text-[#A0A4AB]">
                        {q.submissions_count}/{q.max_submissions} tested
                      </span>
                    </div>
                    <h3 className="font-archivo text-sm font-bold text-[#17181B]">
                      {q.title}
                    </h3>
                    <p className="text-xs text-[#666A73] line-clamp-2">
                      {q.task_instructions}
                    </p>
                    <div className="pt-2 flex items-center justify-between border-t border-[#E4E7EB]">
                      <span className="text-[11px] text-[#666A73]">
                        {q.target_devices || "All devices"}
                      </span>
                      <Link
                        href={`/quests/${q.id}`}
                        className="ink-button inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full"
                      >
                        <span>Take Quest</span>
                        <ArrowUpRightIcon size={12} weight="bold" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Waitlist capture + founder tools */}
          <section
            id="waitlist"
            aria-label="Beta waitlist"
            className="rounded-2xl border border-[#DADDE1] bg-white p-5 sm:p-6 space-y-4 shadow-xs"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-archivo text-xl font-bold text-[#17181B]">
                  Join the Beta Waitlist
                </h2>
                <p className="mt-1 text-xs text-[#666A73]">
                  Get an invite as soon as {startup.name} opens the next cohort.{" "}
                  <span className="font-semibold text-[#17181B]">
                    {countOf(totalWaitlist, "builder")}
                  </span>{" "}
                  {totalWaitlist === 1 ? "is" : "are"} already in line.
                </p>
              </div>

              {canManage && (
                <div className="flex flex-col items-end gap-1.5">
                  <Button asChild size="sm" variant="outline">
                    <a href={exportHref}>
                      <Download className="h-4 w-4" aria-hidden />
                      Export Waitlist to CSV
                    </a>
                  </Button>
                  <span className="text-tiny text-muted-foreground">
                    Visible only to the founder
                  </span>
                </div>
              )}
            </div>

            <WaitlistForm
              slug={startup.slug}
              startupName={startup.name}
              className="mt-3"
            />
          </section>

          {/* Community Discussion and Related Launches */}
          <StartupCommunity
            startup={startup}
            sort={query.sort}
            page={Math.min(100, Math.max(1, Number(query.page) || 1))}
          />
        </main>
      </div>
    </div>
  );
}
