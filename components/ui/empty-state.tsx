import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  /** One sentence explaining why the area is empty. */
  description: string;
  /** Optional second line for extra context. */
  hint?: string;
  /** Optional call to action — pass `href` for navigation or `onClick` for a handler. */
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Escape hatch for call-to-action controls that carry their own trigger
   *  (an existing modal button, a form). Renders under the copy. */
  actionSlot?: ReactNode;
  className?: string;
  compact?: boolean;
}

/**
 * The single empty state used by every data-driven surface.
 *
 * An empty database is a normal state, not an error, so it gets the same
 * deliberate treatment as loaded content instead of a blank region.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  hint,
  action,
  actionSlot,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "godly-card flex flex-col items-center justify-center rounded-[22px] border-dashed bg-white text-center",
        compact ? "px-6 py-10" : "px-6 py-14",
        className
      )}
    >
      <span
        aria-hidden
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary"
      >
        <Icon className="h-5 w-5" />
      </span>

      <h3 className="text-subheading font-bold text-foreground">{title}</h3>
      <p className="mt-1.5 max-w-sm text-caption text-muted-foreground">
        {description}
      </p>

      {hint && (
        <p className="mt-2 max-w-sm text-tiny text-muted-foreground">{hint}</p>
      )}

      {action?.href && (
        <Button asChild variant="outline" size="sm" className="mt-5 rounded-full">
          <a href={action.href}>{action.label}</a>
        </Button>
      )}

      {action?.onClick && (
        <Button
          variant="outline"
          size="sm"
          className="mt-5 rounded-full"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}

      {actionSlot && <div className="mt-5">{actionSlot}</div>}
    </div>
  );
}