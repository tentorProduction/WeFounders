import { createHmac } from "node:crypto";
import { z } from "zod";
import { sql } from "@/lib/db/neon";
import { readBoundedBody } from "@/lib/security/request-body";
import { hasTrustedOrigin } from "@/lib/security/request-origin";
import { clientAddress,isRateLimited } from "@/lib/security/rate-limit";
export const dynamic="force-dynamic";
export async function POST(request:Request){
 if(!hasTrustedOrigin(request))return new Response(null,{status:403});
 const content=await readBoundedBody(request,1024);if(!content)return new Response(null,{status:413});
 let parsed;try{parsed=z.object({id:z.uuid(),source:z.string().max(200)}).safeParse(JSON.parse(content));}catch{return new Response(null,{status:400});}
 if(!parsed.success)return new Response(null,{status:400});
 const address=clientAddress(request.headers);if(await isRateLimited('views',address,60,60_000))return new Response(null,{status:429});
 const secret=process.env.CLERK_SECRET_KEY;if(!secret)return new Response(null,{status:503});
 const ua=request.headers.get('user-agent')??'';const hash=createHmac('sha256',secret).update(`${address}:${ua}:${new Date().toISOString().slice(0,10)}`).digest('hex');
 const source=/^[a-z0-9.-]{1,200}$/i.test(parsed.data.source)?parsed.data.source:'direct';
 await sql`insert into startup_views(startup_id,visitor_hash,source,device) select id,${hash},${source},${/mobile|android/i.test(ua)?'mobile':'desktop'} from startups where id=${parsed.data.id}::uuid and status='approved' and archived_at is null and launch_date<=now() on conflict do nothing`;
 return new Response(null,{status:204});
}
