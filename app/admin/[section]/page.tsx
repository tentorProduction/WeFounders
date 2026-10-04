import { AdminPlatformTools } from "@/components/admin/platform-tools";
export const dynamic="force-dynamic";
export default async function AdminSection({params,searchParams}:{params:Promise<{section:string}>;searchParams:Promise<{q?:string}>}){const {section}=await params;const {q}=await searchParams;return <AdminPlatformTools section={section} q={q}/>;}
