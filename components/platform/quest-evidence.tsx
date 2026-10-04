"use client";

import { useId, useState } from "react";
import { MAX_EVIDENCE_BYTES, MAX_EVIDENCE_COUNT } from "@/lib/security/quest-evidence";

type UploadedEvidence = { id: string; url: string; name: string };

export function QuestEvidenceUpload({ questId }: { questId: string }) {
  const labelId = useId();
  const [files, setFiles] = useState<UploadedEvidence[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function upload(file: File) {
    setError("");
    if (file.size > MAX_EVIDENCE_BYTES) { setError("Each screenshot must be 2 MB or smaller."); return; }
    setPending(true);
    try {
      const response = await fetch("/api/quest-evidence", { method: "POST", headers: { "Content-Type": "application/octet-stream", "X-Quest-Id": questId }, body: file });
      const result = await response.json() as { id?: string; url?: string; error?: string };
      if (!response.ok || !result.id || !result.url) throw new Error(result.error || "Screenshot upload failed.");
      setFiles(current => [...current, { id: result.id!, url: result.url!, name: file.name }]);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Upload failed. Please retry."); }
    finally { setPending(false); }
  }
  async function remove(file: UploadedEvidence) {
    setPending(true); setError("");
    try {
      const response = await fetch(file.url, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not remove this screenshot. It may already belong to a submitted report.");
      setFiles(current => current.filter(item => item.id !== file.id));
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Could not remove screenshot."); }
    finally { setPending(false); }
  }
  return <fieldset className="space-y-3" aria-describedby={`${labelId}-hint`}>
    <legend className="text-sm font-medium">Upload screenshot evidence</legend>
    <p id={`${labelId}-hint`} className="text-sm text-muted-foreground">PNG or JPEG, up to 2 MB each. Maximum five evidence files and links combined. Visible only to you, the founder after submission, and administrators.</p>
    <label htmlFor={labelId} className="sr-only">Choose a PNG or JPEG screenshot</label>
    <input id={labelId} type="file" accept="image/png,image/jpeg" disabled={pending || files.length >= MAX_EVIDENCE_COUNT} className="block max-w-full text-sm file:mr-3 file:rounded-lg file:border file:bg-card file:px-4 file:py-3 file:text-foreground" onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void upload(file); }}/>
    <input type="hidden" name="evidenceUploading" value={String(pending)}/>
    {files.map(file => <div key={file.id} className="flex flex-wrap items-center gap-3 text-sm"><input type="hidden" name="uploadedEvidence" value={file.url}/><a href={file.url} target="_blank" rel="noopener noreferrer" className="break-all underline">{file.name}</a><button type="button" disabled={pending} onClick={() => void remove(file)} className="rounded-lg border px-3 py-2">Remove<span className="sr-only"> {file.name}</span></button></div>)}
    {pending && <p role="status" className="text-sm">Saving screenshot…</p>}
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
  </fieldset>;
}
