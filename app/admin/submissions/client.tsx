"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { approveStartup, rejectStartup, toggleFeatured } from "../actions";
import type { AdminStartup } from "../types";

export function SubmissionsClient({ submissions }: { submissions: AdminStartup[] }) {
  const [tab, setTab] = useState<"pending_approval" | "scheduled" | "approved" | "rejected">("pending_approval");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Calculate tabs correctly - 'scheduled' means approved but launch_date > now
  const now = new Date();
  
  const pending = submissions.filter(s => s.status === "pending_approval" || s.status === "draft");
  const approvedLive = submissions.filter(s => s.status === "approved" && new Date(s.launch_date || now) <= now);
  const scheduled = submissions.filter(s => s.status === "approved" && new Date(s.launch_date || now) > now);
  const rejected = submissions.filter(s => s.status === "rejected");

  const displayed = tab === "pending_approval" ? pending : tab === "scheduled" ? scheduled : tab === "approved" ? approvedLive : rejected;

  const handleApproveNow = async (id: string) => {
    setLoadingId(id);
    await approveStartup(id);
    setLoadingId(null);
  };

  const handleSchedule = async (id: string) => {
    setLoadingId(id);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await approveStartup(id, tomorrow.toISOString());
    setLoadingId(null);
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) return;
    setLoadingId(id);
    await rejectStartup(id, rejectReason);
    setRejectReason("");
    setRejectingId(null);
    setLoadingId(null);
  };

  const handleToggleFeature = async (id: string, current: boolean) => {
    setLoadingId(id);
    await toggleFeatured(id, !current);
    setLoadingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button variant={tab === "pending_approval" ? "default" : "outline"} onClick={() => setTab("pending_approval")} className={tab === "pending_approval" ? "bg-[#DC2626] text-[#FAFAFA] hover:bg-[#B91C1C]" : "border-[#E4E4E7] text-[#71717A] hover:text-[#18181B]"}>
          Pending Review ({pending.length})
        </Button>
        <Button variant={tab === "scheduled" ? "default" : "outline"} onClick={() => setTab("scheduled")} className={tab === "scheduled" ? "bg-[#DC2626] text-[#FAFAFA] hover:bg-[#B91C1C]" : "border-[#E4E4E7] text-[#71717A] hover:text-[#18181B]"}>
          Scheduled ({scheduled.length})
        </Button>
        <Button variant={tab === "approved" ? "default" : "outline"} onClick={() => setTab("approved")} className={tab === "approved" ? "bg-[#DC2626] text-[#FAFAFA] hover:bg-[#B91C1C]" : "border-[#E4E4E7] text-[#71717A] hover:text-[#18181B]"}>
          Approved & Live ({approvedLive.length})
        </Button>
        <Button variant={tab === "rejected" ? "default" : "outline"} onClick={() => setTab("rejected")} className={tab === "rejected" ? "bg-[#DC2626] text-[#FAFAFA] hover:bg-[#B91C1C]" : "border-[#E4E4E7] text-[#71717A] hover:text-[#18181B]"}>
          Rejected ({rejected.length})
        </Button>
      </div>

      <div className="space-y-4">
        {displayed.length === 0 && (
          <div className="text-center py-12 border border-dashed border-[#E4E4E7] rounded-2xl text-[#71717A]">
            No submissions in this queue.
          </div>
        )}
        
        {displayed.map((startup) => (
          <div key={startup.id} className="godly-card bg-[#FFFFFF] border border-[#E4E4E7] rounded-2xl p-6 flex flex-col md:flex-row gap-6">
            {/* Info Section */}
            <div className="flex-1 space-y-4">
              <div className="flex items-start gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={startup.logo_url} alt={startup.name} className="w-16 h-16 rounded-xl object-cover bg-[#FAFAFA]" />
                <div>
                  <h3 className="text-xl font-bold text-[#18181B] flex items-center gap-2">
                    {startup.name}
                    {startup.is_featured && <Badge className="bg-[#DC2626]/20 text-[#DC2626] border border-[#DC2626]/30">Featured</Badge>}
                  </h3>
                  <a href={startup.website_url} target="_blank" rel="noreferrer" className="text-sm text-[#DC2626] hover:underline font-mono">
                    {startup.website_url}
                  </a>
                </div>
              </div>
              
              <p className="text-[#18181B] font-medium">{startup.tagline}</p>
              
              <div className="text-sm text-[#71717A] bg-[#FAFAFA] p-3 rounded-xl border border-[#E4E4E7] prose max-w-none">
                {startup.description}
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-[#E4E4E7] text-[#71717A]">
                  {startup.target_market === 'nepal_domestic' ? 'Made for Nepal 🇳🇵' : 'Built for World 🌎'}
                </Badge>
                {startup.tags.map((t: { id: string; name: string; slug: string; category: string }) => (
                  <Badge key={t.id} variant="outline" className="border-[#E4E4E7] text-[#71717A]">
                    {t.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Actions Section */}
            <div className="w-full md:w-64 flex flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-[#E4E4E7] pt-4 md:pt-0 md:pl-4">
              <div className="text-sm text-[#71717A] mb-2 font-mono break-all">
                Founder: {startup.profiles?.full_name} ({startup.profiles?.email})
              </div>

              {startup.status === 'pending_approval' && (
                <>
                  <Button 
                    disabled={loadingId === startup.id}
                    onClick={() => handleApproveNow(startup.id)}
                    className="w-full bg-[#DC2626] text-[#FAFAFA] hover:bg-[#B91C1C] font-bold"
                  >
                    Approve & Launch Now
                  </Button>
                  <Button 
                    disabled={loadingId === startup.id}
                    onClick={() => handleSchedule(startup.id)}
                    variant="outline" 
                    className="w-full border-[#DC2626]/40 text-[#DC2626] hover:bg-[#DC2626]/10"
                  >
                    Schedule (Tomorrow)
                  </Button>
                  <Button 
                    disabled={loadingId === startup.id}
                    onClick={() => setRejectingId(startup.id)}
                    variant="destructive" 
                    className="w-full"
                  >
                    Reject
                  </Button>
                </>
              )}

              {rejectingId === startup.id && (
                <div className="space-y-2 mt-2 p-3 bg-[#FAFAFA] border border-red-500/30 rounded-xl">
                  <textarea 
                    autoFocus
                    placeholder="Reason (e.g. Broken MVP)..." 
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#E4E4E7] rounded p-2 text-sm text-[#18181B]"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" onClick={() => handleReject(startup.id)} className="flex-1">Confirm</Button>
                    <Button size="sm" variant="outline" onClick={() => setRejectingId(null)} className="flex-1 border-[#E4E4E7]">Cancel</Button>
                  </div>
                </div>
              )}

              {startup.status === 'approved' && (
                <Button 
                  disabled={loadingId === startup.id}
                  onClick={() => handleToggleFeature(startup.id, startup.is_featured)}
                  variant="outline" 
                  className="w-full border-[#DC2626]/40 text-[#DC2626] hover:bg-[#DC2626]/10 mt-auto"
                >
                  {startup.is_featured ? 'Remove Spotlight' : 'Spotlight / Feature'}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
