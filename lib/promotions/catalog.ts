import "server-only";
import { sql } from "@/lib/db/neon";
import type { PromotionPlan } from "@/lib/promotions/plans";
export async function getPlans():Promise<PromotionPlan[]>{const row=(await sql`select value from platform_settings where key='promotion_plans'`)[0];return row?.value as PromotionPlan[]??[];}
export async function getPlan(tier:string):Promise<PromotionPlan|undefined>{return (await getPlans()).find(plan=>plan.tier===tier);}
