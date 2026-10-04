"use client";
import { StartupCard } from "@/components/startups/startup-card";
import { useOptimisticUpvotes } from "@/lib/hooks/use-optimistic-upvotes";
import type { StartupWithTags } from "@/types/database";
export function LaunchList({startups}:{startups:StartupWithTags[]}){const {getUpvote,toggleUpvote}=useOptimisticUpvotes();return <div className="grid gap-4 lg:grid-cols-2">{startups.map((s,i)=><StartupCard key={s.id} startup={s} rank={i+1} upvote={{...getUpvote(s.id,s.upvotes_count),onToggle:()=>toggleUpvote(s.id)}}/>)}</div>;}
