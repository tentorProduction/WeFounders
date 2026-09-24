"use client";

import { useActionState, useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { initialWaitlistState } from "@/lib/action-state";
import { joinWaitlistAction } from "@/actions/waitlist";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export interface WaitlistFormProps {
  slug: string;
  startupName: string;
  variant?: "inline" | "modal";
  className?: string;
}

/**
 * Beta waitlist capture (PRD §4.1 / DESIGN.md §4.2). Submitting invokes the
 * `joinWaitlistAction` server action, which validates and records the lead in
 * `waitlist_entries`.
 */
export function WaitlistForm({
  slug,
  startupName,
  variant = "inline",
  className,
}: WaitlistFormProps) {
  const [state, formAction, isPending] = useActionState(
    joinWaitlistAction,
    initialWaitlistState
  );
  const [formKey, setFormKey] = useState(0);
  // Controlled, because React resets an uncontrolled form once a form action
  // resolves — which would wipe the email after a validation error.
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Clear the fields after a successful signup.
  useEffect(() => {
    if (state.status === "success") {
      setFormKey((key) => key + 1);
      setEmail("");
      setPhone("");
    }
  }, [state.status]);

  if (state.status === "success") {
    return (
      <div
        className={cn(
          "rounded-lg border border-badge-verified/30 bg-badge-verified/5 p-4",
          className
        )}
      >
        <p className="flex items-center gap-2 text-body font-semibold text-[#0b815a] dark:text-badge-verified">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          You&apos;re on the list
        </p>
        <p className="mt-1 text-caption text-muted-foreground">{state.message}</p>
        {typeof state.position === "number" && (
          <p className="mt-1 text-caption text-muted-foreground">
            You&apos;re roughly{" "}
            <span className="font-semibold tabular-nums text-foreground">
              #{state.position}
            </span>{" "}
            in line for {startupName}.
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      key={formKey}
      action={formAction}
      className={cn(
        variant === "inline" && "rounded-lg border bg-secondary/40 p-4",
        "space-y-3",
        className
      )}
    >
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="referralSource" value={variant} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor={`waitlist-email-${variant}`}
            className="text-caption font-medium"
          >
            Email <span className="text-primary">*</span>
          </label>
          <Input
            id={`waitlist-email-${variant}`}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={`waitlist-phone-${variant}`}
            className="text-caption font-medium"
          >
            Phone <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            id={`waitlist-phone-${variant}`}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="98XXXXXXXX"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {isPending ? "Joining…" : "Join Beta Waitlist"}
        </Button>
        <p className="text-tiny text-muted-foreground">
          No spam — we only email you about this beta.
        </p>
      </div>

      {state.status === "error" && (
        <p role="alert" className="text-caption font-medium text-destructive">
          {state.message}
        </p>
      )}
    </form>
  );
}

export interface WaitlistCtaProps {
  slug: string;
  startupName: string;
  label?: string;
  className?: string;
}

/** Primary hero CTA that opens the waitlist dialog (DESIGN.md §4.2). */
export function WaitlistCta({
  slug,
  startupName,
  label = "Join Beta Waitlist",
  className,
}: WaitlistCtaProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={className}>{label}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join the {startupName} beta waitlist</DialogTitle>
          <DialogDescription>
            Get an invite as soon as the next testing cohort opens.
          </DialogDescription>
        </DialogHeader>
        <WaitlistForm slug={slug} startupName={startupName} variant="modal" />
      </DialogContent>
    </Dialog>
  );
}
