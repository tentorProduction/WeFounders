"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { setCollabPostActive } from "@/app/admin/actions";

export interface CollabAdminPost {
  id: string;
  title: string;
  role_type: string;
  description: string;
  equity_or_compensation: string | null;
  contact_channel: string;
  is_active: boolean;
  created_at: string;
  startup: { name: string; slug: string } | null;
  author: { full_name: string | null; email: string | null } | null;
}

export function CollabModeration({ posts }: { posts: CollabAdminPost[] }) {
  const [activeOnly, setActiveOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const visiblePosts = posts.filter((post) => !activeOnly || post.is_active);
  const toggle = (post: CollabAdminPost) => {
    setError(null);
    startTransition(async () => {
      try { await setCollabPostActive(post.id, !post.is_active); }
      catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update listing."); }
    });
  };

  return <section className="space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-2xl font-semibold tracking-tight text-[#F4F4F5] sm:text-3xl">Collab &amp; Gigs</h1><p className="mt-1 text-sm text-[#A1A1AA]">Review founder posts and hide listings that are no longer available.</p></div>
      <label className="flex min-h-11 items-center gap-2 text-sm text-[#D4D4D8]"><input type="checkbox" checked={activeOnly} onChange={(event) => setActiveOnly(event.target.checked)} className="h-4 w-4 accent-[#FACC15]" />Active only <span className="text-[#A1A1AA]">{posts.filter((post) => post.is_active).length}/{posts.length}</span></label>
    </header>
    {error && <p role="alert" className="rounded-lg border border-rose-900/70 bg-rose-950/20 p-3 text-sm text-rose-200">{error}</p>}
    {visiblePosts.length === 0 ? <p className="rounded-xl border border-dashed border-[#3F3F46] p-8 text-center text-sm text-[#A1A1AA]">No {activeOnly ? "active " : ""}collab listings.</p> : <div className="space-y-3">{visiblePosts.map((post) => <article key={post.id} className="rounded-xl border border-[#27272A] bg-[#121215] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold text-[#F4F4F5]">{post.title}</h2><span className="rounded-full bg-[#27272A] px-2.5 py-1 text-xs capitalize text-[#D4D4D8]">{post.role_type.replaceAll("_", " ")}</span><span className={`rounded-full px-2.5 py-1 text-xs ${post.is_active ? "bg-emerald-950/50 text-emerald-300" : "bg-[#27272A] text-[#A1A1AA]"}`}>{post.is_active ? "Active" : "Hidden"}</span></div>
      <p className="mt-1 text-xs text-[#A1A1AA]">{post.author?.full_name || "Founder"}{post.author?.email ? ` · ${post.author.email}` : ""}{post.startup ? ` · ${post.startup.name}` : ""} · {new Date(post.created_at).toLocaleDateString()}</p><p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#D4D4D8]">{post.description}</p>{post.equity_or_compensation && <p className="mt-2 text-sm text-[#FACC15]">{post.equity_or_compensation}</p>}<p className="mt-2 break-all text-xs text-[#A1A1AA]">Contact: {post.contact_channel}</p></div>
      <Button disabled={pending} variant="outline" onClick={() => toggle(post)} className="min-h-10 border-[#3F3F46] bg-transparent text-[#F4F4F5]">{post.is_active ? "Hide listing" : "Restore listing"}</Button></div>
    </article>)}</div>}
  </section>;
}
