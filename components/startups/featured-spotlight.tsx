import Link from "next/link";
import { ArrowUpRight, Flame, MessageSquare, TrendingUp, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import type { StartupWithTags } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StartupLogo } from "@/components/startups/startup-logo";
import { TagPill } from "@/components/startups/tag-pill";
import { UpvoteButton } from "@/components/startups/upvote-button";
import {
  MARKET_LABELS,
  STAGE_LABELS,
  type StartupCardUpvote,
} from "@/components/startups/startup-card";

export interface FeaturedSpotlightProps {
  startup: StartupWithTags;
  upvote: StartupCardUpvote;
  className?: string;
}

/**
 * Featured Launch Card (Section 12 & 13 Spec Fix):
 * Compact, intentional padding (24px), no empty header visual region,
 * clear hierarchy (Promoted header, logo, name, description, tags, traction stats, action buttons).
 */
export function FeaturedSpotlight({
  startup,
  upvote,
  className,
}: FeaturedSpotlightProps) {
  return (
    <article
      className={cn(
        "godly-card deck-card godly-bg-glow animate-fade-in-up relative overflow-hidden p-6 sm:p-7 border-accent/40 bg-card shadow-apple-md transition-all duration-300",
        className
      )}
    >
      {/* Top Meta Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E4E4E7] pb-4 mb-5">
        <div className="flex items-center gap-2">
          <Badge className="gap-1.5 bg-[#DC2626] text-[#FAFAFA] font-mono font-bold text-badge uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
            <Flame className="h-3.5 w-3.5 fill-current text-[#FAFAFA]" aria-hidden />
            FEATURED
          </Badge>
          <span className="text-meta font-medium text-[#71717A]">
            Featured launch of the day
          </span>
        </div>
        <span className="text-meta text-[#DC2626] font-mono font-semibold">
          Spotlight
        </span>
      </div>

      {/* Main Content Layout */}
      <div className="space-y-4">
        {/* Startup Identity Header */}
        <div className="flex items-start gap-4">
          <StartupLogo
            name={startup.name}
            logoUrl={startup.logo_url}
            seed={startup.slug}
            size={64}
            className="shrink-0"
          />
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-product font-bold text-foreground">
                {startup.name}
              </h3>
              <Badge variant="stage">{STAGE_LABELS[startup.stage]}</Badge>
              <Badge
                variant={
                  startup.target_market === "global_export" ? "global" : "nepal"
                }
              >
                {MARKET_LABELS[startup.target_market]}
              </Badge>
            </div>
            <p className="text-body font-medium text-text-secondary">
              {startup.tagline}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-body text-text-secondary leading-relaxed">
          {startup.description}
        </p>

        {/* Tech Stack & Tags */}
        {startup.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {startup.tags.map((tag) => (
              <TagPill key={tag.id} tag={tag} />
            ))}
          </div>
        )}

        {/* Traction Stats & Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4 mt-5">
          <dl className="flex flex-wrap items-center gap-x-5 gap-y-1 text-meta text-text-secondary">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-primary" aria-hidden />
              <dt className="sr-only">Upvotes</dt>
              <dd className="font-semibold tabular-nums text-foreground">{upvote.count} upvotes</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-text-muted" aria-hidden />
              <dt className="sr-only">Waitlist</dt>
              <dd className="font-medium tabular-nums">
                {startup.waitlist_count} on waitlist
              </dd>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-text-muted" aria-hidden />
              <dt className="sr-only">Comments</dt>
              <dd className="font-medium tabular-nums">
                {startup.comments_count} comments
              </dd>
            </div>
          </dl>

          <div className="flex items-center gap-2.5">
            <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
              <Link href={`/startups/${startup.slug}#waitlist`}>
                Join Beta Waitlist
              </Link>
            </Button>
            {startup.website_url && (
              <Button asChild variant="outline" size="sm">
                <a
                  href={startup.website_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Demo
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </a>
              </Button>
            )}
            <UpvoteButton
              size="default"
              count={upvote.count}
              voted={upvote.voted}
              pending={upvote.pending}
              onToggle={upvote.onToggle}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
