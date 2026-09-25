"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toggleFeatured, deleteStartup, rejectStartup } from "../actions";

import { Star, Ban, Trash2 } from "lucide-react";

export function LiveStartupsClient({ startups }: { startups: import("../types").AdminStartup[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggleFeature = async (id: string, current: boolean) => {
    setLoadingId(id);
    await toggleFeatured(id, !current);
    setLoadingId(null);
  };

  const handleUnpublish = async (id: string) => {
    if (!confirm("Are you sure you want to unpublish this startup?")) return;
    setLoadingId(id);
    await rejectStartup(id, "Unpublished by admin");
    setLoadingId(null);
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this startup?")) return;
    setLoadingId(id);
    await deleteStartup(id);
    setLoadingId(null);
  };

  return (
    <div className="rounded-2xl border border-[#E4E4E7] bg-[#FFFFFF] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#FAFAFA] text-[#71717A] border-b border-[#E4E4E7]">
            <tr>
              <th className="px-4 py-3 font-medium">Rank</th>
              <th className="px-4 py-3 font-medium">Startup</th>
              <th className="px-4 py-3 font-medium">Market</th>
              <th className="px-4 py-3 font-medium text-right">Upvotes</th>
              <th className="px-4 py-3 font-medium text-right">Waitlist</th>
              <th className="px-4 py-3 font-medium text-center">Featured</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E4E7]">
            {startups.map((startup, index) => (
              <tr key={startup.id} className="hover:bg-[#FAFAFA]/50 transition-colors">
                <td className="px-4 py-3 text-[#71717A] font-mono">#{index + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={startup.logo_url} alt="" className="w-8 h-8 rounded-lg bg-[#FAFAFA] object-cover" />
                    <div>
                      <div className="font-bold text-[#18181B]">{startup.name}</div>
                      <div className="text-xs text-[#71717A] font-mono truncate max-w-[150px]">{startup.profiles?.full_name} ({startup.profiles?.email})</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="border-[#E4E4E7] text-[#71717A] whitespace-nowrap">
                    {startup.target_market === 'nepal_domestic' ? 'Nepal 🇳🇵' : 'World 🌎'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right font-mono text-[#18181B]">{startup.upvotes_count}</td>
                <td className="px-4 py-3 text-right font-mono text-[#18181B]">{startup.waitlist_count}</td>
                <td className="px-4 py-3 text-center">
                  {startup.is_featured ? (
                    <Star className="h-4 w-4 text-[#DC2626] mx-auto fill-[#DC2626]" />
                  ) : (
                    <span className="text-[#E4E4E7]">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={loadingId === startup.id}
                      onClick={() => handleToggleFeature(startup.id, startup.is_featured)}
                      className="h-8 border-[#E4E4E7] text-[#71717A] hover:text-[#DC2626] hover:border-[#DC2626]/30"
                      title="Toggle Feature"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={loadingId === startup.id}
                      onClick={() => handleUnpublish(startup.id)}
                      className="h-8 border-[#E4E4E7] text-[#71717A] hover:text-red-400 hover:border-red-500/30"
                      title="Unpublish"
                    >
                      <Ban className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={loadingId === startup.id}
                      onClick={() => handleDelete(startup.id)}
                      className="h-8 border-[#E4E4E7] text-[#71717A] hover:text-red-400 hover:bg-red-500/10"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {startups.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[#71717A]">
                  No live startups found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
