import { requireMember } from "@/lib/platform";
import { sql } from "@/lib/db/neon";
import { PlatformPage } from "@/components/platform/ui";
import { SubmissionWizard, type LaunchDraft } from "@/components/startups/submission-wizard";
import { z } from "zod";
import { notFound } from "next/navigation";
export const dynamic="force-dynamic";
export default async function SubmitPage({searchParams}:{searchParams:Promise<{edit?:string}>}){
 const user=await requireMember();
 const {edit}=await searchParams;
 const row=(await sql`select content from submission_drafts where user_id=${user.id}::uuid`)[0];
 const initial:Partial<LaunchDraft>={};
 if(row?.content && typeof row.content==='object')for(const [key,value] of Object.entries(row.content)){if(typeof value==='string')initial[key as keyof LaunchDraft]=value;}
 if(edit){
  if(!z.uuid().safeParse(edit).success)notFound();
  const project=(await sql`select s.*,coalesce((select string_agg(t.name,', ') from startup_tags st join tags t on t.id=st.tag_id where st.startup_id=s.id),'') as tags,coalesce((select string_agg(media_url,E'\n' order by display_order) from startup_media where startup_id=s.id),'') as screenshots from startups s where s.id=${edit}::uuid and s.founder_id=${user.id}::uuid and s.status in ('pending_approval','rejected') and s.archived_at is null`)[0];
  if(!project)notFound();
  for(const [key,column] of Object.entries({name:'name',tagline:'tagline',description:'description',problem:'problem',solution:'solution',audience:'audience',websiteUrl:'website_url',screenshots:'screenshots',stage:'stage',market:'target_market',tags:'tags',betaNotes:'beta_notes'}))initial[key as keyof LaunchDraft]=String(project[column]??'');
  initial.startupId=edit;
 }
 return <PlatformPage title="Your next launch starts here." description="Tell the community what you’re building. Your draft saves to your account as you go."><SubmissionWizard initial={initial} name={user.full_name||user.username}/></PlatformPage>;
}
