import Link from "next/link";

import { cn, timeAgo } from "@/lib/utils";
import type {
  StartupStage,
  StartupWithTags,
  TargetMarket,
} from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { StartupLogo } from "@/components/startups/startup-logo";
import { TagPill, type TagPillTag } from "@/components/startups/tag-pill";
import { UpvoteButton } from "@/components/startups/upvote-button";

export interface StartupCardUpvote {
  count: number;
  voted: boolean;
  pending?: boolean;
  onToggle: () => void;
}

export interface StartupCardProps {
  startup: StartupWithTags;
  upvote: StartupCardUpvote;
  onSelectTag?: (tag: TagPillTag) => void;
  activeTagSlug?: string | null;
  rank?: number;
  className?: string;
}

export const STAGE_LABELS: Record<StartupStage, string> = {
  concept: "IDEA",
  closed_alpha: "ALPHA",
  public_beta: "PUBLIC BETA",
  launched: "RECENTLY LAUNCHED",
};

export const MARKET_LABELS: Record<TargetMarket, string> = {
  nepal_domestic: "MADE FOR NEPAL",
  global_export: "BUILT FOR WORLD",
  hybrid: "HYBRID",
};

const GATEWAY_BADGES: Record<
  string,
  { label: string; variant: "esewa" | "khalti" | "fonepay" }
> = {
  esewa: { label: "eSewa", variant: "esewa" },
  khalti: { label: "Khalti", variant: "khalti" },
  fonepay: { label: "Fonepay", variant: "fonepay" },
};

/**
 * Editorial Launch Row (Section 16 & 17 Spec):
 * Grid layout: 52px (logo) 1fr (info) auto (upvote button).
 * Entire row is clickable to launch page, description clamped to 2 lines, badges controlled to 2 max + 3 tags.
 */
export function StartupCard({
  startup,
  upvote,
  onSelectTag,
  activeTagSlug = null,
  rank,
  className,
}: StartupCardProps) {
  const gateways = startup.tags.filter((tag) => GATEWAY_BADGES[tag.slug]);
  const ecosystemTags = startup.tags.filter((tag) => !GATEWAY_BADGES[tag.slug]).slice(0, 3);

  return (
    <article
      className={cn(
        "godly-card deck-card animate-fade-in-up group relative p-4 transition-all duration-200 cursor-pointer shadow-apple-sm hover:shadow-apple-md",
        className
      )}
    >
      <div className="grid grid-cols-[52px_1fr_auto] items-start gap-4">
        {/* Left: 52px Logo */}
        <Link
          href={`/startups/${startup.slug}`}
          aria-label={`Open ${startup.name}`}
          className="press-scale shrink-0"
        >
          <StartupLogo
            name={startup.name}
            logoUrl={startup.logo_url}
            seed={startup.slug}
            size={52}
          />
        </Link>

        {/* Center: Product Information */}
        <div className="min-w-0 space-y-1">
          {/* Row 1 — Title, Rank, Badges */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {typeof rank === "number" && (
              <span
                aria-hidden
                className="text-meta font-semibold tabular-nums text-text-muted font-mono"
              >
                #{rank}
              </span>
            )}
            <Link
              href={`/startups/${startup.slug}`}
              className="text-product font-bold text-foreground transition-colors hover:text-accent focus:outline-none"
            >
              {startup.name}
            </Link>
            <Badge variant="stage">{STAGE_LABELS[startup.stage]}</Badge>
            <Badge
              variant={
                startup.target_market === "global_export" ? "global" : "nepal"
              }
            >
              {MARKET_LABELS[startup.target_market]}
            </Badge>
          </div>

          {/* Row 2 — Clamped Description */}
          <Link href={`/startups/${startup.slug}`} className="block text-body text-text-secondary line-clamp-2 leading-relaxed hover:text-foreground">
            {startup.tagline}
          </Link>

          {/* Row 3 — Tech Stack & Tags */}
          {startup.tags.length > 0 && (
            <div className="pt-1 flex flex-wrap items-center gap-1.5">
              {gateways.map((tag) => {
                const gateway = GATEWAY_BADGES[tag.slug];
                return (
                  <Badge key={tag.id} variant={gateway.variant}>
                    {gateway.label}
                  </Badge>
                );
              })}
              {ecosystemTags.map((tag) => (
                <TagPill
                  key={tag.id}
                  tag={tag}
                  active={activeTagSlug === tag.slug}
                  onSelect={onSelectTag}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Upvote Control & Time */}
        <div className="flex shrink-0 flex-col items-end gap-1">
          <UpvoteButton
            count={upvote.count}
            voted={upvote.voted}
            pending={upvote.pending}
            onToggle={upvote.onToggle}
          />
          <span className="text-meta text-text-muted font-mono text-right">
            {timeAgo(startup.launch_date ?? startup.created_at)}
          </span>
        </div>
      </div>
    </article>
  );
}
