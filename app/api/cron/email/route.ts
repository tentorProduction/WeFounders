import { timingSafeEqual } from "node:crypto";
import { NextRequest,NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { sendEmail,isEmailConfigured } from "@/lib/email/resend";
import { getSiteOrigin } from "@/lib/site-url";

export const dynamic="force-dynamic";
export const runtime="nodejs";
const escape=(value:string)=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));

export async function GET(request:NextRequest) {
 const secret=process.env.CRON_SECRET;
 if(!secret||!isEmailConfigured()||!process.env.RESEND_FROM_EMAIL) return NextResponse.json({error:"Configure CRON_SECRET, RESEND_API_KEY and a verified RESEND_FROM_EMAIL."},{status:503});
 const expected=Buffer.from(`Bearer ${secret}`),provided=Buffer.from(request.headers.get('authorization')??'');
 if(expected.length!==provided.length||!timingSafeEqual(expected,provided)) return NextResponse.json({error:"Unauthorized"},{status:401});
 await sql`with recipients as (select id from profiles p where p.weekly_digest and p.email_notifications and p.suspended_at is null and not exists(select 1 from weekly_digest_receipts d where d.user_id=p.id and d.week=date_trunc('week',now())::date) limit 250), queued as (insert into weekly_digest_receipts(user_id,week) select id,date_trunc('week',now())::date from recipients on conflict do nothing returning user_id) insert into notifications(user_id,kind,title,href) select user_id,'digest','This week on WeFounders','/discover' from queued`;
 const rows=await sql`with batch as (select o.id from email_outbox o join notifications n on n.id=o.notification_id join profiles p on p.id=n.user_id where o.delivered_at is null and o.attempts<5 and (o.locked_until is null or o.locked_until<now()) and p.email_notifications and p.suspended_at is null order by o.created_at limit 25 for update of o skip locked) update email_outbox o set locked_until=now()+interval '5 minutes',attempts=attempts+1 from batch where o.id=batch.id returning o.id,o.notification_id`;
 let delivered=0;
 for(const row of rows) {
  const item=(await sql`select n.title,n.href,n.kind,p.email from notifications n join profiles p on p.id=n.user_id where n.id=${row.notification_id}::uuid and p.email_notifications and p.suspended_at is null and (n.kind<>'digest' or p.weekly_digest)`)[0];
  if(!item) {await sql`update email_outbox set delivered_at=now(),last_error='Recipient opted out' where id=${row.id}::uuid`;continue;}
  const title=String(item.title),href=String(item.href),link=getSiteOrigin()+(href.startsWith('/')&&!href.startsWith('//')?href:'/notifications');
  const settings=getSiteOrigin()+'/settings';
  let digestText='',digestHtml='';
  if(item.kind==='digest') {
   const items=await sql`(select 'New launch' as label,name as title,'/startups/'||slug as href from startups where status='approved' and archived_at is null and launch_date between now()-interval '7 days' and now() order by launch_date desc limit 5) union all (select 'Trending product',s.name,'/startups/'||s.slug from startups s join upvotes u on u.startup_id=s.id where s.status='approved' and s.archived_at is null and s.launch_date<=now() and u.created_at>now()-interval '7 days' group by s.id order by count(*) desc limit 3) union all (select 'New quest',q.title,'/quests/'||q.id from testing_quests q join startups s on s.id=q.startup_id where q.approval_status='approved' and q.status='active' and s.status='approved' and s.archived_at is null and q.created_at>now()-interval '7 days' order by q.created_at desc limit 5) union all (select 'Top builder',p.full_name,'/profile/'||p.username from profiles p join karma_transactions k on k.user_id=p.id where p.suspended_at is null and k.created_at>now()-interval '7 days' group by p.id order by sum(k.amount) desc limit 3) union all (select 'Community update',u.title,'/startups/'||s.slug from startup_updates u join startups s on s.id=u.startup_id where s.status='approved' and s.archived_at is null and u.created_at>now()-interval '7 days' order by u.created_at desc limit 3)`;
   digestText=items.map(i=>`${i.label}: ${i.title}\n${getSiteOrigin()}${i.href}`).join('\n\n')||'No new activity this week. Explore the community at your own pace.';
   digestHtml=items.length?'<ul>'+items.map(i=>`<li>${escape(String(i.label))}: <a href="${escape(getSiteOrigin()+String(i.href))}">${escape(String(i.title))}</a></li>`).join('')+'</ul>':'<p>No new activity this week. Explore the community at your own pace.</p>';
  }
  const result=await sendEmail({to:String(item.email),subject:title,text:`${title}\n${digestText}\n${link}\nNotification preferences: ${settings}`,html:`<h1>${escape(title)}</h1>${digestHtml}<p><a href="${escape(link)}">View on WeFounders</a></p><p><a href="${escape(settings)}">Notification preferences</a></p>`,idempotencyKey:`notification-${row.id}`});
  await sql`update email_outbox set delivered_at=case when ${result.ok} then now() else null end,last_error=${result.ok?null:(result.error??'Email delivery failed').slice(0,300)},locked_until=case when ${result.ok} then null else now()+interval '15 minutes' end where id=${row.id}::uuid`;
  if(result.ok)delivered++;
 }
 return NextResponse.json({processed:rows.length,delivered});
}
