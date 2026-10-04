import assert from "node:assert/strict";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ quiet: true });
assert(process.env.DATABASE_URL, "DATABASE_URL is required");
const db = neon(process.env.DATABASE_URL);
const result = await db.query("select count(*)::int as total from profiles where role='admin'");
assert.equal(result[0].total, 1, "Exactly one initial administrator");
// Roll back every fixture. A final division-by-zero can only run after assertions pass.
try {
 await db.transaction([
  db.query(`do $$ declare founder uuid:=gen_random_uuid(); tester uuid:=gen_random_uuid(); other_tester uuid:=gen_random_uuid(); project uuid; quest uuid; report uuid; blocked boolean:=false; begin
   insert into profiles(id,clerk_user_id,email,full_name,username) values(founder,founder::text,founder||'@test.invalid','Test',founder::text),(tester,tester::text,tester||'@test.invalid','Test',tester::text),(other_tester,other_tester::text,other_tester||'@test.invalid','Test',other_tester::text);
   insert into startups(founder_id,slug,name,tagline,status) values(founder,founder::text,'Test','Test','approved') returning id into project;
   begin insert into upvotes(startup_id,user_id) values(project,founder); exception when others then blocked:=true; end;
   if not blocked then raise exception 'Self-vote allowed'; end if;
   insert into testing_quests(startup_id,title,karma_reward,max_submissions) values(project,'Test',10,1) returning id into quest;
   insert into quest_submissions(quest_id,tester_id,feedback_text,rating_ux,rating_speed) values(quest,tester,'A detailed testing report',4,4) returning id into report;
   blocked:=false;
   begin insert into quest_members(quest_id,tester_id) values(quest,other_tester); exception when others then blocked:=true; end;
   if not blocked then raise exception 'Reserved slot exceeded'; end if;
   blocked:=false;
   begin insert into quest_submissions(quest_id,tester_id,feedback_text,rating_ux,rating_speed) values(quest,tester,'Another testing report',4,4); exception when others then blocked:=true; end;
   if not blocked then raise exception 'Duplicate report allowed'; end if;
   update quest_submissions set status='accepted' where id=report;
   update quest_submissions set status='rejected' where id=report;
   update quest_submissions set status='accepted' where id=report;
   if (select karma_score from profiles where id=tester)<>10 then raise exception 'Reward duplicated'; end if;
   blocked:=false;begin update karma_transactions set amount=1000 where user_id=tester; exception when others then blocked:=true; end;
   if not blocked then raise exception 'Karma history altered'; end if;
   insert into follows(user_id,startup_id) values(tester,project);
   insert into bookmarks(user_id,startup_id) values(tester,project);
   if not exists(select 1 from notifications where user_id=founder and kind='follower') then raise exception 'Follower notification missing'; end if;
   if not exists(select 1 from notifications where user_id=tester and kind='review') then raise exception 'Review notification missing'; end if;
  end $$`),
  db.query("select 1/0"),
 ]);
 throw new Error("Expected rollback did not occur");
} catch (error) {
 if ((error as {code?: string}).code!=="22012") console.error((error as Error).message);
 assert.equal((error as {code?: string}).code, "22012", "Security assertions must pass before rollback");
}
console.log("PASS: sole initial admin, self-vote rejection, duplicate reports, reserved slots, immutable idempotent Karma, connected notifications. Fixtures rolled back.");
