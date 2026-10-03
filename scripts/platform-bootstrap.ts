import { createHash } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ quiet: true });
const email = process.argv[2]?.trim().toLowerCase();
if (!email || !process.env.DATABASE_URL || !process.env.CLERK_SECRET_KEY) throw new Error("Supply administrator email; database and Clerk credentials are required.");
const response = await fetch(`https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`, { headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` } });
if (!response.ok) throw new Error("Clerk identity lookup failed.");
const users = await response.json() as { id: string; first_name: string | null; last_name: string | null; username: string | null; image_url: string; email_addresses: { email_address: string; verification: { status: string } }[] }[];
const user = users.find(u => u.email_addresses.some(e => e.email_address.toLowerCase()===email && e.verification.status==='verified'));
if (!user) throw new Error("Administrator must first sign up and verify their email in Clerk.");
const db = neon(process.env.DATABASE_URL);
const existing = await db.query("select id from profiles where clerk_user_id=$1", [user.id]);
const hex = createHash("sha256").update(`wefounders:${user.id}`).digest("hex");
const id = existing[0]?.id ?? [hex.slice(0,8),hex.slice(8,12),`5${hex.slice(13,16)}`,`${((parseInt(hex[16],16)&3)|8).toString(16)}${hex.slice(17,20)}`,hex.slice(20,32)].join("-");
await db.transaction([
 db.query("select set_config('wf.actor',$1,true)",[id]),
 db.query("insert into profiles(id,clerk_user_id,email,full_name,username,avatar_url) values($1,$2,$3,$4,$5,$6) on conflict(id) do nothing",[id,user.id,email,[user.first_name,user.last_name].filter(Boolean).join(" "),user.username??`member_${hex.slice(0,12)}`,user.image_url]),
 db.query("update profiles set role=case when id=$1::uuid then 'admin'::user_role else 'user'::user_role end where role='admin' or id=$1::uuid",[id]),
]);
// Facts verified from each supplied public website; identity/technology not inferred.
const projects = [
 {slug:"capgen", name:"Capgen",tagline:"Automatic video captions with word-level timing",description:"Capgen turns video audio into timed captions. Its public studio offers caption styles, animated captions and SRT export.",url:"https://capgen.app/",image:"https://www.capgen.app/caption.jpeg",category:"Creator tools"},
 {slug:"aman-yadav",name:"Aman Yadav",tagline:"A full-stack developer’s portfolio and projects",description:"Aman Yadav’s public portfolio presents development work and links to projects and contact channels.",url:"https://amanyadav.dev/",image:"",category:"Portfolio"},
 {slug:"yappdf",name:"YapPDF",tagline:"An offline PDF voice reader for Android",description:"YapPDF reads PDF documents aloud using on-device voices, sentence tracking and playback speed controls. Its public website links to Google Play.",url:"https://yappdf.app/",image:"https://yappdf.app/og-image.png",category:"Accessibility"},
];
for (const p of projects) await db.transaction([
 db.query("select set_config('wf.actor',$1,true)",[id]),
 db.query("insert into startups(founder_id,slug,name,tagline,description,website_url,logo_url,banner_url,stage,target_market,status,is_curated) values($1,$2,$3,$4,$5,$6,'',$7,'launched','global_export','approved',true) on conflict(slug) do nothing",[id,p.slug,p.name,p.tagline,p.description,p.url,p.image||null]),
 db.query("insert into tags(slug,name,category) values($1,$2,'industry') on conflict(slug) do nothing",[p.category.toLowerCase().replace(/ /g,"-"),p.category]),
 db.query("insert into startup_tags(startup_id,tag_id) select s.id,t.id from startups s,tags t where s.slug=$1 and t.name=$2 on conflict do nothing",[p.slug,p.category]),
]);
const admins = await db.query("select count(*)::int as total from profiles where role='admin'");
console.log(`Verified initial administrators: ${admins[0].total}. Imported three supplied projects; unverified ownership remains curator-labelled.`);
