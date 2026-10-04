"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyAdmin } from "@/lib/auth/admin";
import { auditedSql } from "@/lib/db/neon";
const id=(data:FormData)=>z.uuid().parse(data.get('id'));
const text=(data:FormData,key:string,max=1000,min=0)=>z.string().trim().min(min).max(max).parse(data.get(key)??'');
const refresh=()=>revalidatePath('/','layout');

export async function manageUser(data:FormData){
 const admin=await verifyAdmin();const write=auditedSql(admin.userId);const target=id(data);const operation=z.enum(['role','suspend','unsuspend','verify','unverify']).parse(data.get('operation'));
 if(target===admin.userId&&(operation==='suspend'||operation==='role'))throw new Error('You cannot suspend yourself or change your own administrator role.');
 if(operation==='role'){
  const role=z.enum(['user','founder','moderator','admin']).parse(data.get('role'));
  const rows=await write`with locked as(select id,role from profiles order by id for update) update profiles set role=${role}::user_role where id=${target}::uuid and (role<>'admin' or ${role==='admin'} or (select count(*) from locked where role='admin')>1) returning id`;
  if(!rows.length)throw new Error('User unavailable or this would remove the last administrator.');
 }else if(operation==='suspend'||operation==='unsuspend')await write`update profiles set suspended_at=${operation==='suspend'?new Date().toISOString():null}::timestamptz where id=${target}::uuid`;
 else await write`update profiles set verified_at=${operation==='verify'?new Date().toISOString():null}::timestamptz where id=${target}::uuid`;
 refresh();
}

export async function moderate(data:FormData){
 const admin=await verifyAdmin();const write=auditedSql(admin.userId);const target=id(data);const kind=z.enum(['startup','quest','collab','comment','report']).parse(data.get('kind'));const operation=z.enum(['approve','reject','changes','archive','verify','unverify','feature','unfeature','pause','close','delete','resolve','dismiss']).parse(data.get('operation'));const reason=text(data,'reason',2000);
 if(['reject','changes','resolve','dismiss','delete'].includes(operation)&&reason.length<3)throw new Error('Enter a reason for this decision.');
 let rows:Record<string,unknown>[]|undefined;
 if(kind==='startup'){
  if(['approve','reject','changes'].includes(operation))rows=await write`update startups set status=${operation==='approve'?'approved':'rejected'}::startup_status,review_state=${operation==='changes'?'changes_requested':operation==='approve'?'approved':'rejected'},rejection_reason=${reason||null},moderation_notes=${reason},launch_date=case when ${operation==='approve'} then now() else launch_date end where id=${target}::uuid and archived_at is null returning id`;
  else if(operation==='archive')rows=await write`update startups set archived_at=now(),moderation_notes=${reason} where id=${target}::uuid returning id`;
  else if(operation==='verify'||operation==='unverify')rows=await write`update startups set verified_at=${operation==='verify'?new Date().toISOString():null}::timestamptz where id=${target}::uuid returning id`;
  else if(operation==='feature'||operation==='unfeature')rows=await write`update startups set is_featured=${operation==='feature'} where id=${target}::uuid returning id`;
 }else if(kind==='quest'){
  if(operation==='approve'||operation==='reject')rows=await write`update testing_quests set approval_status=${operation==='approve'?'approved':'rejected'} where id=${target}::uuid returning id`;
  else if(operation==='pause'||operation==='close')rows=await write`update testing_quests set status=${operation==='pause'?'paused':'completed'}::quest_status where id=${target}::uuid returning id`;
 }else if(kind==='collab'){
  if(operation==='approve'||operation==='reject')rows=await write`update collab_posts set approval_status=${operation==='approve'?'approved':'rejected'} where id=${target}::uuid returning id`;
  else if(operation==='archive')rows=await write`update collab_posts set is_active=false where id=${target}::uuid returning id`;
  else if(operation==='feature'||operation==='unfeature')rows=await write`update collab_posts set is_featured=${operation==='feature'} where id=${target}::uuid returning id`;
 }else if(kind==='comment'&&operation==='delete')rows=await write`delete from comments where id=${target}::uuid returning id`;
 else if(kind==='report'&&(operation==='resolve'||operation==='dismiss'))rows=await write`update reports set status=${operation==='resolve'?'resolved':'dismissed'},resolution=${reason},resolved_by=${admin.userId}::uuid where id=${target}::uuid returning id`;
 if(!rows?.length)throw new Error('Record unavailable or operation invalid for this record.');
 await write`insert into audit_log(actor_id,action,target_type,target_id,details) values(${admin.userId}::uuid,${operation},${kind},${target},${JSON.stringify({reason})}::jsonb)`;refresh();
}

export async function editStartup(data:FormData){
 const admin=await verifyAdmin();const write=auditedSql(admin.userId);
 const website=z.url().max(500).refine(v=>/^https?:\/\//i.test(v)).parse(data.get('website'));
 const rows=await write`update startups set name=${text(data,'name',80,2)},tagline=${text(data,'tagline',180,5)},description=${text(data,'description',10000)},problem=${text(data,'problem',2000)},solution=${text(data,'solution',2000)},audience=${text(data,'audience',2000)},website_url=${website},moderation_notes=${text(data,'notes',2000)} where id=${id(data)}::uuid returning id`;
 if(!rows.length)throw new Error('Startup not found.');refresh();
}

export async function savePlatformSettings(data:FormData){
 const admin=await verifyAdmin();const write=auditedSql(admin.userId);const key=z.enum(['promotion_plans','feature_flags','notification_templates','moderation_rules']).parse(data.get('key'));
 let value:unknown=JSON.parse(text(data,'value',20000,2));
 if(key==='promotion_plans'){
  value=z.array(z.object({tier:z.enum(['featured_48h','weekly_7d']),label:z.string().min(3).max(80),durationHours:z.number().int().min(1).max(720),priceNpr:z.number().positive().max(1000000),blurb:z.string().max(500),perks:z.array(z.string().max(200)).max(10)})).max(2).refine(v=>new Set(v.map(p=>p.tier)).size===v.length,'Plan tiers must be unique').parse(value);
 }else if(key==='feature_flags') value=z.object({submissions_enabled:z.boolean().optional(),quests_enabled:z.boolean().optional(),collab_enabled:z.boolean().optional()}).strict().parse(value);
 else if(key==='moderation_rules') value=z.object({require_quest_approval:z.boolean().optional(),require_collab_approval:z.boolean().optional()}).strict().parse(value);
 else value=z.record(z.string().max(80),z.string().max(2000)).parse(value);
 await write`insert into platform_settings(key,value,updated_by) values(${key},${JSON.stringify(value)}::jsonb,${admin.userId}::uuid) on conflict(key) do update set value=excluded.value,updated_by=excluded.updated_by,updated_at=now()`;
 await write`insert into audit_log(actor_id,action,target_type,target_id) values(${admin.userId}::uuid,'settings','platform_settings',${key})`;refresh();
}

export async function saveTaxonomy(data:FormData){
 const admin=await verifyAdmin();const write=auditedSql(admin.userId);const name=text(data,'name',80,2);const category=z.enum(['industry','stack','payment','telecom']).parse(data.get('category'));const slug=name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');if(!slug)throw new Error('Use a descriptive category name.');
 await write`insert into tags(slug,name,category) values(${slug},${name},${category}) on conflict(slug) do update set name=excluded.name,category=excluded.category`;
 await write`insert into audit_log(actor_id,action,target_type,target_id) values(${admin.userId}::uuid,'taxonomy','tags',${slug})`;refresh();
}

export async function requestRefund(data:FormData){
 const admin=await verifyAdmin();const write=auditedSql(admin.userId);
 const rows=await write`update promotions set refund_requested_at=now(),refund_note=${text(data,'reason',1000,3)} where id=${id(data)}::uuid and status='completed' returning id`;
 if(!rows.length)throw new Error('Only completed payments can enter refund review.');refresh();
}
