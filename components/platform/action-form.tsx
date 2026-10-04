"use client";

import { useRef,useId,useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export function ActionForm({action,children,label="Save",success="Saved.",confirm,className=""}: {action:(data:FormData)=>Promise<void>;children?:ReactNode;label?:string;success?:string;confirm?:string;className?:string}) {
 const [pending,setPending]=useState(false); const [message,setMessage]=useState(""); const [error,setError]=useState(false); const approved=useRef(false); const form=useRef<HTMLFormElement>(null); const dialog=useRef<HTMLDialogElement>(null); const heading=useId(); const router=useRouter();
 async function send(data:FormData) {
  setPending(true);setMessage("");
  try {await action(data);setError(false);setMessage(success);router.refresh();}
  catch(e) {setError(true);setMessage(e instanceof Error?e.message:"Could not save. Please retry.");}
  finally {setPending(false);approved.current=false;}
 }
 return <form ref={form} action={send} onSubmit={event=>{if(confirm&&!approved.current){event.preventDefault();dialog.current?.showModal();}}} className={`space-y-4 ${className}`}>
  {children}
  {confirm&&<dialog ref={dialog} aria-labelledby={heading} className="m-auto w-[calc(100%-32px)] max-w-md rounded-xl border bg-card p-6 text-foreground backdrop:bg-black/60"><h2 id={heading} className="text-lg font-semibold">Confirm change</h2><p className="mt-4">{confirm}</p><div className="mt-6 flex justify-end gap-3"><button type="button" autoFocus className="rounded-lg border px-4 py-3" onClick={()=>dialog.current?.close()}>Cancel</button><button type="button" className="ink-button px-4 py-3" onClick={()=>{approved.current=true;dialog.current?.close();form.current?.requestSubmit();}}>Confirm</button></div></dialog>}
  <button type="submit" disabled={pending} className="ink-button px-4 py-2.5 disabled:opacity-50">{pending?"Saving…":label}</button>
  {message&&<p role={error?"alert":"status"} className={`text-sm ${error?"text-red-700":"text-muted-foreground"}`}>{message}</p>}
 </form>;
}
