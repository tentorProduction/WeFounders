"use client";
import { useEffect,useState } from "react";

export function ShareButton({title,path}:{title:string;path:string}){const [message,setMessage]=useState('Share');return <button type="button" className="rounded-lg border border-border px-4 py-2.5 text-sm" onClick={async()=>{const url=new URL(path,window.location.origin).href;try{if(navigator.share)await navigator.share({title,url});else{await navigator.clipboard.writeText(url);setMessage('Link copied');}}catch{setMessage('Copy this page’s URL to share');}}}>{message}</button>;}
export function ViewTracker({id}:{id:string}){useEffect(()=>{void fetch('/api/views',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,source:document.referrer?new URL(document.referrer).hostname:'direct'}),keepalive:true});},[id]);return null;}
