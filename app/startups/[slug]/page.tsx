import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  ChevronRight,
  Download,
  Globe,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";

import { cn, timeAgo } from "@/lib/utils";
import { renderMarkdown } from "@/lib/markdown";
import { getViewer, isFounderViewer } from "@/lib/auth/viewer";
import { getCommentThread } from "@/lib/comments";
import { getStartupBySlug } from "@/lib/fixtures/startups";
import { getStartupMedia, getStartupVideoUrl } from "@/lib/fixtures/media";
import { getStartupPitch } from "@/lib/fixtures/pitches";
import { countWaitlist } from "@/lib/waitlist/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommentThread } from "@/components/discussion/comment-thread";
import { MARKET_LABELS, STAGE_LABELS } from "@/components/startups/startup-card";
import { ShowcaseUpvote } from "@/components/startups/showcase-upvote";
import { StartupGallery } from "@/components/startups/startup-gallery";
import { StartupLogo } from "@/components/startups/startup-logo";
import { TagPill } from "@/components/startups/tag-pill";
import { WaitlistCta, WaitlistForm } from "@/components/startups/waitlist";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ as?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const startup = await getStartupBySlug(slug);

  if (!startup) return { title: "Startup not found" };

  return {
    title: `${startup.name} — ${startup.tagline}`,
    description: startup.description.slice(0, 160),
  };
}

/** Startup showcase page (PRD Flow 1 & 2 / DESIGN.md §4.2). */
export default async function StartupShowcasePage({
  params,
  searchParams,
}: PageProps) {
  const [{ slug }, { as }] = await Promise.all([params, searchParams]);
  const startup = await getStartupBySlug(slug);

  if (!startup) notFound();

  const [media, videoUrl, comments, localWaitlist, viewer] = await Promise.all([
    getStartupMedia(slug),
    getStartupVideoUrl(slug),
    getCommentThread(slug, startup.id),
    countWaitlist(startup.id),
    getViewer(),
  ]);

  const pitch = getStartupPitch(startup);
  const canManage = isFounderViewer(viewer, startup, as === "founder");
  const totalWaitlist = startup.waitlist_count + localWaitlist;
  const founderReplies = comments.filter((comment) => comment.is_founder_reply).length;
  const primaryTag =
    startup.tags.find((tag) => tag.category === "industry") ?? startup.tags[0];

  const exportHref = viewer.backendConfigured
    ? `/startups/${startup.slug}/waitlist/export`
    : `/startups/${startup.slug}/waitlist/export?as=founder`;

  return (
    <div className="site-container py-8 max-w-4xl space-y-6">
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
                  startup.target_market === "global_export" ? "global" : "nepal"
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
                  {startup.upvotes_count}
                </dd>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" aria-hidden />
                <dt className="sr-only">Waitlist</dt>
                <dd className="tabular-nums">{totalWaitlist} on waitlist</dd>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" aria-hidden />
                <dt className="sr-only">Comments</dt>
                <dd className="tabular-nums">
                  {comments.length + startup.comments_count} comments
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

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <WaitlistCta slug={startup.slug} startupName={startup.name} />
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
      </header>

      {/* Gallery */}
      <StartupGallery
        startupName={startup.name}
        media={media}
        videoUrl={videoUrl ?? startup.demo_video_url}
      />

      {/* About the product */}
      <section aria-label="About the product" className="rounded-xl border bg-card p-5 sm:p-6">
        <h2 className="text-h2">About the Product</h2>
        <div
          className="mt-3"
          // Rendered from escaped markdown — see lib/markdown.ts.
          dangerouslySetInnerHTML={{ __html: renderMarkdown(pitch) }}
        />
      </section>

      {/* Waitlist capture + founder tools */}
      <section id="waitlist" aria-label="Beta waitlist" className="rounded-xl border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-h2">Join the Beta Waitlist</h2>
            <p className="mt-1 text-caption text-muted-foreground">
              Get an invite as soon as {startup.name} opens the next cohort.{" "}
              <span className="font-medium text-foreground">
                {totalWaitlist}
              </span>{" "}
              builders are already in line.
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

        {canManage && !viewer.backendConfigured && (
          <p className="mt-3 flex items-center gap-1.5 text-tiny text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Founder preview (demo mode) — once auth is wired, this panel is
            gated by the owner check on `startups.founder_id`.
          </p>
        )}
      </section>

      {/* Discussion */}
      <CommentThread
        slug={startup.slug}
        startupName={startup.name}
        comments={comments}
        isFounderView={canManage}
        className={cn(founderReplies > 0 && "lg:max-w-none")}
      />
    </div>
  );
}
