"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { approveStartup, rejectStartup, scheduleStartupTomorrow, toggleFeatured } from "../actions";
import type { AdminStartup } from "../types";

type QueueTab = "pending" | "scheduled" | "approved" | "rejected";

function marketLabel(market: AdminStartup["target_market"]) {
  return market === "nepal_domestic" ? "Made for Nepal 🇳🇵" : market === "global_export" ? "Built for World 🌎" : "Nepal + Global";
}

export function SubmissionsClient({ submissions }: { submissions: AdminStartup[] }) {
  const [tab, setTab] = useState<QueueTab>("pending");
  const [rejecting, setRejecting] = useState<AdminStartup | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const now = Date.now();
  const pending = submissions.filter((startup) => startup.status === "pending_approval" || startup.status === "draft");
  const approved = submissions.filter((startup) => startup.status === "approved" && new Date(startup.launch_date ?? 0).valueOf() <= now);
  const scheduled = submissions.filter((startup) => startup.status === "approved" && new Date(startup.launch_date ?? 0).valueOf() > now);
  const rejected = submissions.filter((startup) => startup.status === "rejected");
  const tabs: Array<{ id: QueueTab; label: string; count: number }> = [
    { id: "pending", label: "Pending Review", count: pending.length },
    { id: "scheduled", label: "Scheduled for Next Batch", count: scheduled.length },
    { id: "approved", label: "Approved & Live", count: approved.length },
    { id: "rejected", label: "Rejected", count: rejected.length },
  ];
  const displayed = tab === "pending" ? pending : tab === "scheduled" ? scheduled : tab === "approved" ? approved : rejected;

  const run = (id: string, action: () => Promise<void>) => {
    setBusyId(id);
    setErrors((current) => ({ ...current, [id]: "" }));
    startTransition(async () => {
      try {
        await action();
      } catch (cause) {
        setErrors((current) => ({ ...current, [id]: cause instanceof Error ? cause.message : "Could not update this submission." }));
      } finally {
        setBusyId(null);
      }
    });
  };

  const confirmReject = () => {
    if (!rejecting) return;
    const startup = rejecting;
    run(startup.id, async () => {
      await rejectStartup(startup.id, rejectReason);
      setRejecting(null);
      setRejectReason("");
    });
  };

  return (
    <>
      <div role="tablist" aria-label="Submission status" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {tabs.map(({ id, label, count }) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`min-h-10 shrink-0 rounded-full border px-3 text-sm font-medium transition-colors ${tab === id ? "border-[#FACC15] bg-[#FACC15] text-[#0A0A0C]" : "border-[#3F3F46] bg-[#121215] text-[#A1A1AA] hover:border-[#71717A] hover:text-[#F4F4F5]"}`}>
            {label}<span className="ml-1.5 tabular-nums opacity-75">{count}</span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {displayed.length === 0 && (
          <div className="rounded-xl border border-dashed border-[#3F3F46] py-12 text-center text-sm text-[#A1A1AA]">No submissions in this queue.</div>
        )}
        {displayed.map((startup) => {
          const saving = isPending && busyId === startup.id;
          const industryTags = startup.tags.filter((tag) => tag.category === "industry");
          return (
            <article key={startup.id} className="rounded-xl border border-[#27272A] bg-[#121215] p-4 sm:p-6">
              <div className="flex flex-col gap-5 lg:flex-row">
                <div className="min-w-0 flex-1 space-y-4">
                  <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={startup.logo_url || "/icon.svg"} alt="" className="h-12 w-12 shrink-0 rounded-lg border border-[#27272A] bg-[#0A0A0C] object-cover sm:h-14 sm:w-14" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-[#F4F4F5] sm:text-xl">{startup.name}</h2>
                        {startup.is_featured && <Badge className="border border-[#FACC15]/30 bg-[#2A2208] text-[#FACC15]">Spotlight</Badge>}
                      </div>
                      <p className="mt-0.5 text-sm text-[#A1A1AA]">{startup.tagline}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-[#3F3F46] text-[#D4D4D8]">{marketLabel(startup.target_market)}</Badge>
                    {industryTags.map((tag) => <Badge key={tag.id} variant="outline" className="border-[#3F3F46] text-[#A1A1AA]">{tag.name}</Badge>)}
                    {startup.tags.filter((tag) => tag.category !== "industry").map((tag) => <Badge key={tag.id} variant="outline" className="border-[#3F3F46] text-[#A1A1AA]">{tag.name}</Badge>)}
                    <Badge variant="outline" className="border-[#3F3F46] text-[#A1A1AA]">{startup.stage.replaceAll("_", " ")}</Badge>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="min-w-0 rounded-lg border border-[#27272A] bg-[#0A0A0C] p-3">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-[#71717A]">Website</p>
                      <a href={startup.website_url} target="_blank" rel="noreferrer" className="mt-1 block break-all text-sm text-[#FACC15] hover:underline">{startup.website_url || "Not provided"}</a>
                      <p className="mt-2 text-[11px] font-medium uppercase tracking-wider text-[#71717A]">Demo</p>
                      {startup.demo_video_url ? <a href={startup.demo_video_url} target="_blank" rel="noreferrer" className="mt-1 block break-all text-sm text-[#FACC15] hover:underline">{startup.demo_video_url}</a> : <span className="mt-1 block text-sm text-[#71717A]">Not provided</span>}
                    </div>
                    <div className="rounded-lg border border-[#27272A] bg-[#0A0A0C] p-3">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-[#71717A]">Founder</p>
                      <p className="mt-1 text-sm text-[#F4F4F5]">{startup.profiles?.full_name || "Unknown founder"}</p>
                      <a href={startup.profiles?.email ? `mailto:${startup.profiles.email}` : undefined} className="mt-0.5 block break-all text-sm text-[#A1A1AA] hover:text-[#FACC15]">{startup.profiles?.email || "No email on profile"}</a>
                    </div>
                  </div>

                  <div>
                    <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-[#71717A]">Pitch story</p>
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[#D4D4D8]">{startup.description || "No pitch story provided."}</p>
                  </div>
                  {startup.rejection_reason && <p className="rounded-lg border border-rose-900/50 bg-rose-950/20 p-3 text-sm text-rose-200">Reason: {startup.rejection_reason}</p>}
                </div>

                <div className="flex w-full shrink-0 flex-col gap-2 border-t border-[#27272A] pt-4 lg:w-60 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                  {pending.includes(startup) && (
                    <>
                      <Button disabled={saving} onClick={() => run(startup.id, () => approveStartup(startup.id))} className="min-h-11 w-full bg-[#FACC15] font-semibold text-[#0A0A0C] hover:bg-[#EAB308]">Approve & Launch Now</Button>
                      <Button disabled={saving} onClick={() => run(startup.id, () => scheduleStartupTomorrow(startup.id))} variant="outline" className="min-h-11 w-full border-[#FACC15]/50 bg-transparent text-[#FACC15] hover:bg-[#2A2208]">Schedule for Tomorrow&apos;s Batch</Button>
                      <Button disabled={saving} onClick={() => { setRejecting(startup); setRejectReason(""); }} variant="destructive" className="min-h-11 w-full">Reject</Button>
                    </>
                  )}
                  <Button disabled={saving} onClick={() => run(startup.id, () => toggleFeatured(startup.id, !startup.is_featured))} variant="outline" className="min-h-11 w-full border-[#3F3F46] bg-transparent text-[#D4D4D8] hover:border-[#FACC15]/50 hover:text-[#FACC15]">
                    {startup.is_featured ? "Remove Spotlight" : "Feature / Spotlight"}
                  </Button>
                  {errors[startup.id] && <p role="alert" className="text-sm text-rose-400">{errors[startup.id]}</p>}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {rejecting && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="reject-title" className="w-full rounded-t-2xl border border-[#27272A] bg-[#121215] p-5 sm:max-w-md sm:rounded-2xl sm:p-6">
            <h2 id="reject-title" className="text-lg font-semibold text-[#F4F4F5]">Reject {rejecting.name}</h2>
            <p className="mt-1 text-sm text-[#A1A1AA]">Add a clear reason so the founder knows what to fix.</p>
            <textarea autoFocus required minLength={3} maxLength={1000} placeholder="For example: demo link is not working" value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} className="mt-4 w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0C] p-3 text-sm text-[#F4F4F5] placeholder:text-[#71717A] focus:border-[#FACC15] focus:outline-none" rows={4} />
            {errors[rejecting.id] && <p role="alert" className="mt-2 text-sm text-rose-400">{errors[rejecting.id]}</p>}
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setRejecting(null)} className="border-[#3F3F46] bg-transparent text-[#F4F4F5]">Cancel</Button>
              <Button disabled={!rejectReason.trim() || isPending} onClick={confirmReject} variant="destructive">{isPending ? "Rejecting…" : "Confirm rejection"}</Button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
