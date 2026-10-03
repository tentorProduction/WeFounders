"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title: string;
  description: string;
  /** Omitted when there is nothing meaningful to retry. */
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  compact?: boolean;
}

/**
 * Shown whenever a read or write fails, so a broken request never renders as an
 * empty region that reads like "there is nothing here".
 */
export function ErrorState({
  title,
  description,
  onRetry,
  retryLabel = "Try again",
  className,
  compact = false,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-[22px] border border-destructive/25 bg-destructive/5 text-center",
        compact ? "px-6 py-10" : "px-6 py-14",
        className
      )}
    >
      <span
        aria-hidden
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive"
      >
        <AlertTriangle className="h-5 w-5" />
      </span>

      <h3 className="text-subheading font-bold text-foreground">{title}</h3>
      <p className="mt-1.5 max-w-sm text-caption text-muted-foreground">
        {description}
      </p>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          className="mt-5 rounded-full"
          onClick={onRetry}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}