"use client";

import { FormEvent, useState, useTransition } from "react";
import { CheckCircle2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { approveAllPending, createManualStartup, type ManualStartupInput } from "@/app/admin/actions";
import type { StartupStage, TargetMarket } from "@/types/database";

const fieldClass = "mt-1 w-full rounded-lg border border-[#27272A] bg-[#0A0A0C] px-3 py-2.5 text-sm text-[#F4F4F5] placeholder:text-[#71717A] focus:border-[#FACC15] focus:outline-none";

export function OverviewActions({ pendingCount }: { pendingCount: number }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [entryOpen, setEntryOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const runApproveAll = () => startTransition(async () => {
    setError(null);
    try {
      await approveAllPending();
      setConfirmOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not approve pending startups.");
    }
  });

  const submitManualStartup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const input: ManualStartupInput = {
      name: String(form.get("name") ?? ""),
      tagline: String(form.get("tagline") ?? ""),
      description: String(form.get("description") ?? ""),
      websiteUrl: String(form.get("websiteUrl") ?? ""),
      founderEmail: String(form.get("founderEmail") ?? ""),
      targetMarket: String(form.get("targetMarket")) as TargetMarket,
      stage: String(form.get("stage")) as StartupStage,
    };

    startTransition(async () => {
      setError(null);
      try {
        await createManualStartup(input);
        setEntryOpen(false);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not add this startup.");
      }
    });
  };

  const closeModals = () => {
    setConfirmOpen(false);
    setEntryOpen(false);
    setError(null);
  };

  return (
    <>
      <div className="rounded-xl border border-[#27272A] bg-[#121215] p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-[#F4F4F5]">Quick Actions</h2>
        <p className="mt-1 text-sm text-[#A1A1AA]">Manage the launch queue and add a founder submitted outside the form.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Button onClick={() => setConfirmOpen(true)} disabled={!pendingCount} className="min-h-11 justify-start gap-2 bg-[#FACC15] text-[#0A0A0C] hover:bg-[#EAB308] disabled:opacity-40">
            <CheckCircle2 className="h-4 w-4" /> Approve all pending ({pendingCount})
          </Button>
          <Button onClick={() => setEntryOpen(true)} variant="outline" className="min-h-11 justify-start gap-2 border-[#3F3F46] bg-transparent text-[#F4F4F5] hover:bg-[#1C1C20]">
            <Plus className="h-4 w-4" /> Add startup manually
          </Button>
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-rose-400">{error}</p>}
      </div>

      {(confirmOpen || entryOpen) && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModals(); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="admin-modal-title" className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl border border-[#27272A] bg-[#121215] p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="admin-modal-title" className="text-lg font-semibold text-[#F4F4F5]">{confirmOpen ? "Approve all pending submissions?" : "Add startup manually"}</h2>
                <p className="mt-1 text-sm text-[#A1A1AA]">{confirmOpen ? `${pendingCount} startups will be approved for today’s Kathmandu batch.` : "The startup will enter Pending Review and use an existing founder profile."}</p>
              </div>
              <button onClick={closeModals} aria-label="Close dialog" className="rounded-md p-2 text-[#A1A1AA] hover:bg-[#27272A] hover:text-white"><X className="h-4 w-4" /></button>
            </div>

            {confirmOpen ? (
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={closeModals} className="border-[#3F3F46] bg-transparent text-[#F4F4F5]">Cancel</Button>
                <Button onClick={runApproveAll} disabled={isPending} className="bg-[#FACC15] text-[#0A0A0C] hover:bg-[#EAB308]">{isPending ? "Approving…" : "Approve all"}</Button>
              </div>
            ) : (
              <form onSubmit={submitManualStartup} className="mt-5 space-y-3">
                <label className="block text-sm text-[#D4D4D8]">Startup name<input name="name" required minLength={2} maxLength={80} className={fieldClass} /></label>
                <label className="block text-sm text-[#D4D4D8]">Tagline<input name="tagline" required minLength={5} maxLength={180} className={fieldClass} /></label>
                <label className="block text-sm text-[#D4D4D8]">Founder email<input name="founderEmail" type="email" required className={fieldClass} /></label>
                <label className="block text-sm text-[#D4D4D8]">Website URL<input name="websiteUrl" type="url" required placeholder="https://" className={fieldClass} /></label>
                <label className="block text-sm text-[#D4D4D8]">Pitch story<textarea name="description" required rows={3} maxLength={10000} className={fieldClass} /></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm text-[#D4D4D8]">Market<select name="targetMarket" className={fieldClass}><option value="nepal_domestic">Made for Nepal</option><option value="global_export">Built for World</option><option value="hybrid">Nepal + Global</option></select></label>
                  <label className="block text-sm text-[#D4D4D8]">Stage<select name="stage" className={fieldClass}><option value="concept">Concept</option><option value="closed_alpha">Closed alpha</option><option value="public_beta">Public beta</option><option value="launched">Launched</option></select></label>
                </div>
                {error && <p role="alert" className="text-sm text-rose-400">{error}</p>}
                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={closeModals} className="border-[#3F3F46] bg-transparent text-[#F4F4F5]">Cancel</Button>
                  <Button type="submit" disabled={isPending} className="bg-[#FACC15] text-[#0A0A0C] hover:bg-[#EAB308]">{isPending ? "Adding…" : "Add to review queue"}</Button>
                </div>
              </form>
            )}
            {confirmOpen && error && <p role="alert" className="mt-3 text-sm text-rose-400">{error}</p>}
          </section>
        </div>
      )}
    </>
  );
}
