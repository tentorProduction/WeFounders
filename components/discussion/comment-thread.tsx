"use client";

import { useActionState, useEffect, useState } from "react";
import { BadgeCheck, Loader2 } from "lucide-react";

import { cn, timeAgo } from "@/lib/utils";
import type { CommentWithAuthor } from "@/types/database";
import { initialCommentState } from "@/lib/action-state";
import { postCommentAction } from "@/actions/comments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface CommentThreadProps {
  slug: string;
  startupName: string;
  comments: CommentWithAuthor[];
  /** The viewer is the startup's founder (verified) — enables founder replies. */
  isFounderView: boolean;
  className?: string;
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Discussion & feedback thread (PRD §4.1 / DESIGN.md §4.2). Replies from the
 * startup creator carry a verified "Maker / Founder" badge.
 */
export function CommentThread({
  slug,
  startupName,
  comments,
  isFounderView,
  className,
}: CommentThreadProps) {
  const [state, formAction, isPending] = useActionState(
    postCommentAction,
    initialCommentState
  );
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (state.status === "success") setFormKey((key) => key + 1);
  }, [state.status]);

  return (
    <section aria-label="Discussion" className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-h2">Discussion &amp; Feedback</h2>
        <span className="text-caption text-muted-foreground">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </span>
      </div>

      <ul className="space-y-3">
        {comments.map((comment) => (
          <li
            key={comment.id}
            className={cn(
              "rounded-xl border bg-card p-4",
              comment.is_founder_reply && "border-primary/30 bg-accent/40"
            )}
          >
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-badge-khalti text-tiny font-bold text-white"
              >
                {initials(comment.author.full_name)}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-caption font-semibold">
                    {comment.author.full_name}
                  </span>
                  {comment.is_founder_reply && (
                    <Badge variant="verified" className="gap-1 normal-case">
                      <BadgeCheck className="h-3 w-3" aria-hidden />
                      Maker / Founder
                    </Badge>
                  )}
                </div>
                <p className="text-tiny text-muted-foreground">
                  @{comment.author.username}
                  {comment.author.karma_score > 0 &&
                    ` · ${comment.author.karma_score} karma`}
                  {` · ${timeAgo(comment.created_at)}`}
                </p>
              </div>
            </div>

            <p className="mt-2.5 text-body text-muted-foreground">
              {comment.content}
            </p>
          </li>
        ))}

        {comments.length === 0 && (
          <li className="rounded-xl border border-dashed bg-card/50 p-6 text-center text-caption text-muted-foreground">
            No feedback yet — be the first to tell {startupName} what to fix.
          </li>
        )}
      </ul>

      {/* Composer */}
      <form
        key={formKey}
        action={formAction}
        className="space-y-3 rounded-xl border bg-card p-4"
      >
        <input type="hidden" name="slug" value={slug} />

        <div className="space-y-1.5">
          <label htmlFor="comment-author" className="text-caption font-medium">
            Your name
          </label>
          <Input
            id="comment-author"
            name="authorName"
            required
            minLength={2}
            maxLength={40}
            placeholder="Rohit Shrestha"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="comment-content" className="text-caption font-medium">
            {isFounderView ? "Reply as the maker" : "Share your feedback"}
          </label>
          <textarea
            id="comment-content"
            name="content"
            required
            minLength={2}
            maxLength={1200}
            rows={3}
            placeholder={
              isFounderView
                ? "Thanks for testing! Here's what we changed…"
                : "What worked, what broke, and what you'd change…"
            }
            className="w-full rounded-md border border-input bg-card px-3 py-2 text-body placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {isFounderView && (
          <label className="flex items-center gap-2 text-caption">
            <input
              type="checkbox"
              name="asFounder"
              defaultChecked
              className="h-3.5 w-3.5 accent-[var(--primary)]"
            />
            Post with the verified{" "}
            <span className="font-semibold">Maker / Founder</span> badge
          </label>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {isPending ? "Posting…" : "Post comment"}
          </Button>
          {state.status === "error" && (
            <p role="alert" className="text-caption font-medium text-destructive">
              {state.message}
            </p>
          )}
          {state.status === "success" && (
            <p className="text-caption font-medium text-[#0b815a] dark:text-badge-verified">
              Posted — thanks for the feedback!
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
