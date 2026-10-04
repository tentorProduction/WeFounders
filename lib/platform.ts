import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth/session";
import { sql } from "@/lib/db/neon";

export interface Member {
 id: string; username: string; full_name: string; avatar_url: string | null; bio: string | null;
 role: string; location: string; skills: string[]; interests: string[]; member_roles: string[];
 availability: string; website_url: string | null; github_handle: string | null; twitter_handle: string | null;
 karma_score: number; verified_at: string | null; onboarded_at: string | null;
 email_notifications: boolean; weekly_digest: boolean; referral_code: string;
}

export const member = cache(async (): Promise<Member | null> => {
 const session = await readSession();
 if (!session) return null;
 return (await sql`select id,username,full_name,avatar_url,bio,role,location,skills,interests,member_roles,availability,website_url,github_handle,twitter_handle,karma_score,verified_at,onboarded_at,email_notifications,weekly_digest,referral_code from profiles where id=${session.userId}::uuid`)[0] as unknown as Member;
});

export async function requireMember(): Promise<Member> {
 const user = await member();
 if (!user) redirect("/sign-in?redirect_url=/dashboard");
 return user;
}

export const platformSetting=cache(async(key:string):Promise<Record<string,unknown>>=>{
 const row=(await sql`select value from platform_settings where key=${key}`)[0];
 return row?.value&&typeof row.value==='object'&&!Array.isArray(row.value)?row.value as Record<string,unknown>:{};
});
export async function requireFeature(key:'submissions_enabled'|'quests_enabled'|'collab_enabled') {
 if((await platformSetting('feature_flags'))[key]===false)throw new Error('This feature is temporarily paused by the platform administrator.');
}

export interface ListItem { id: string; title: string; description: string; href: string; status?: string; created_at?: string; value?: number; }
export async function activity(): Promise<ListItem[]> {
 return await sql`
  select id,name as title,'New launch' as description,'/startups/'||slug as href,launch_date as created_at from startups where status='approved' and archived_at is null and launch_date<=now()
  union all select u.id,u.title,'Product update','/startups/'||s.slug,u.created_at from project_updates u join startups s on s.id=u.startup_id where s.status='approved' and s.archived_at is null and s.launch_date<=now()
  order by created_at desc limit 12
 ` as unknown as ListItem[];
}
