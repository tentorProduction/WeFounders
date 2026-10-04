import Link from "next/link";

import { cn, timeAgo } from "@/lib/utils";
import { plural } from "@/lib/pluralize";
import type {
  StartupStage,
  StartupWithTags,
  TargetMarket,
} from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { StartupLogo } from "@/components/startups/startup-logo";
import { TagPill, type TagPillTag } from "@/components/startups/tag-pill";
import { UpvoteButton } from "@/components/startups/upvote-button";
import { GlobeHemisphereWest, GlobeSimple, MapPin } from "@/components/icons";

export interface StartupCardUpvote {
  count: number;
  voted: boolean;
  pending?: boolean;
  onToggle: () => void;
}

export interface StartupCardProps {
  startup: StartupWithTags;
  upvote?: StartupCardUpvote;
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
  nepal_domestic: "REGIONAL",
  global_export: "GLOBAL",
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

/** Visible technology tags before the row collapses into a "+N" summary. */
const MAX_VISIBLE_TAGS = 3;

/**
 * The one startup card used by the feed, search, leaderboard and every other
 * list. One markup tree scales from 320px to desktop instead of shipping a
 * duplicated mobile layout beside a desktop one.
 */
export function StartupCard({
  startup,
  upvote,
  onSelectTag,
  activeTagSlug = null,
  rank,
  className,
}: StartupCardProps) {
  const href = `/startups/${startup.slug}`;
  const gateways = startup.tags.filter((tag) => GATEWAY_BADGES[tag.slug]);
  const ecosystemTags = startup.tags.filter((tag) => !GATEWAY_BADGES[tag.slug]);
  const visibleTags = ecosystemTags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTagCount = ecosystemTags.length - visibleTags.length;

  return (
    <article
      className={cn(
        "godly-card deck-card group relative transition-all duration-200",
        "rounded-xl border border-border bg-card p-4 sm:p-5",
        className
      )}
    >
      <div className="grid grid-cols-[48px_1fr] gap-x-3.5 sm:grid-cols-[52px_1fr_auto] sm:gap-x-5">
        {/* 1. Logo */}
        <Link href={href} aria-label={`Open ${startup.name}`} className="press-scale">
          <StartupLogo
            name={startup.name}
            logoUrl={startup.logo_url}
            seed={startup.slug}
            size={48}
          />
        </Link>

        {/* 2-6. Identity, status, market, technology */}
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {typeof rank === "number" && (
              <span aria-hidden className="font-mono text-tiny text-muted-foreground">
                #{rank}
              </span>
            )}
            <Link
              href={href}
              className="min-w-0 truncate font-archivo text-[17px] font-bold text-[#17181B] transition-colors hover:text-[#FF4B3E] focus-visible:outline-none sm:text-product"
            >
              {startup.name}
            </Link>
          </div>

          {/* 3. Tagline */}
          <Link
            href={href}
            className="line-clamp-2 block text-caption leading-relaxed text-[#666A73] transition-colors hover:text-[#17181B]"
          >
            {startup.tagline}
          </Link>

          {/* 4-5. Status + market */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="stage" className="px-2 py-0.5 text-tiny">
              {STAGE_LABELS[startup.stage]}
            </Badge>
            <Badge
              variant={startup.target_market === "global_export" ? "global" : "regional"}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-tiny"
            >
              {startup.target_market === "global_export" ? (
                <GlobeHemisphereWest className="h-3 w-3" weight="bold" />
              ) : startup.target_market === "hybrid" ? (
                <GlobeSimple className="h-3 w-3" weight="bold" />
              ) : (
                <MapPin className="h-3 w-3" weight="bold" />
              )}
              {MARKET_LABELS[startup.target_market]}
            </Badge>
            {gateways.map((tag) => {
              const gateway = GATEWAY_BADGES[tag.slug];
              return (
                <Badge key={tag.id} variant={gateway.variant} className="px-2 py-0.5 text-tiny">
                  {gateway.label}
                </Badge>
              );
            })}
          </div>

          {/* 6. Technology — capped, full list lives on the detail page */}
          {ecosystemTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {visibleTags.map((tag) => (
                <TagPill
                  key={tag.id}
                  tag={tag}
                  active={activeTagSlug === tag.slug}
                  onSelect={onSelectTag}
                />
              ))}
              {hiddenTagCount > 0 && (
                <Link
                  href={href}
                  className="font-mono text-tiny text-muted-foreground underline-offset-4 transition-colors hover:text-[#17181B] hover:underline"
                >
                  {`+${hiddenTagCount} more`}
                </Link>
              )}
            </div>
          )}
        </div>

        {/* 7-8. Community metrics + action */}
        <div className="col-span-2 flex items-center justify-between gap-3 border-t border-[#DADDE1]/60 pt-3 sm:col-span-1 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
          <UpvoteButton
            count={upvote?.count ?? startup.upvotes_count}
            voted={upvote?.voted ?? false}
            pending={upvote?.pending ?? false}
            onToggle={upvote?.onToggle ?? (() => {})}
          />

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-tiny text-[#666A73] sm:justify-end">
            <Link
              href={`${href}#waitlist`}
              className="font-semibold transition-colors hover:text-[#FF4B3E] hover:underline"
            >
              {startup.waitlist_count} {plural(startup.waitlist_count, "Waitlist")}
            </Link>
            <span aria-hidden>·</span>
            <Link href={href} className="transition-colors hover:text-[#17181B]">
              {startup.comments_count} {plural(startup.comments_count, "Comment")}
            </Link>
            <span aria-hidden className="hidden sm:inline">
              ·
            </span>
            <span className="hidden sm:inline">
              {timeAgo(startup.launch_date ?? startup.created_at)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
