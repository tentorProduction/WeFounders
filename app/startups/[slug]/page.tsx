import { getSiteOrigin } from "@/lib/site-url";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  ChevronRight,
  Download,
  Globe,
  MessageSquare,
  TrendingUp,
  Users,
} from "@/components/icons";

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
import { isFollowing } from "@/lib/data/follows";
import { isItemSaved } from "@/lib/data/saved";
import { getQuestsByStartupId } from "@/lib/data/quests";
import { Flask, ArrowUpRight as ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{sort?:string;page?:string}>;
}

// Reads the viewer's session to decide whether founder tools are shown.
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

/** Startup showcase page (PRD Flow 1 & 2 / DESIGN.md §4.2). */
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

  // The founder's own markdown is the "About the Product" copy.
  const pitch = startup.description || "";
  const canManage = isFounderViewer(viewer, startup);
  const totalWaitlist = startup.waitlist_count;
  const query = await searchParams;
  const primaryTag =
    startup.tags.find((tag) => tag.category === "industry") ?? startup.tags[0];

  const exportHref = `/startups/${startup.slug}/waitlist/export`;
  const baseUrl = getSiteOrigin();

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
    <div className="site-container py-8 max-w-4xl space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-caption text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Startups
        </Link>
        {primaryTag && (
          <>
            <ChevronRight className="h-3 w-3" aria-hidden />
            <span>{primaryTag.name}</span>
          </>
        )}
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span className="font-medium text-foreground">{startup.name}</span>
      </nav>

      {/* Hero */}
      <header className="rounded-xl border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <StartupLogo
            name={startup.name}
            logoUrl={startup.logo_url}
            seed={startup.slug}
            size={96}
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h1 className="text-h1 font-bold tracking-tight">
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

            <p className="mt-1.5 text-body text-muted-foreground">
              {startup.tagline}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {startup.tags.map((tag) => (
                <TagPill key={tag.id} tag={tag} />
              ))}
            </div>

            <dl className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-caption text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-primary" aria-hidden />
                <dt className="sr-only">Upvotes</dt>
                <dd className="font-semibold tabular-nums text-foreground">
                  {countOf(startup.upvotes_count, "upvote")}
                </dd>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" aria-hidden />
                <dt className="sr-only">Waitlist</dt>
                <dd className="tabular-nums">
                  {countOf(totalWaitlist, "waitlist")}
                </dd>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" aria-hidden />
                <dt className="sr-only">Comments</dt>
                <dd className="tabular-nums">
                  {countOf(startup.comments_count, "comment")}
                </dd>
              </div>
              <p className="italic">
                launched {timeAgo(startup.launch_date ?? startup.created_at)}
              </p>
            </dl>
          </div>

          <ShowcaseUpvote
            startupId={startup.id}
            count={startup.upvotes_count}
            label="Upvote"
            className="shrink-0 self-start"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F0F2F5]">
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild>
              <a href="#waitlist">Join the beta waitlist</a>
            </Button>
            <Button asChild variant="outline">
              <a href={startup.website_url} target="_blank" rel="noreferrer">
                <Globe className="h-4 w-4" aria-hidden />
                Visit Website / Demo
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            </Button>
            {startup.demo_video_url && (
              <Button asChild variant="ghost">
                <a href={startup.demo_video_url} target="_blank" rel="noreferrer">
                  Watch demo video
                </a>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <FollowButton targetType="startup" targetId={startup.id} initialFollowing={followed} />
            <SaveButton itemType="startup" itemId={startup.id} initialSaved={saved} showLabel />
            <ShareButton title={startup.name} />
            <ReportButton targetType="startup" targetId={startup.id} />
          </div>
        </div>
      </header>

      {/* Gallery */}
      <StartupGallery
        startupName={startup.name}
        media={media}
        videoUrl={videoUrl ?? startup.demo_video_url}
      />

      {/* About the product */}
      <section aria-label="About the product" className="rounded-lg border border-border bg-card p-5 sm:p-6 space-y-3">
        <h2 className="text-h2 font-bold text-foreground">About the Product</h2>
        {pitch.trim() ? (
          <div
            className="mt-3 leading-relaxed text-body"
            // Rendered from escaped markdown — see lib/markdown.ts.
            dangerouslySetInnerHTML={{ __html: renderMarkdown(pitch) }}
          />
        ) : (
          <div className="mt-3 space-y-3">
            <p className="text-body text-muted-foreground">
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

      {/* Waitlist capture + founder tools */}
      <section id="waitlist" aria-label="Beta waitlist" className="rounded-xl border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-h2">Join the Beta Waitlist</h2>
            <p className="mt-1 text-caption text-muted-foreground">
              Get an invite as soon as {startup.name} opens the next cohort.{" "}
              <span className="font-medium text-foreground">
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
          className="mt-4"
        />

      </section>

      {/* Testing Quests Section */}
      {quests.length > 0 && (
        <section aria-label="Testing Quests" className="rounded-2xl border border-[#DADDE1] bg-white p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flask size={20} weight="fill" className="text-[#FF4B3E]" />
              <h2 className="font-archivo text-lg font-bold text-[#17181B]">Active Testing Challenges</h2>
            </div>
            <span className="text-xs text-[#059669] font-bold bg-[#ECFDF5] px-2.5 py-1 rounded-full">
              Earn Karma
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quests.map((q) => (
              <div key={q.id} className="p-4 rounded-[18px] border border-[#DADDE1] bg-[#F8F9FA] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#059669]">{q.reward_description}</span>
                  <span className="text-[#A0A4AB]">{q.submissions_count}/{q.max_submissions} tested</span>
                </div>
                <h3 className="font-archivo text-sm font-bold text-[#17181B]">{q.title}</h3>
                <p className="text-xs text-[#666A73] line-clamp-2">{q.task_instructions}</p>
                <div className="pt-2 flex items-center justify-between border-t border-[#E4E7EB]">
                  <span className="text-[11px] text-[#666A73]">{q.target_devices || "All devices"}</span>
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

      {/* Product Changelog & Updates */}
      <StartupUpdatesList startupId={startup.id} />

      {/* Maker / Founder Card */}
      <FounderCard founderId={startup.founder_id} />

      <StartupCommunity startup={startup} sort={query.sort} page={Math.min(100,Math.max(1,Number(query.page)||1))} />
    </div>
  );
}



