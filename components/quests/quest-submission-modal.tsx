"use client";

import { useActionState, useEffect, useState } from "react";
import { CheckCircle2, Loader2, Upload } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  initialQuestSubmissionState,
  type QuestSubmissionActionState,
} from "@/lib/action-state";
import { submitQuestProofAction } from "@/actions/quests";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export interface QuestSubmissionModalProps {
  questId: string;
  questTitle: string;
  reward?: string | null;
  testerNameHint?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

const RATING_FIELDS = [
  { key: "ux", name: "ratingUx", label: "UX" },
  { key: "speed", name: "ratingSpeed", label: "Speed" },
] as const;

type RatingKey = (typeof RATING_FIELDS)[number]["key"];

function isActionState(value: unknown): value is QuestSubmissionActionState {
  return (
    typeof value === "object" && value !== null && "status" in (value as object)
  );
}

/**
 * "Accept Quest / Submit Proof" dialog (DESIGN.md §4.4): tester name, bug
 * screenshot picker, 1–5 UX and speed rating sliders, and a feedback
 * description — submitted through the `submitQuestProofAction` server action.
 */
export function QuestSubmissionModal({
  questId,
  questTitle,
  reward,
  testerNameHint,
  open,
  onOpenChange,
  className,
}: QuestSubmissionModalProps) {
  const [state, formAction, isPending] = useActionState(
    submitQuestProofAction,
    initialQuestSubmissionState
  );
  const [formKey, setFormKey] = useState(0);
  const [testerName, setTesterName] = useState("");
  const [feedback, setFeedback] = useState("");
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [ratings, setRatings] = useState<Record<RatingKey, number>>({
    ux: 3,
    speed: 3,
  });
  // Environment snapshot — captured after mount, since `window`/`navigator`
  // don't exist during SSR.
  const [device, setDevice] = useState({ platform: "", screen: "", connection: "unknown" });

  useEffect(() => {
    if (!open) return;
    setDevice({
      platform: navigator.platform,
      screen: `${window.screen.width}x${window.screen.height}`,
      connection:
        (navigator as Navigator & { connection?: { effectiveType?: string } })
          .connection?.effectiveType ?? "unknown",
    });
  }, [open]);

  // Reset the form when the dialog is reopened after a success.
  useEffect(() => {
    if (open && state.status === "success") {
      setFormKey((key) => key + 1);
      setTesterName("");
      setFeedback("");
      setScreenshots([]);
      setRatings({ ux: 3, speed: 3 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const actionError =
    state.status === "error" && state.message ? state.message : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-lg", className)}>
        <DialogHeader>
          <DialogTitle>Accept Quest — Submit Proof</DialogTitle>
          <DialogDescription>{questTitle}</DialogDescription>
        </DialogHeader>

        {state.status === "success" ? (
          <div className="space-y-3 py-2">
            <p className="flex items-center gap-2 text-body font-semibold text-[#0b815a] dark:text-badge-verified">
              <CheckCircle2 className="h-5 w-5" aria-hidden />
              Proof submitted
            </p>
            <p className="text-caption text-muted-foreground">{state.message}</p>
            <Button className="w-full" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        ) : (
          <form key={formKey} action={formAction} className="space-y-4">
            <input type="hidden" name="questId" value={questId} />
            <input type="hidden" name="ratingUx" value={ratings.ux} />
            <input type="hidden" name="ratingSpeed" value={ratings.speed} />
            <input
              type="hidden"
              name="proofScreenshots"
              value={JSON.stringify(screenshots.map((file) => file.name))}
            />
            {/* Environment snapshot captured when the dialog opens. */}
            <input type="hidden" name="devicePlatform" value={device.platform} />
            <input type="hidden" name="deviceScreen" value={device.screen} />
            <input type="hidden" name="deviceConnection" value={device.connection} />

            <div className="space-y-1.5">
              <label htmlFor="tester-name" className="text-caption font-medium">
                Your name
              </label>
              <Input
                id="tester-name"
                name="testerName"
                required
                minLength={2}
                maxLength={40}
                value={testerName}
                onChange={(e) => setTesterName(e.target.value)}
                placeholder={
                  testerNameHint ? `e.g. a ${testerNameHint} user` : "Your name"
                }
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="feedback" className="text-caption font-medium">
                What did you find? (bugs, UX issues, suggestions)
              </label>
              <textarea
                id="feedback"
                name="feedbackText"
                required
                rows={4}
                minLength={20}
                maxLength={2000}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="The QR scanner fails on low-end Android when offline…"
                className="w-full rounded-md border border-input bg-card px-3 py-2 text-body placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <p className="text-tiny text-muted-foreground">
                {feedback.trim().length}/20 characters minimum
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="screenshots" className="text-caption font-medium">
                Proof screenshots{" "}
                <span className="text-muted-foreground">(up to 6)</span>
              </label>
              <label
                htmlFor="screenshots"
                className="flex h-20 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border text-caption text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Upload className="h-4 w-4" aria-hidden />
                {screenshots.length > 0
                  ? `${screenshots.length} file(s) selected`
                  : "Click to upload (PNG, JPG — auto-compressed to WebP)"}
              </label>
              <Input
                id="screenshots"
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) =>
                  setScreenshots(Array.from(e.target.files ?? []).slice(0, 6))
                }
              />
              {screenshots.length > 0 && (
                <ul className="space-y-0.5 text-tiny text-muted-foreground">
                  {screenshots.map((file) => (
                    <li key={file.name}>• {file.name}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-caption font-medium">Ratings (1–5)</span>
              {RATING_FIELDS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-14 text-caption text-muted-foreground">
                    {label}
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={ratings[key]}
                    onChange={(e) =>
                      setRatings((r) => ({ ...r, [key]: Number(e.target.value) }))
                    }
                    className="h-1.5 flex-1 accent-[var(--primary)]"
                    aria-label={`${label} rating`}
                  />
                  <span className="w-5 text-center text-caption font-semibold tabular-nums">
                    {ratings[key]}
                  </span>
                </div>
              ))}
            </div>

            {actionError && (
              <p role="alert" className="text-caption font-medium text-destructive">
                {actionError}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || feedback.trim().length < 20}
              >
                {isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                )}
                {isPending ? "Submitting…" : "Submit Report"}
              </Button>
            </DialogFooter>
            {reward && !isActionState(state) && (
              <p className="text-tiny text-muted-foreground">
                Bounty on completion: {reward}
              </p>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
