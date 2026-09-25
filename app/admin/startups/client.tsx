"use client";

import { useState, useTransition } from "react";
import { Archive, Pencil, RotateCcw, Star, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteStartup, rejectStartup, resetUpvotes, toggleFeatured, updateStartupTags } from "../actions";
import type { AdminStartup } from "../types";
import type { Tag } from "@/types/database";

const baseButton = "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#3F3F46] bg-[#0A0A0C] text-[#A1A1AA] transition-colors hover:text-[#FACC15] disabled:opacity-40";

export function LiveStartupsClient({ startups, availableTags }: { startups: AdminStartup[]; availableTags: Tag[] }) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminStartup | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const run = (id: string, action: () => Promise<void>) => {
    setBusyId(id);
    setError(null);
    startTransition(async () => {
      try {
        await action();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not update this startup.");
      } finally {
        setBusyId(null);
      }
    });
  };

  const openTags = (startup: AdminStartup) => {
    setEditing(startup);
    setSelectedTagIds(startup.tags.map((tag) => tag.id));
    setError(null);
  };

  const saveTags = () => {
    if (!editing) return;
    const startup = editing;
    run(startup.id, async () => {
      await updateStartupTags(startup.id, selectedTagIds);
      setEditing(null);
    });
  };

  const archive = (startup: AdminStartup) => {
    if (!window.confirm(`Unpublish ${startup.name}? It will be removed from the public feed and kept as rejected.`)) return;
    run(startup.id, () => rejectStartup(startup.id, "Archived by admin"));
  };

  const resetVotes = (startup: AdminStartup) => {
    if (!window.confirm(`Reset all ${startup.upvotes_count} upvotes for ${startup.name}? This removes the vote records permanently.`)) return;
    run(startup.id, () => resetUpvotes(startup.id));
  };

  const remove = (startup: AdminStartup) => {
    if (!window.confirm(`Permanently delete ${startup.name}? This cannot be undone.`)) return;
    run(startup.id, () => deleteStartup(startup.id));
  };

  return (
    <>
      {error && <p role="alert" className="mb-3 rounded-lg border border-rose-900/70 bg-rose-950/20 p-3 text-sm text-rose-200">{error}</p>}
      <div className="overflow-hidden rounded-xl border border-[#27272A] bg-[#121215]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px] text-left text-sm">
            <thead className="border-b border-[#27272A] bg-[#0A0A0C] text-[#A1A1AA]">
              <tr>
                <th className="px-4 py-3 font-medium">Rank</th>
                <th className="px-4 py-3 font-medium">Startup</th>
                <th className="px-4 py-3 font-medium">Founder</th>
                <th className="px-4 py-3 font-medium">Market</th>
                <th className="px-4 py-3 text-right font-medium">Upvotes</th>
                <th className="px-4 py-3 text-right font-medium">Waitlist</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-center font-medium">Featured</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]">
              {startups.map((startup, index) => {
                const saving = isPending && busyId === startup.id;
                return (
                  <tr key={startup.id} className="align-middle hover:bg-[#18181B]">
                    <td className="px-4 py-3 font-mono text-[#A1A1AA]">#{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={startup.logo_url || "/icon.svg"} alt="" className="h-9 w-9 rounded-lg border border-[#27272A] bg-[#0A0A0C] object-cover" />
                        <div className="min-w-0">
                          <p className="max-w-52 truncate font-semibold text-[#F4F4F5]">{startup.name}</p>
                          <div className="mt-1 flex flex-wrap gap-1">{startup.tags.slice(0, 3).map((tag) => <span key={tag.id} className="rounded-full border border-[#3F3F46] px-1.5 py-0.5 text-[10px] text-[#A1A1AA]">{tag.name}</span>)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-48 px-4 py-3">
                      <p className="truncate text-[#D4D4D8]">{startup.profiles?.full_name || "Unknown"}</p>
                      <p className="truncate text-xs text-[#71717A]">{startup.profiles?.email}</p>
                    </td>
                    <td className="px-4 py-3"><Badge variant="outline" className="whitespace-nowrap border-[#3F3F46] text-[#D4D4D8]">{startup.target_market === "nepal_domestic" ? "Nepal 🇳🇵" : startup.target_market === "global_export" ? "World 🌎" : "Nepal + World"}</Badge></td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#F4F4F5]">{startup.upvotes_count.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#F4F4F5]">{startup.waitlist_count.toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className="border-emerald-500/30 bg-emerald-950/30 text-emerald-300">Live</Badge></td>
                    <td className="px-4 py-3 text-center">{startup.is_featured ? <Star aria-label="Featured" className="mx-auto h-4 w-4 fill-[#FACC15] text-[#FACC15]" /> : <span className="text-[#52525B]">—</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button type="button" disabled={saving} onClick={() => openTags(startup)} className={baseButton} aria-label={`Edit tags for ${startup.name}`} title="Edit tags"><Pencil className="h-4 w-4" /></button>
                        <button type="button" disabled={saving} onClick={() => run(startup.id, () => toggleFeatured(startup.id, !startup.is_featured))} className={baseButton} aria-label={`${startup.is_featured ? "Remove spotlight from" : "Feature"} ${startup.name}`} title="Toggle featured"><Star className={`h-4 w-4 ${startup.is_featured ? "fill-[#FACC15] text-[#FACC15]" : ""}`} /></button>
                        <button type="button" disabled={saving} onClick={() => resetVotes(startup)} className={baseButton} aria-label={`Reset upvotes for ${startup.name}`} title="Reset upvotes"><RotateCcw className="h-4 w-4" /></button>
                        <button type="button" disabled={saving} onClick={() => archive(startup)} className={`${baseButton} hover:text-amber-300`} aria-label={`Unpublish ${startup.name}`} title="Unpublish"><Archive className="h-4 w-4" /></button>
                        <button type="button" disabled={saving} onClick={() => remove(startup)} className={`${baseButton} hover:text-rose-400`} aria-label={`Delete ${startup.name}`} title="Permanently delete"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {startups.length === 0 && <tr><td colSpan={9} className="px-4 py-12 text-center text-[#A1A1AA]">No live startups found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="tag-editor-title" className="max-h-[88dvh] w-full overflow-y-auto rounded-t-2xl border border-[#27272A] bg-[#121215] p-5 sm:max-w-lg sm:rounded-2xl sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div><h2 id="tag-editor-title" className="font-semibold text-[#F4F4F5]">Edit tags</h2><p className="mt-1 text-sm text-[#A1A1AA]">{editing.name}</p></div>
              <button onClick={() => setEditing(null)} aria-label="Close dialog" className="rounded-md p-2 text-[#A1A1AA] hover:bg-[#27272A]"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-5 space-y-2">
              {availableTags.map((tag) => (
                <label key={tag.id} className="flex min-h-11 items-center gap-3 rounded-lg border border-[#27272A] px-3 py-2 text-sm text-[#D4D4D8]">
                  <input type="checkbox" checked={selectedTagIds.includes(tag.id)} onChange={(event) => setSelectedTagIds((current) => event.target.checked ? [...current, tag.id] : current.filter((id) => id !== tag.id))} className="h-4 w-4 accent-[#FACC15]" />
                  <span className="flex-1">{tag.name}</span><span className="text-xs capitalize text-[#71717A]">{tag.category}</span>
                </label>
              ))}
              {availableTags.length === 0 && <p className="text-sm text-[#A1A1AA]">No tags are configured yet.</p>}
            </div>
            {error && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setEditing(null)} className="border-[#3F3F46] bg-transparent text-[#F4F4F5]">Cancel</Button>
              <Button onClick={saveTags} disabled={isPending} className="bg-[#FACC15] text-[#0A0A0C] hover:bg-[#EAB308]">{isPending ? "Saving…" : "Save tags"}</Button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
