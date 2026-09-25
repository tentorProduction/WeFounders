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
        "godly-card deck-card animate-fade-in-up group relative transition-all duration-200 cursor-pointer shadow-apple-sm hover:shadow-apple-md",
        "rounded-[16px] border border-[#26282F] bg-[#15171C] p-4",
        className
      )}
    >
      {/* ========================================================= */}
      {/* MOBILE LAYOUT (≤ 768px): Dedicated Single-Column Stack     */}
      {/* ========================================================= */}
      <div className="block md:hidden space-y-2.5">
        {/* TOP ROW: Monogram tile (48px) + Product Name/Rank (Center) + Upvote (FAR RIGHT) */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href={`/startups/${startup.slug}`}
              aria-label={`Open ${startup.name}`}
              className="press-scale shrink-0"
            >
              <StartupLogo
                name={startup.name}
                logoUrl={startup.logo_url}
                seed={startup.slug}
                size={48}
              />
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                {typeof rank === "number" && (
                  <span className="text-[12px] font-mono font-medium text-[#9A958A]">
                    #{rank}
                  </span>
                )}
                <Link
                  href={`/startups/${startup.slug}`}
                  className="font-archivo text-[17px] font-bold text-[#F5F1E8] truncate hover:text-[#B98A45] transition-colors"
                >
                  {startup.name}
                </Link>
              </div>
            </div>
          </div>

          {/* Upvote Button Pinned Far Right (Min 44px Touch Target) */}
          <div className="shrink-0 flex items-center justify-end min-w-[44px] min-h-[44px]">
            <UpvoteButton
              count={upvote.count}
              voted={upvote.voted}
              pending={upvote.pending}
              onToggle={upvote.onToggle}
            />
          </div>
        </div>

        {/* BADGE ROW: Dedicated row for PUBLIC BETA / STAGE / MARKET pills */}
        <div className="flex flex-wrap items-center gap-[6px]">
          <Badge variant="stage" className="text-[11px] font-mono px-[10px] py-[4px] rounded-full">
            {STAGE_LABELS[startup.stage]}
          </Badge>
          <Badge
            variant={startup.target_market === "global_export" ? "global" : "nepal"}
            className="text-[11px] font-mono px-[10px] py-[4px] rounded-full"
          >
            {MARKET_LABELS[startup.target_market]}
          </Badge>
          {gateways.map((tag) => {
            const gateway = GATEWAY_BADGES[tag.slug];
            return (
              <Badge key={tag.id} variant={gateway.variant} className="text-[11px] font-mono px-[10px] py-[4px] rounded-full">
                {gateway.label}
              </Badge>
            );
          })}
        </div>

        {/* DESCRIPTION: Full card width, high contrast #B5B0A4, line-height 1.6 */}
        <Link
          href={`/startups/${startup.slug}`}
          className="block text-[14px] font-sans text-[#B5B0A4] leading-relaxed w-full hover:text-[#F5F1E8] transition-colors"
        >
          {startup.tagline}
        </Link>

        {/* TAGS ROW: flex-wrap freely, 6px gap, 12px font #9A958A text on #0E0F13 bg */}
        {startup.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-[6px] pt-0.5">
            {ecosystemTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => onSelectTag?.(tag)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-[8px] border border-[#26282F] bg-[#0E0F13] px-2.5 py-1 text-[12px] font-mono text-[#9A958A] transition-colors",
                  activeTagSlug === tag.slug && "border-[#B98A45] text-[#B98A45] bg-[#B98A45]/10 font-semibold"
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#9A958A]" />
                {tag.name}
              </button>
            ))}
          </div>
        )}

        {/* META ROW: Dedicated bottom row, single line truncated */}
        <div className="pt-2 border-t border-[#26282F]/60 flex items-center justify-between text-[12px] font-mono text-[#9A958A] truncate">
          <div className="flex items-center gap-2 truncate">
            <Link
              href={`/startups/${startup.slug}#waitlist`}
              className="hover:text-[#B98A45] hover:underline font-semibold"
            >
              Waitlist ({startup.waitlist_count})
            </Link>
            <span>·</span>
            <Link
              href={`/startups/${startup.slug}`}
              className="hover:text-[#F5F1E8] flex items-center gap-1"
            >
              💬 {startup.comments_count}
            </Link>
            <span>·</span>
            <span>{timeAgo(startup.launch_date ?? startup.created_at)}</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* DESKTOP LAYOUT (≥ 769px / md:): Untouched Original Grid    */}
      {/* ========================================================= */}
      <div className="hidden md:grid md:grid-cols-[52px_1fr_auto] md:items-start md:gap-4">
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
              className="text-product font-archivo font-bold text-[#F5F1E8] transition-colors hover:text-[#B98A45] focus:outline-none"
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
          <Link href={`/startups/${startup.slug}`} className="block text-body text-[#9A958A] line-clamp-2 leading-relaxed hover:text-[#F5F1E8]">
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

        {/* Right: Upvote Control & Action Links */}
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <UpvoteButton
            count={upvote.count}
            voted={upvote.voted}
            pending={upvote.pending}
            onToggle={upvote.onToggle}
          />
          <div className="flex items-center gap-2 text-tiny font-mono text-muted-foreground">
            <Link
              href={`/startups/${startup.slug}#waitlist`}
              className="hover:text-[#B98A45] hover:underline font-semibold"
            >
              Waitlist ({startup.waitlist_count})
            </Link>
            <span>•</span>
            <Link
              href={`/startups/${startup.slug}`}
              className="hover:text-[#F5F1E8] flex items-center gap-1"
            >
              💬 {startup.comments_count}
            </Link>
          </div>
          <span className="text-[11px] text-[#9A958A] font-mono text-right">
            {timeAgo(startup.launch_date ?? startup.created_at)}
          </span>
        </div>
      </div>
    </article>
  );
}
