import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function DashboardRedirect() {
  const session = await readSession();
  if (!session) {
    redirect("/sign-in");
  }
  redirect("/dashboard/founder");
}
