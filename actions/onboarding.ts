"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db/neon";
import { readSession } from "@/lib/auth/session";

export type OnboardingActionState = {
  error?: string;
  success?: boolean;
} | null;

export async function completeOnboardingAction(
  prevState: OnboardingActionState,
  formData: FormData
): Promise<OnboardingActionState> {
  const session = await readSession();
  if (!session) {
    redirect("/sign-in");
  }

  const roles = formData.getAll("roles") as string[];
  const bio = (formData.get("bio") as string)?.trim() || "";
  const location = (formData.get("location") as string)?.trim() || "";
  let portfolioUrl = (formData.get("portfolioUrl") as string)?.trim() || "";
  const skillsInput = (formData.get("skills") as string)?.trim() || "";
  const skills = skillsInput ? skillsInput.split(",").map((s) => s.trim()).filter(Boolean) : [];

  // Strict Validation: Everything is compulsory
  if (roles.length === 0) {
    return { error: "Please select at least one primary role." };
  }

  if (!bio || bio.length < 20) {
    return {
      error: `Bio must be at least 20 characters long. Current length: ${bio.length} characters.`,
    };
  }

  if (!location) {
    return { error: "Location is compulsory. Please enter your location (e.g. city, country, or Remote)." };
  }

  if (!portfolioUrl) {
    return { error: "Portfolio or GitHub URL is compulsory." };
  }

  if (!portfolioUrl.startsWith("http://") && !portfolioUrl.startsWith("https://")) {
    portfolioUrl = `https://${portfolioUrl}`;
  }

  try {
    new URL(portfolioUrl);
  } catch {
    return { error: "Please provide a valid URL for your portfolio or GitHub profile." };
  }

  if (skills.length === 0) {
    return { error: "Top skills or tech stack is compulsory. Please enter at least one skill." };
  }

  await sql`
    UPDATE profiles SET
      onboarding_completed = true,
      roles = ${roles}::text[],
      bio = ${bio},
      location = ${location},
      portfolio_url = ${portfolioUrl},
      skills = ${skills}::text[]
    WHERE id = ${session.userId}::uuid
  `;

  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  redirect("/discover");
}
