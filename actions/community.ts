"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireMember,requireFeature,platformSetting } from "@/lib/platform";
import { sql, auditedSql, raw } from "@/lib/db/neon";
import { isRateLimited } from "@/lib/security/rate-limit";

const id = (data: FormData, key = "id") => z.uuid().parse(data.get(key));
const text = (data: FormData, key: string, max=2000, min=0) => z.string().trim().min(min).max(max).parse(data.get(key) ?? "");
const url = (value: string) => !value ? "" : z.url().max(500).refine(v=>/^https?:\/\//i.test(v),"Use an HTTP or HTTPS link").parse(value);
function refresh() { revalidatePath("/", "layout"); }
async function actor(namespace: string) {
 const user=await requireMember();
 if (await isRateLimited(namespace,user.id,30,60_000)) throw new Error("Please wait a minute before trying again.");
 return { user, write:auditedSql(user.id) };
}

export async function follow(data: FormData) {
 const {user}=await actor("follow"); const target=id(data); const kind=z.enum(["startup","profile"]).parse(data.get("kind"));
 const field=kind==='startup' ? 'startup_id' : 'profile_id';
 if (kind==='profile' && target===user.id) throw new Error("You cannot follow yourself.");
 const available=kind==='startup' ? await sql`select id from startups where id=${target}::uuid and status='approved' and archived_at is null and launch_date<=now()` : await sql`select id from profiles where id=${target}::uuid and suspended_at is null`;
 if (!available.length) throw new Error("This page is unavailable.");
 if (data.get("active")==="true") await sql`delete from follows where user_id=${user.id}::uuid and ${raw(field)}=${target}::uuid`;
 else {
  await sql`insert into follows(user_id,${raw(field)}) values(${user.id}::uuid,${target}::uuid) on conflict do nothing`;
 }
 refresh();
}

export async function bookmark(data: FormData) {
 const {user}=await actor("bookmark"); const target=id(data); const kind=z.enum(["startup","quest","collab"]).parse(data.get("kind"));
 const field={startup:'startup_id',quest:'quest_id',collab:'collab_id'}[kind];
 const available=kind==='startup' ? await sql`select id from startups where id=${target}::uuid and status='approved' and archived_at is null and launch_date<=now()` : kind==='quest' ? await sql`select q.id from testing_quests q join startups s on s.id=q.startup_id where q.id=${target}::uuid and q.approval_status='approved' and s.status='approved' and s.archived_at is null and s.launch_date<=now()` : await sql`select id from collab_posts where id=${target}::uuid and approval_status='approved' and is_active`;
 if(!available.length) throw new Error("This item is unavailable.");
 if(data.get("active")==="true") await sql`delete from bookmarks where user_id=${user.id}::uuid and ${raw(field)}=${target}::uuid`;
 else await sql`insert into bookmarks(user_id,${raw(field)}) values(${user.id}::uuid,${target}::uuid) on conflict do nothing`;
 refresh();
}

export async function saveProfile(data: FormData) {
 const {user,write}=await actor("profile");
 const roles=data.getAll("roles").map(v=>z.enum(['founder','builder','tester','designer','developer','marketer','investor','advisor']).parse(v));
 const skills=text(data,"skills",500).split(",").map(v=>v.trim()).filter(Boolean).slice(0,20);
 const interests=text(data,"interests",500).split(",").map(v=>v.trim()).filter(Boolean).slice(0,20);
 await write`update profiles set full_name=${text(data,"name",80,1)},bio=${text(data,"bio",1000)},location=${text(data,"location",120)},skills=${skills}::text[],interests=${interests}::text[],member_roles=${roles}::text[],availability=${text(data,"availability",150)},website_url=${url(text(data,"website",500))},github_handle=${text(data,"github",100)},twitter_handle=${text(data,"twitter",100)},onboarded_at=now(),email_notifications=${data.get("emailNotifications")==='on'},weekly_digest=${data.get("weeklyDigest")==='on'} where id=${user.id}::uuid`;
 refresh();
}

export async function skipOnboarding() {
 const {user}=await actor("onboarding"); await sql`update profiles set onboarded_at=now() where id=${user.id}::uuid`; refresh();
}

export async function readNotifications(data: FormData) {
 const {user}=await actor("notification-read");
 if(data.get("all")==="true") await sql`update notifications set read_at=now() where user_id=${user.id}::uuid and read_at is null`;
 else await sql`update notifications set read_at=now() where id=${id(data)}::uuid and user_id=${user.id}::uuid`;
 refresh();
}

export async function createUpdate(data: FormData) {
 const {user,write}=await actor("update"); const project=id(data,"startupId");
 const rows=await write`insert into startup_updates(startup_id,author_id,title,version,description,image_url,link_url)
 select id,${user.id}::uuid,${text(data,"title",120,3)},${text(data,"version",30)},${text(data,"description",8000,20)},${url(text(data,"image",500))||null},${url(text(data,"link",500))||null} from startups where id=${project}::uuid and founder_id=${user.id}::uuid and status='approved' and archived_at is null returning id`;
 if(!rows.length) throw new Error("Only the founder can publish an update for this live startup."); refresh();
}

export async function createQuest(data: FormData) {
 await requireFeature('quests_enabled'); const {user,write}=await actor("quest-create"); const project=id(data,"startupId");
 const deadline=text(data,"deadline",30); const date=deadline?z.iso.datetime().parse(new Date(deadline).toISOString()):null;
 const rows=await write`insert into testing_quests(startup_id,title,task_instructions,target_devices,reward_description,max_submissions,karma_reward,estimated_minutes,deadline,required_skills,approval_status)
 select id,${text(data,"title",120,3)},${text(data,"instructions",10000,20)},${text(data,"devices",200)},${text(data,"reward",240)},${z.coerce.number().int().min(1).max(500).parse(data.get("slots"))},${z.coerce.number().int().min(0).max(500).parse(data.get("karma"))},${z.coerce.number().int().min(1).max(600).parse(data.get("minutes"))},${date}::timestamptz,${text(data,"skills",500).split(',').map(v=>v.trim()).filter(Boolean)}::text[],${(await platformSetting('moderation_rules')).require_quest_approval===false?'approved':'pending'}
 from startups where id=${project}::uuid and founder_id=${user.id}::uuid and status='approved' and archived_at is null returning id`;
 if(!rows.length) throw new Error("Choose one of your live startups."); refresh();
}

export async function joinQuest(data: FormData) {
 await requireFeature('quests_enabled'); const {user}=await actor("quest-join"); const quest=id(data);
 const rows=await sql`with q as (select q.* from testing_quests q join startups s on s.id=q.startup_id where q.id=${quest}::uuid and q.status='active' and q.approval_status='approved' and s.status='approved' and s.archived_at is null and s.founder_id<>${user.id}::uuid and (q.deadline is null or q.deadline>now()) for update of q)
 insert into quest_members(quest_id,tester_id) select id,${user.id}::uuid from q where (select count(*) from quest_members where quest_id=q.id)<q.max_submissions on conflict do nothing returning quest_id`;
 if(!rows.length) throw new Error("Already joined, full, or unavailable."); refresh();
}

export async function submitReport(data: FormData) {
 const {user,write}=await actor("quest-submit"); const quest=id(data,"questId");
 const evidence=text(data,"evidence",2500).split(/\n/).map(v=>v.trim()).filter(Boolean).slice(0,5).map(url);
 const previous=(await sql`select id,review_state from quest_submissions where quest_id=${quest}::uuid and tester_id=${user.id}::uuid`)[0];
 if(previous) {
  if(previous.review_state!=='needs_changes') throw new Error("This report is already submitted.");
  const revised=await write`update quest_submissions r set feedback_text=${text(data,"feedback",10000,20)},rating_ux=${z.coerce.number().int().min(1).max(5).parse(data.get("ux"))},rating_speed=${z.coerce.number().int().min(1).max(5).parse(data.get("speed"))},proof_screenshots=${evidence}::text[],device_info=${JSON.stringify({device:text(data,"device",200),bugs:text(data,"bugs",2000),answers:text(data,"answers",3000)})}::jsonb,review_state='pending',status='pending',reviewed_at=null,reviewed_by=null where r.id=${previous.id}::uuid and r.tester_id=${user.id}::uuid and r.review_state='needs_changes' returning id`;
  if(!revised.length) throw new Error("Report changed. Refresh and try again."); refresh(); return;
 }
 const rows=await write`insert into quest_submissions(quest_id,tester_id,tester_name,feedback_text,rating_ux,rating_speed,proof_screenshots,device_info)
 select ${quest}::uuid,${user.id}::uuid,${user.full_name},${text(data,"feedback",10000,20)},${z.coerce.number().int().min(1).max(5).parse(data.get("ux"))},${z.coerce.number().int().min(1).max(5).parse(data.get("speed"))},${evidence}::text[],${JSON.stringify({device:text(data,"device",200),bugs:text(data,"bugs",2000),answers:text(data,"answers",3000)})}::jsonb
 where exists(select 1 from quest_members where quest_id=${quest}::uuid and tester_id=${user.id}::uuid) returning id`;
 if(!rows.length) throw new Error("Join this quest before submitting."); refresh();
}

export async function reviewSubmission(data: FormData) {
 const {user,write}=await actor("quest-review"); const report=id(data); const decision=z.enum(['approved','needs_changes','rejected']).parse(data.get('decision'));
 const rows=await write`update quest_submissions r set status=${decision==='approved'?'accepted':decision==='rejected'?'rejected':'pending'}::submission_status,review_state=${decision},founder_feedback=${text(data,"feedback",1000,3)},reviewed_by=${user.id}::uuid,reviewed_at=now()
 from testing_quests q,startups s where r.id=${report}::uuid and r.quest_id=q.id and q.startup_id=s.id and r.tester_id<>${user.id}::uuid and r.status<>'accepted' and (s.founder_id=${user.id}::uuid or ${user.role==='admin'}) returning r.id`;
 if(!rows.length) throw new Error("Only the founder or administrator can review a pending report."); refresh();
}

export async function reportItem(data: FormData) {
 const {user,write}=await actor("report"); const kind=z.enum(['startup','comment','profile','quest','collab']).parse(data.get("kind")); const target=id(data);
 const reason=z.enum(['spam','abuse','misleading','fraud','broken','other']).parse(data.get("reason"));
 const table={startup:'startups',comment:'comments',profile:'profiles',quest:'testing_quests',collab:'collab_posts'}[kind];
 const exists=await sql`select id from ${raw(table)} where id=${target}::uuid`;
 if(!exists.length) throw new Error("Item not found.");
 await write`insert into reports(reporter_id,target_type,target_id,reason,description) values(${user.id}::uuid,${kind},${target}::uuid,${reason},${text(data,"description",1000)}) on conflict do nothing`; refresh();
}

export async function comment(data: FormData) {
 const {user,write}=await actor("comment"); const project=id(data,"startupId"); const parent=data.get("parentId") ? id(data,"parentId") : null;
 if(parent && !(await sql`select id from comments where id=${parent}::uuid and startup_id=${project}::uuid`).length) throw new Error("Reply target not found.");
 const rows=await write`insert into comments(startup_id,user_id,parent_id,content,is_founder_reply) select id,${user.id}::uuid,${parent}::uuid,${text(data,"content",4000,2)},founder_id=${user.id}::uuid from startups where id=${project}::uuid and status='approved' and archived_at is null and launch_date<=now() returning id`;
 if(!rows.length) throw new Error("Discussion unavailable."); refresh();
}

export async function deleteComment(data: FormData) {
 const {user,write}=await actor("comment-delete"); await write`delete from comments where id=${id(data)}::uuid and (user_id=${user.id}::uuid or ${user.role==='admin'})`; refresh();
}

export async function likeComment(data: FormData) {
 const {user}=await actor("comment-like"); const target=id(data);
 if(data.get("active")==='true') await sql`delete from comment_likes where comment_id=${target}::uuid and user_id=${user.id}::uuid`;
 else await sql`insert into comment_likes(comment_id,user_id) select id,${user.id}::uuid from comments c where id=${target}::uuid and user_id<>${user.id}::uuid and exists(select 1 from startups s where s.id=c.startup_id and s.status='approved' and s.archived_at is null and s.launch_date<=now()) on conflict do nothing`; refresh();
}

export async function applyCollab(data: FormData) {
 const {user,write}=await actor("collab-apply"); const rows=await write`insert into collab_applications(collab_id,user_id,message) select id,${user.id}::uuid,${text(data,"message",2000,20)} from collab_posts where id=${id(data)}::uuid and is_active and approval_status='approved' and author_id<>${user.id}::uuid on conflict do nothing returning id`;
 if(!rows.length) throw new Error("Already applied or opportunity unavailable."); refresh();
}

export async function reviewApplication(data: FormData) {
 const {user,write}=await actor("application-review"); const decision=z.enum(['accepted','rejected']).parse(data.get('decision'));
 const rows=await write`update collab_applications a set status=${decision} from collab_posts c where a.id=${id(data)}::uuid and a.collab_id=c.id and c.author_id=${user.id}::uuid returning a.id`;
 if(!rows.length) throw new Error("Application unavailable."); refresh();
}

export async function saveDraft(data: FormData) {
 const {user}=await actor("draft"); const content=text(data,"content",25000); const parsed=z.record(z.string(),z.unknown()).parse(JSON.parse(content));
 await sql`insert into submission_drafts(user_id,content) values(${user.id}::uuid,${JSON.stringify(parsed)}::jsonb) on conflict(user_id) do update set content=excluded.content,updated_at=now()`;
}

export async function activateReferral(data: FormData) {
 const {user}=await actor("referral"); const code=id(data,"code");
 await sql`insert into referrals(referred_id,referrer_id) select ${user.id}::uuid,id from profiles where referral_code=${code}::uuid and id<>${user.id}::uuid and suspended_at is null on conflict do nothing`; refresh();
}
