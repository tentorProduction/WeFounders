"use client";

import { useActionState, useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { initialCollabPostState } from "@/lib/action-state";
import { postOpportunityAction } from "@/actions/collab";
import type { CollabType } from "@/types/database";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export interface PostOpportunityModalProps {
  className?: string;
}

const ROLE_TYPES: { value: CollabType; label: string }[] = [
  { value: "cofounder", label: "Looking for Co-founder" },
  { value: "founding_engineer", label: "Founding Engineer" },
  { value: "designer", label: "UI/UX Reviewer" },
  { value: "beta_tester", label: "First Beta Users" },
  { value: "intern", label: "Internship" },
];

/**
 * "Post an Opportunity" dialog for the Collab & Co-founder Board
 * (DESIGN.md §4.5): role type, title, description, compensation and a
 * flexible contact channel (WhatsApp phone, Telegram handle, or email)
 * submitted through the `postOpportunityAction` server action.
 */
export function PostOpportunityModal({ className }: PostOpportunityModalProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    postOpportunityAction,
    initialCollabPostState
  );
  const [formKey, setFormKey] = useState(0);
  const [roleType, setRoleType] = useState<CollabType>("cofounder");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [compensation, setCompensation] = useState("");
  const [contact, setContact] = useState("");

  // Reset the form when the dialog is reopened after a success.
  useEffect(() => {
    if (open && state.status === "success") {
      setFormKey((key) => key + 1);
      setRoleType("cofounder");
      setTitle("");
      setDescription("");
      setCompensation("");
      setContact("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">+ Post an Opportunity</Button>
      </DialogTrigger>
      <DialogContent className={cn("sm:max-w-lg", className)}>
        <DialogHeader>
          <DialogTitle>Post an Opportunity</DialogTitle>
          <DialogDescription>
            Reach Nepali builders looking for their next project.
          </DialogDescription>
        </DialogHeader>

        {state.status === "success" ? (
          <div className="space-y-3 py-2">
            <p className="flex items-center gap-2 text-body font-semibold text-[#0b815a] dark:text-badge-verified">
              <CheckCircle2 className="h-5 w-5" aria-hidden />
              Listing posted
            </p>
            <p className="text-caption text-muted-foreground">{state.message}</p>
            <Button className="w-full" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        ) : (
          <form key={formKey} action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="role-type" className="text-caption font-medium">
                Role type
              </label>
              <select
                id="role-type"
                name="roleType"
                value={roleType}
                onChange={(e) => setRoleType(e.target.value as CollabType)}
                className="h-9 w-full rounded-md border border-input bg-card px-3 text-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {ROLE_TYPES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="opp-title" className="text-caption font-medium">
                Title
              </label>
              <Input
                id="opp-title"
                name="title"
                required
                minLength={10}
                maxLength={150}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Looking for a full-stack engineer for an AI legal assistant"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="opp-desc" className="text-caption font-medium">
                Description
              </label>
              <textarea
                id="opp-desc"
                name="description"
                required
                rows={4}
                minLength={40}
                maxLength={2000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What are you building? Who are you looking for? What does success look like?"
                className="w-full rounded-md border border-input bg-card px-3 py-2 text-body placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="opp-comp" className="text-caption font-medium">
                Equity / compensation{" "}
                <span className="text-muted-foreground">(optional)</span>
              </label>
              <Input
                id="opp-comp"
                name="equityOrCompensation"
                maxLength={120}
                value={compensation}
                onChange={(e) => setCompensation(e.target.value)}
                placeholder="10% equity · or NPR 40,000/mo"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="opp-contact" className="text-caption font-medium">
                Contact channel
              </label>
              <Input
                id="opp-contact"
                name="contactRaw"
                required
                maxLength={200}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="98XXXXXXXX · @telegram_handle · you@example.com"
              />
              <p className="text-tiny text-muted-foreground">
                A phone becomes a WhatsApp link, an @handle becomes Telegram, an
                email becomes mailto. Builders see it only after &ldquo;Reveal&rdquo;.
              </p>
            </div>

            {state.status === "error" && state.message && (
              <p role="alert" className="text-caption font-medium text-destructive">
                {state.message}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                )}
                {isPending ? "Posting…" : "Post Opportunity"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
