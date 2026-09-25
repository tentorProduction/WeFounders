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
} from "lucide-react";

import { cn, timeAgo } from "@/lib/utils";
import { renderMarkdown } from "@/lib/markdown";
import { getViewer, isFounderViewer } from "@/lib/auth/viewer";
import { getCommentThread } from "@/lib/comments";
import { getStartupBySlug } from "@/lib/data/startups";
import { getStartupMedia, getStartupVideoUrl } from "@/lib/data/media";
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
}

// Reads the viewer's session to decide whether founder tools are shown.
export const dynamic = "force-dynamic";

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
export default async function StartupShowcasePage({ params }: PageProps) {
  const { slug } = await params;
  const startup = await getStartupBySlug(slug);

  if (!startup) notFound();

  const [media, videoUrl, comments, viewer] = await Promise.all([
    getStartupMedia(startup.id),
    getStartupVideoUrl(startup.id),
    getCommentThread(startup.id),
    getViewer(),
  ]);

  // The founder's own markdown is the "About the Product" copy.
  const pitch = startup.description;
  const canManage = isFounderViewer(viewer, startup);
  const totalWaitlist = startup.waitlist_count;
  const founderReplies = comments.filter((comment) => comment.is_founder_reply).length;
  const primaryTag =
    startup.tags.find((tag) => tag.category === "industry") ?? startup.tags[0];

  const exportHref = `/startups/${startup.slug}/waitlist/export`;

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
                  {comments.length} {comments.length === 1 ? "comment" : "comments"}
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
      <section aria-label="About the product" className="rounded-lg border border-border bg-card p-5 sm:p-6 space-y-3">
        <h2 className="text-h2 font-bold text-foreground">About the Product</h2>
        {pitch.trim() ? (
          <div
            className="mt-3 leading-relaxed text-body"
            // Rendered from escaped markdown — see lib/markdown.ts.
            dangerouslySetInnerHTML={{ __html: renderMarkdown(pitch) }}
          />
        ) : (
          <p className="mt-3 text-body text-muted-foreground">
            The founder hasn&apos;t written up {startup.name} yet.
          </p>
        )}
      </section>

      {/* Verified Founder Card */}
      <section aria-label="Founder profile" className="rounded-lg border border-border bg-card p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-tiny font-mono uppercase tracking-wider text-muted-foreground">
            Verified Founder &amp; Maker
          </span>
          <Badge variant="verified" className="font-mono text-tiny">
            OP Verified
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#DC2626] text-[#FFFFFF] font-bold text-h2 font-mono shrink-0">
            {startup.name[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="text-subheading font-bold text-foreground flex items-center gap-2">
              <span>{startup.name} Founding Team</span>
              <Badge variant="outline" className="text-[10px] font-mono border-[#DC2626]/40 text-[#991B1B]">
                OP
              </Badge>
            </h3>
            <p className="text-caption text-muted-foreground">
              Building for {MARKET_LABELS[startup.target_market]} · Kathmandu NPT
            </p>
          </div>
        </div>
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
