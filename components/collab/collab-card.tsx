"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MessageCircle, Send } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CollabPost, CollabType } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface CollabCardProps {
  post: CollabPost & {
    author_name?: string;
    author_username?: string;
    startup_name?: string | null;
    startup_slug?: string | null;
  };
  className?: string;
}

const ROLE_LABELS: Record<CollabType, string> = {
  cofounder: "Looking for Co-founder",
  founding_engineer: "Founding Engineer",
  designer: "UI/UX Reviewer",
  beta_tester: "First Beta Users",
  intern: "Internship",
};

type ChannelKind = "whatsapp" | "telegram" | "email";

function channelKind(channel: string): ChannelKind {
  const ch = channel.toLowerCase();
  if (ch.startsWith("https://wa.me/") || ch.includes("whatsapp")) return "whatsapp";
  if (ch.includes("t.me") || ch.includes("telegram")) return "telegram";
  return "email";
}

function channelIcon(kind: ChannelKind) {
  if (kind === "whatsapp") return <MessageCircle className="h-3.5 w-3.5" aria-hidden />;
  if (kind === "telegram") return <Send className="h-3.5 w-3.5" aria-hidden />;
  return <Mail className="h-3.5 w-3.5" aria-hidden />;
}

const CHANNEL_LABELS: Record<ChannelKind, string> = {
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  email: "Email",
};

/** Builder-request card for the /collab board (DESIGN.md §4.5). */
export function CollabCard({ post, className }: CollabCardProps) {
  const [revealed, setRevealed] = useState(false);
  const kind = channelKind(post.contact_channel);

  return (
    <article
      className={cn(
        "flex flex-col rounded-xl border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        !post.is_active && "opacity-70",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="nepal">{ROLE_LABELS[post.role_type]}</Badge>
        {post.is_active ? (
          <Badge variant="verified">Active</Badge>
        ) : (
          <Badge variant="secondary">Closed</Badge>
        )}
      </div>

      <h3 className="mt-2 text-h2 leading-snug">{post.title}</h3>

      <p className="mt-1 text-caption text-muted-foreground">
        by {post.author_name ?? "Wefounder builder"}
        {post.startup_slug ? (
          <>
            {" · "}
            <Link
              href={`/startups/${post.startup_slug}`}
              className="font-medium hover:text-foreground"
            >
              {post.startup_name ?? "view startup"}
            </Link>
          </>
        ) : null}
      </p>

      <p className="mt-2 line-clamp-3 text-body text-muted-foreground">
        {post.description}
      </p>

      {post.equity_or_compensation && (
        <p className="mt-2 inline-flex w-fit items-center rounded-md border border-badge-khalti/25 bg-badge-khalti/10 px-2 py-1 text-caption font-medium text-foreground">
          💼 {post.equity_or_compensation}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        {revealed ? (
          <Button asChild size="sm" variant="outline">
            <a
              href={
                kind === "email" && !post.contact_channel.startsWith("mailto:")
                  ? `mailto:${post.contact_channel}`
                  : post.contact_channel
              }
              target={kind === "email" ? undefined : "_blank"}
              rel="noopener noreferrer"
            >
              {channelIcon(kind)}
              {CHANNEL_LABELS[kind]}
            </a>
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setRevealed(true)}>
            {channelIcon(kind)}
            Reveal Contact
          </Button>
        )}
      </div>
    </article>
  );
}
