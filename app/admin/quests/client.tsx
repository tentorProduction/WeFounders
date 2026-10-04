"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Pause, Play, Trash2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { deleteAdminQuest, reviewQuestSubmission, saveAdminQuest, setAdminQuestStatus, type AdminQuestInput } from "./actions";
import type { QuestStatus, QuestWithStartup } from "@/types/database";

interface AdminQuestStartup { id: string; name: string; slug: string; }
interface AdminQuestReport {
  id: string;
  quest_id: string;
  tester_name: string;
  feedback_text: string;
  rating_ux: number;
  rating_speed: number;
  proof_screenshots: string[];
  device_info: Record<string, unknown> | null;
  founder_feedback: string | null;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

const inputClass = "mt-1 w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0C] px-3 py-2.5 text-sm text-[#F4F4F5] placeholder:text-[#666A73] focus:border-[#FACC15] focus:outline-none";

export function AdminQuestsClient({
  quests,
  startups,
  reports,
}: {
  quests: QuestWithStartup[];
  startups: AdminQuestStartup[];
  reports: AdminQuestReport[];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<QuestWithStartup | null>(null);
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const run = (action: () => Promise<void>) => {
    setError(null);
    startTransition(async () => {
      try { await action(); } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Quest update failed.");
      }
    });
  };

  const openNew = () => {
    setEditing(null);
    setError(null);
    setOpen(true);
  };

  const openEdit = (quest: QuestWithStartup) => {
    setEditing(quest);
    setError(null);
    setOpen(true);
  };

  const submitQuest = (formData: FormData) => {
    const input: AdminQuestInput = {
      startupId: String(formData.get("startupId") ?? ""),
      title: String(formData.get("title") ?? ""),
      instructions: String(formData.get("instructions") ?? ""),
      targetDevices: String(formData.get("targetDevices") ?? ""),
      rewardDescription: String(formData.get("rewardDescription") ?? ""),
      maxSubmissions: Number(formData.get("maxSubmissions")),
    };
    run(async () => {
      await saveAdminQuest(input, editing?.id);
      setOpen(false);
    });
  };

  const changeStatus = (quest: QuestWithStartup, status: QuestStatus) => run(() => setAdminQuestStatus(quest.id, status));
  const removeQuest = (quest: QuestWithStartup) => {
    if (window.confirm(`Delete “${quest.title}” and all of its tester reports? This cannot be undone.`)) {
      run(() => deleteAdminQuest(quest.id));
    }
  };

  const updateReport = (report: AdminQuestReport, status: "accepted" | "rejected") => run(() => reviewQuestSubmission(report.id, status, feedback[report.id] ?? report.founder_feedback ?? ""));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-semibold tracking-tight text-[#F4F4F5] sm:text-3xl">Quests &amp; Bounties</h1><p className="mt-1 text-sm text-[#A1A1AA]">Create tester tasks, track capacity, and review submitted reports.</p></div>
        <Button onClick={openNew} disabled={!startups.length} className="min-h-11 gap-2 bg-[#FACC15] text-[#0A0A0C] hover:bg-[#EAB308]"><Plus className="h-4 w-4" />New quest</Button>
      </div>
      {error && <p role="alert" className="rounded-lg border border-rose-900/70 bg-rose-950/20 p-3 text-sm text-rose-200">{error}</p>}
      {!startups.length && <p className="rounded-xl border border-dashed border-[#3F3F46] p-4 text-sm text-[#A1A1AA]">Approve a startup before creating a quest for it.</p>}

      {quests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#3F3F46] py-12 text-center text-sm text-[#A1A1AA]">No quests yet. Create the first tester task for a live startup.</div>
      ) : quests.map((quest) => {
        const questReports = reports.filter((report) => report.quest_id === quest.id);
        return (
          <article key={quest.id} className="rounded-xl border border-[#27272A] bg-[#121215] p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold text-[#F4F4F5]">{quest.title}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${quest.status === "active" ? "bg-emerald-950/50 text-emerald-300" : quest.status === "paused" ? "bg-amber-950/50 text-amber-200" : "bg-[#27272A] text-[#A1A1AA]"}`}>{quest.status}</span></div>
                <p className="mt-1 text-sm text-[#A1A1AA]">For <a href={`/startups/${quest.startup.slug}`} target="_blank" rel="noreferrer" className="text-[#FACC15] hover:underline">{quest.startup.name}</a></p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#D4D4D8]">{quest.task_instructions}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#A1A1AA]">
                  <span>{quest.submissions_count} / {quest.max_submissions} testers</span>
                  {quest.target_devices && <span>Devices: {quest.target_devices}</span>}
                  {quest.reward_description && <span>Reward: {quest.reward_description}</span>}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(quest)} className="border-[#3F3F46] bg-transparent text-[#D4D4D8]"><Pencil className="mr-1.5 h-3.5 w-3.5" />Edit</Button>
                {quest.status === "active" ? <Button variant="outline" size="sm" onClick={() => changeStatus(quest, "paused")} className="border-[#3F3F46] bg-transparent text-[#D4D4D8]"><Pause className="mr-1.5 h-3.5 w-3.5" />Pause</Button> : <Button variant="outline" size="sm" onClick={() => changeStatus(quest, "active")} className="border-[#FACC15]/40 bg-transparent text-[#FACC15]"><Play className="mr-1.5 h-3.5 w-3.5" />Activate</Button>}
                <Button variant="outline" size="icon" onClick={() => removeQuest(quest)} aria-label={`Delete ${quest.title}`} className="border-[#3F3F46] bg-transparent text-rose-300 hover:bg-rose-950/40"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>

            <details className="mt-5 border-t border-[#27272A] pt-3">
              <summary className="cursor-pointer list-none text-sm font-medium text-[#D4D4D8]">Tester reports <span className="ml-1 text-[#A1A1AA]">({questReports.length})</span></summary>
              <div className="mt-3 space-y-3">
                {questReports.length === 0 && <p className="text-sm text-[#666A73]">No reports submitted yet.</p>}
                {questReports.map((report) => (
                  <div key={report.id} className="rounded-lg border border-[#27272A] bg-[#0A0A0C] p-3">
                    <div className="flex flex-wrap justify-between gap-2 text-sm"><span className="font-medium text-[#F4F4F5]">{report.tester_name || "Tester"}</span><span className="text-xs capitalize text-[#A1A1AA]">{report.status} · {new Date(report.created_at).toLocaleDateString()}</span></div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-[#D4D4D8]">{report.feedback_text}</p>
                    <p className="mt-2 text-xs text-[#A1A1AA]">UX {report.rating_ux}/5 · Speed {report.rating_speed}/5{report.device_info?.platform ? ` · ${String(report.device_info.platform)}` : ""}</p>
                    {report.proof_screenshots.length > 0 && <p className="mt-2 break-all text-xs text-[#A1A1AA]">Screenshot filenames (not uploaded): {report.proof_screenshots.map((name) => name.slice(0, 255)).join(", ")}</p>}
                    <textarea maxLength={1000} value={feedback[report.id] ?? report.founder_feedback ?? ""} onChange={(event) => setFeedback((current) => ({ ...current, [report.id]: event.target.value }))} placeholder="Optional feedback for the tester" className="mt-3 w-full rounded-md border border-[#3F3F46] bg-[#121215] p-2 text-sm text-[#F4F4F5] placeholder:text-[#666A73]" rows={2} />
                    {report.status === "pending" && <div className="mt-2 flex flex-wrap gap-2"><Button size="sm" onClick={() => updateReport(report, "accepted")} className="bg-[#FACC15] text-[#0A0A0C] hover:bg-[#EAB308]">Accept report</Button><Button size="sm" variant="outline" onClick={() => updateReport(report, "rejected")} className="border-[#3F3F46] bg-transparent text-[#D4D4D8]">Reject report</Button></div>}
                  </div>
                ))}
              </div>
            </details>
          </article>
        );
      })}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto border-[#27272A] bg-[#121215] text-[#F4F4F5] sm:rounded-xl">
          <DialogHeader><DialogTitle>{editing ? "Edit quest" : "Create a quest"}</DialogTitle><DialogDescription className="text-[#A1A1AA]">Define a real testing task, its reward, and how many testers can join.</DialogDescription></DialogHeader>
          <form action={submitQuest} className="space-y-3">
            <label className="block text-sm text-[#D4D4D8]">Startup<select name="startupId" required defaultValue={editing?.startup_id ?? startups[0]?.id ?? ""} className={inputClass}>{startups.map((startup) => <option key={startup.id} value={startup.id}>{startup.name}</option>)}</select></label>
            <label className="block text-sm text-[#D4D4D8]">Quest title<input name="title" required minLength={3} maxLength={120} defaultValue={editing?.title ?? ""} className={inputClass} /></label>
            <label className="block text-sm text-[#D4D4D8]">Task instructions<textarea name="instructions" required minLength={20} maxLength={10000} rows={4} defaultValue={editing?.task_instructions ?? ""} className={inputClass} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm text-[#D4D4D8]">Target devices<input name="targetDevices" maxLength={200} defaultValue={editing?.target_devices ?? ""} placeholder="Android 12+, Ncell 4G" className={inputClass} /></label>
              <label className="block text-sm text-[#D4D4D8]">Tester slots<input name="maxSubmissions" type="number" min={1} max={500} required defaultValue={editing?.max_submissions ?? 20} className={inputClass} /></label>
            </div>
            <label className="block text-sm text-[#D4D4D8]">Reward description<input name="rewardDescription" maxLength={240} defaultValue={editing?.reward_description ?? ""} placeholder="NPR 500 via eSewa or 100 Karma" className={inputClass} /></label>
            {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
            <DialogFooter className="gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-[#3F3F46] bg-transparent text-[#F4F4F5]">Cancel</Button><Button disabled={isPending} type="submit" className="bg-[#FACC15] text-[#0A0A0C] hover:bg-[#EAB308]">{isPending ? "Saving…" : editing ? "Save changes" : "Create quest"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

