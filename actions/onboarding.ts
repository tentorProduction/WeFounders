"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db/neon";
import { readSession } from "@/lib/auth/session";

export async function completeOnboardingAction(formData: FormData) {
  const session = await readSession();
  if (!session) {
    redirect("/sign-in");
  }

  const roles = formData.getAll("roles") as string[];
  const bio = (formData.get("bio") as string)?.trim() || null;
  const location = (formData.get("location") as string)?.trim() || null;
  const portfolioUrl = (formData.get("portfolioUrl") as string)?.trim() || null;
  const skillsInput = (formData.get("skills") as string)?.trim() || "";
  const skills = skillsInput ? skillsInput.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const rolesArray = roles.length > 0 ? roles : ["user"];

  await sql`
    UPDATE profiles SET
      onboarding_completed = true,
      roles = ${rolesArray}::text[],
      bio = COALESCE(${bio}, bio),
      location = ${location},
      portfolio_url = ${portfolioUrl},
      skills = ${skills}::text[]
    WHERE id = ${session.userId}::uuid
  `;

  revalidatePath("/");
  revalidatePath("/profile");
  redirect("/discover");
}
