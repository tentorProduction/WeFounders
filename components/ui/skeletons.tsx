import { cn } from "@/lib/utils";

/**
 * Skeletons sized to match the real components so swapping in data does not
 * shift the layout.
 */

function Bar({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-full bg-[#E7E9ED]", className)} />;
}

export function StartupCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "godly-card rounded-[22px] border border-[#DADDE1] bg-white p-5",
        className
      )}
    >
      <div className="flex items-start gap-5">
        <Bar className="h-[58px] w-[58px] shrink-0 rounded-[16px]" />
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex items-center gap-2">
            <Bar className="h-4 w-32" />
            <Bar className="h-5 w-20 rounded-full" />
            <Bar className="h-5 w-24 rounded-full" />
          </div>
          <Bar className="h-3.5 w-full max-w-md" />
          <Bar className="h-3.5 w-2/3 max-w-xs" />
          <div className="flex gap-1.5 pt-1">
            <Bar className="h-6 w-16 rounded-[8px]" />
            <Bar className="h-6 w-20 rounded-[8px]" />
            <Bar className="h-6 w-14 rounded-[8px]" />
          </div>
        </div>
        <div className="hidden shrink-0 flex-col items-end gap-2 md:flex">
          <Bar className="h-9 w-16 rounded-full" />
          <Bar className="h-3 w-28" />
        </div>
      </div>
    </div>
  );
}

export function LeaderboardSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-hidden className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 rounded-[16px] border border-[#DADDE1] bg-white px-4 py-4"
        >
          <Bar className="h-6 w-8 shrink-0" />
          <Bar className="h-10 w-10 shrink-0 rounded-[12px]" />
          <div className="flex-1 space-y-2">
            <Bar className="h-3.5 w-40" />
            <Bar className="h-3 w-64 max-w-full" />
          </div>
          <Bar className="h-7 w-14 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function QuestSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div aria-hidden className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="godly-card rounded-[22px] border border-[#DADDE1] bg-white p-5"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Bar className="h-5 w-24 rounded-full" />
              <Bar className="h-5 w-20 rounded-full" />
            </div>
            <Bar className="h-4 w-3/5" />
            <Bar className="h-3.5 w-full" />
            <Bar className="h-3.5 w-4/5" />
            <Bar className="h-9 w-36 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CollabSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div aria-hidden className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="godly-card rounded-[22px] border border-[#DADDE1] bg-white p-5"
        >
          <div className="space-y-3">
            <Bar className="h-5 w-32 rounded-full" />
            <Bar className="h-4 w-2/3" />
            <Bar className="h-3.5 w-full" />
            <div className="flex gap-2 pt-1">
              <Bar className="h-6 w-20 rounded-full" />
              <Bar className="h-6 w-24 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SearchResultsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div aria-hidden className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <StartupCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div aria-hidden className="space-y-6">
      <div className="godly-card rounded-[22px] border border-[#DADDE1] bg-white p-6">
        <div className="flex items-center gap-4">
          <Bar className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Bar className="h-5 w-44" />
            <Bar className="h-3.5 w-28" />
          </div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="godly-card rounded-[22px] border border-[#DADDE1] bg-white p-5"
          >
            <Bar className="h-3.5 w-24" />
            <Bar className="mt-3 h-7 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Announced by screen readers while a list loads. */
export function LoadingAnnouncer({ label }: { label: string }) {
  return (
    <span role="status" aria-live="polite" className="sr-only">
      {label}
    </span>
  );
}