"use client";
import { useCallback,useEffect,useRef,useState } from "react";
import { useUser } from "@clerk/nextjs";

export interface UpvoteView {count:number;voted:boolean;pending:boolean;}
export function useOptimisticUpvotes(){
 const {user}=useUser(); const [votes,setVotes]=useState<Record<string,boolean>>({});const [counts,setCounts]=useState<Record<string,number>>({});const [pending,setPending]=useState<Record<string,boolean>>({});const busy=useRef(new Set<string>());const current=useRef<Record<string,boolean>>({});
 useEffect(()=>{current.current={};setVotes({});setCounts({});if(!user)return;const controller=new AbortController();void fetch('/api/upvotes',{signal:controller.signal}).then(r=>r.ok?r.json():Promise.reject()).then((data:{votes:string[]})=>{const next=Object.fromEntries(data.votes.map(id=>[id,true]));current.current=next;setVotes(next);}).catch(()=>{});return()=>controller.abort();},[user?.id,user]);
 const toggleUpvote=useCallback((id:string)=>{if(busy.current.has(id))return;if(!user){window.location.assign(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`);return;}busy.current.add(id);setPending(p=>({...p,[id]:true}));const next=!current.current[id];void fetch('/api/upvotes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({startupId:id,voted:next})}).then(async response=>{const data=await response.json() as {error?:string;count:number};if(!response.ok)throw new Error(data.error??'Could not record your vote.');current.current={...current.current,[id]:next};setVotes(current.current);setCounts(c=>({...c,[id]:data.count}));}).catch(error=>window.dispatchEvent(new CustomEvent('wefounders-error',{detail:error instanceof Error?error.message:'Could not save your vote.'}))).finally(()=>{busy.current.delete(id);setPending(p=>({...p,[id]:false}));});},[user]);
 const getUpvote=useCallback((id:string,base:number):UpvoteView=>({count:counts[id]??base,voted:!!votes[id],pending:!!pending[id]}),[counts,votes,pending]);return {getUpvote,toggleUpvote};
}
