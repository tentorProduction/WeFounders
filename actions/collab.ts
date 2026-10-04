"use server";

import { requireFeature } from "@/lib/platform";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { addCollabPost, normalizeContactChannel } from "@/lib/collab/store";
import { getViewer } from "@/lib/auth/viewer";
// Type/initial value live outside this "use server" module — see the file.
import type { CollabPostActionState } from "@/lib/action-state";
import { headers } from "next/headers";
import { clientAddress, isRateLimited } from "@/lib/security/rate-limit";
import { collabCategories } from "@/lib/collab/categories";

/**
 * Post a collab/co-founder opportunity (PRD §4.1, TRD §2 table 11,
 * DESIGN.md §4.5). Requires a signed-in viewer; the author is taken from the
 * verified session, never from the form.
 */

const collabSchema = z.object({
  category:z.enum(collabCategories),
  company:z.string().trim().max(120),skills:z.string().trim().max(500),location:z.string().trim().max(120),experience:z.string().trim().max(200),remote:z.boolean(),
  roleType: z.enum([
    "cofounder",
    "founding_engineer",
    "designer",
    "beta_tester",
    "intern",
  ]),
  title: z.string().trim().min(10).max(150),
  description: z.string().trim().min(40).max(2000),
  equityOrCompensation: z.string().trim().max(120),
  contactRaw: z.string().trim().max(200),
});

export async function postOpportunityAction(
  _prevState: CollabPostActionState,
  formData: FormData
): Promise<CollabPostActionState> {
  await requireFeature('collab_enabled');
  const parsed = collabSchema.safeParse({
    category:formData.get('category'),company:String(formData.get('company')??''),skills:String(formData.get('skills')??''),location:String(formData.get('location')??''),experience:String(formData.get('experience')??''),remote:formData.get('remote')==='on',
    roleType: String(formData.get("roleType") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    equityOrCompensation: String(formData.get("equityOrCompensation") ?? ""),
    contactRaw: String(formData.get("contactRaw") ?? ""),
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0]?.path[0];
    return {
      status: "error",
      message:
        first === "title"
          ? "Give the listing a clear title (10+ characters)."
          : first === "description"
            ? "Describe the role in at least 40 characters."
            : first === "roleType"
              ? "Pick a role type."
              : "Check the form — something didn't validate.",
    };
  }

  const contact = normalizeContactChannel(parsed.data.contactRaw);
  if (!contact) {
    return {
      status: "error",
      message:
        "Contact must be a phone number (WhatsApp), @telegram handle, or email.",
    };
  }

  const viewer = await getViewer();
  if (!viewer.userId) {
    return {
      status: "error",
      message: "Sign in with Google to post an opportunity.",
    };
  }

  if (await isRateLimited("collab-post", `${viewer.userId}:${clientAddress(await headers())}`, 5, 60 * 60_000)) {
    return { status: "error", message: "Too many listings from this account. Try again later." };
  }

  try {
    await addCollabPost({
      category:parsed.data.category,company:parsed.data.company,skills:parsed.data.skills.split(',').map(v=>v.trim()).filter(Boolean).slice(0,20),location:parsed.data.location,experience:parsed.data.experience,remote:parsed.data.remote,
      roleType: parsed.data.roleType,
      title: parsed.data.title,
      description: parsed.data.description,
      equityOrCompensation: parsed.data.equityOrCompensation || null,
      contactChannel: contact,
      authorId: viewer.userId,
      authorName: viewer.fullName ?? viewer.email?.split("@")[0] ?? "WeFounders builder",
    });
  } catch (error) {
    console.error("[collab] post failed:", error);
    return { status: "error", message: "We couldn't publish that. Please try again." };
  }

  revalidatePath("/collab");

  return {
    status: "success",
    message: "Listing submitted for administrator review.",
  };
}
