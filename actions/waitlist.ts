"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getStartupBySlug } from "@/lib/data/startups";
import { getViewer } from "@/lib/auth/viewer";
import { addWaitlistEntry, countWaitlist } from "@/lib/waitlist/store";
import { isEmailConfigured, sendEmail } from "@/lib/email/resend";
import { waitlistConfirmationEmail } from "@/lib/email/templates";
import { clientAddress, isRateLimited } from "@/lib/security/rate-limit";
// Types/initial value live outside this "use server" module — see the file.
import type { WaitlistActionState } from "@/lib/action-state";

/**
 * Waitlist lead capture (PRD §4.1 flow, TRD §5 anti-abuse).
 *
 * Validates input with zod, applies a best-effort per-IP throttle, then writes
 * through lib/waitlist/store into Supabase, and fires a Resend confirmation.
 */

const waitlistSchema = z.object({
  slug: z.string().min(1),
  email: z.email(),
  phone: z.union([
    z.literal(""),
    z.string().regex(/^(\+977)?[0-9]{7,10}$/),
  ]),
  notes: z.string().max(280).optional(),
  referralSource: z.string().max(120).optional(),
});

export async function joinWaitlistAction(
  _prevState: WaitlistActionState,
  formData: FormData
): Promise<WaitlistActionState> {
  const slug = String(formData.get("slug") ?? "");
  const referralSource = String(formData.get("referralSource") ?? "showcase");

  const parsed = waitlistSchema.safeParse({
    slug,
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    phone: String(formData.get("phone") ?? "").trim(),
    notes: formData.get("notes") ? String(formData.get("notes")) : undefined,
    referralSource,
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const message = issue?.path[0] === "phone"
      ? "Enter a valid Nepali number, e.g. 98XXXXXXXX"
      : "Enter a valid email address";
    return { status: "error", message };
  }

  const startup = await getStartupBySlug(parsed.data.slug);
  if (!startup) {
    return { status: "error", message: "That startup no longer exists." };
  }

  const headerList = await headers();
  if (await isRateLimited("waitlist", clientAddress(headerList), 3, 60_000)) {
    return {
      status: "error",
      message: "Too many signups from this network. Try again in a minute.",
    };
  }

  const viewer = await getViewer();

  const result = await addWaitlistEntry({
    startupId: startup.id,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    notes: parsed.data.notes ?? null,
    referralSource: parsed.data.referralSource ?? null,
    userId: viewer.userId,
  });

  if (!result.ok) {
    return {
      status: "error",
      message:
        result.reason === "duplicate"
          ? "You're already on this waitlist — we'll email you when the beta opens."
          : "We couldn't save that just now. Please try again.",
      email: parsed.data.email,
    };
  }

  const position = (await countWaitlist(startup.id)) + (startup.waitlist_count ?? 0);

  // Fire-and-forget confirmation email (deployment guide §2 — Resend free
  // tier). A failed send is logged, never surfaced to the user: the lead is
  // already captured.
  if (isEmailConfigured()) {
    const mail = waitlistConfirmationEmail({
      email: parsed.data.email,
      startup: {
        name: startup.name,
        slug: startup.slug,
        tagline: startup.tagline,
      },
      position,
    });
    void sendEmail({ to: parsed.data.email, ...mail }).then((sent) => {
      if (!sent.ok) {
        console.warn(`[waitlist] confirmation email not sent: ${sent.error}`);
      }
    });
  }

  revalidatePath(`/startups/${startup.slug}`);

  return {
    status: "success",
    message: `You're in! We'll email ${parsed.data.email} the moment the beta opens.`,
    position,
    email: parsed.data.email,
  };
}
