import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import type { Metadata } from "next";
import { getSiteOrigin } from "@/lib/site-url";
import { member } from "@/lib/platform";
import { sql } from "@/lib/db/neon";
import { applyCollab,bookmark,reportItem } from "@/actions/community";
import { ActionForm } from "@/components/platform/action-form";
import { PlatformPage, Panel, Field } from "@/components/platform/ui";
export const dynamic="force-dynamic";
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
 const {id}=await params;
 if(!z.uuid().safeParse(id).success)return {title:"Opportunity not found",robots:{index:false,follow:false}};
 const post=(await sql`select title,description,company_name from collab_posts where id=${id}::uuid and is_active and approval_status='approved'`)[0];
 if(!post)return {title:"Opportunity not found",robots:{index:false,follow:false}};
 const title=`${post.title}${post.company_name?' — '+post.company_name:''} — collaboration`;
 const description=String(post.description||'Find your next startup collaboration on WeFounders.').replace(/\s+/g,' ').slice(0,160);
 const canonical=new URL(`/collab/${id}`,getSiteOrigin());
 const image=new URL('/opengraph-image',getSiteOrigin()).href;
 return {title,description,alternates:{canonical},openGraph:{title,description,url:canonical,type:'website',images:[{url:image,alt:'WeFounders collaboration opportunities'}]},twitter:{card:'summary_large_image',title,description,images:[image]}};
}
export default async function CollabDetail({params}:{params:Promise<{id:string}>}){const {id}=await params;if(!z.uuid().safeParse(id).success)notFound();const user=await member();const post=(await sql`select c.id,c.title,c.description,c.company_name,c.category,c.skills,c.location,c.is_remote,c.experience,c.equity_or_compensation,c.author_id,p.username,p.full_name from collab_posts c left join profiles p on p.id=c.author_id where c.id=${id}::uuid and c.is_active and c.approval_status='approved'`)[0] as {id:string;title:string;description:string;company_name:string;category:string;skills:string[];location:string;is_remote:boolean;experience:string;equity_or_compensation:string;author_id:string;username:string;full_name:string}|undefined;if(!post)notFound();const saved=user?(await sql`select 1 from bookmarks where collab_id=${id}::uuid and user_id=${user.id}::uuid`).length>0:false;return <PlatformPage title={post.title} description={`${post.category.replace(/_/g,' ')} · ${post.is_remote?'Remote':post.location||'Location not set'}`}><Panel title="The opportunity">{post.company_name&&<p className="mb-4 font-semibold">{post.company_name}</p>}<p className="whitespace-pre-wrap break-words">{post.description}</p><p className="mt-5">Skills: {post.skills.join(', ')||'Not specified'}</p><p className="mt-3">Experience: {post.experience||'Not specified'}</p><p className="mt-3">Compensation / equity: {post.equity_or_compensation||'Discuss with the poster'}</p>{post.username&&<Link href={`/profile/${post.username}`} className="mt-4 inline-block underline">Posted by {post.full_name}</Link>}</Panel>{user?<><ActionForm action={bookmark} label={saved?'Remove saved opportunity':'Save opportunity'}><input type="hidden" name="id" value={id}/><input type="hidden" name="kind" value="collab"/><input type="hidden" name="active" value={String(saved)}/></ActionForm>{user.id!==post.author_id&&<Panel title="Apply"><ActionForm action={applyCollab} label="Send application"><input type="hidden" name="id" value={id}/><Field name="message" label="Introduce yourself, your relevant work, and availability" type="textarea" required/></ActionForm></Panel>}<details><summary className="cursor-pointer">Report opportunity</summary><ActionForm action={reportItem} label="Report" className="mt-4"><input type="hidden" name="id" value={id}/><input type="hidden" name="kind" value="collab"/><select aria-label="Report reason" name="reason" className="rounded-lg border bg-background p-3">{['spam','abuse','misleading','fraud','broken','other'].map(r=><option key={r}>{r}</option>)}</select><Field name="description" label="Details" type="textarea"/></ActionForm></details></>:<Link href="/sign-in" className="underline">Sign in to apply</Link>}</PlatformPage>;}
