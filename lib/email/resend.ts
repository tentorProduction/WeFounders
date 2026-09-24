/**
 * Resend transactional email client (deployment guide §2 — Resend free tier,
 * 3,000 emails/month). Uses the REST API directly so no SDK dependency is
 * needed. Fire-and-forget from server actions: a failed send must never
 * break the user flow, it is only logged.
 */

const RESEND_API_URL = "https://api.resend.com/emails";

/**
 * Resend only allows sending from a verified domain. Until wefounder.dev is
 * verified, `onboarding@resend.com` is the sanctioned test sender.
 */
const FROM_SENDER =
  process.env.RESEND_FROM_EMAIL ?? "Wefounder <onboarding@resend.com>";

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string | string[];
}

export interface SendEmailResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/** Low-level send. Never throws. */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY is not configured" };
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_SENDER,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
      cache: "no-store",
    });

    const body = (await response.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
    };

    if (!response.ok) {
      console.error(
        `[resend] send failed (${response.status}): ${body.message ?? "unknown"}`
      );
      return { ok: false, error: body.message ?? `HTTP ${response.status}` };
    }

    return { ok: true, id: body.id };
  } catch (error) {
    console.error("[resend] send failed:", error);
    return { ok: false, error: error instanceof Error ? error.message : "network" };
  }
}
