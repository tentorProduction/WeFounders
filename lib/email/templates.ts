import type { StartupWithTags } from "@/types/database";

/**
 * Branded Wefounder.dev email templates — Black & White monochrome layout.
 */

const BLACK = "#000000";
const INK = "#18181B";
const MUTED = "#71717A";

function shell(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#FAFAFA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:${INK};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FFFFFF;border:1px solid #E4E4E7;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:${BLACK};padding:16px 24px;">
                <span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;background:${BLACK};border:2px solid #FFFFFF;border-radius:8px;color:#FFFFFF;font-weight:700;font-size:14px;">W</span>
                <span style="color:#FFFFFF;font-weight:700;font-size:16px;margin-left:8px;">Wefounder<span style="opacity:.75;">.dev</span></span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 24px 8px;">
                <h1 style="margin:0 0 12px;font-size:20px;line-height:1.3;color:${INK};">${title}</h1>
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px 24px;border-top:1px solid #F4F4F5;margin-top:16px;">
                <p style="margin:0;font-size:12px;color:${MUTED};">
                  You received this because of activity on Wefounder.dev — Nepal&apos;s
                  first beta launchpad.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export interface WaitlistConfirmationInput {
  email: string;
  startup: Pick<StartupWithTags, "name" | "slug" | "tagline">;
  position: number;
}

/** Sent to the tester/lead right after they join a beta waitlist. */
export function waitlistConfirmationEmail(
  input: WaitlistConfirmationInput
): { subject: string; html: string; text: string } {
  const subject = `You're on the ${input.startup.name} beta waitlist`;
  const cta = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/startups/${input.startup.slug}`;

  const html = shell(
    `You&apos;re in — position #${input.position}`,
    `
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:${INK};">
      You just joined the private beta waitlist for
      <strong>${input.startup.name}</strong> on Wefounder.dev.
    </p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${MUTED};">
      &ldquo;${input.startup.tagline}&rdquo;
    </p>
    <p style="margin:0 0 24px;">
      <a href="${cta}" style="display:inline-block;background:${BLACK};color:#FFFFFF;text-decoration:none;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;">
        View the launch &rarr;
      </a>
    </p>
    <p style="margin:0;font-size:13px;line-height:1.6;color:${MUTED};">
      We&apos;ll email you at <strong>${input.email}</strong> the moment the founder
      opens the beta. No spam — launch updates only.
    </p>`
  );

  const text = [
    `You're in - position #${input.position}`,
    ``,
    `You just joined the private beta waitlist for ${input.startup.name} on Wefounder.dev.`,
    `"${input.startup.tagline}"`,
    ``,
    `View the launch: ${cta}`,
    ``,
    `We'll email you the moment the founder opens the beta. No spam - launch updates only.`,
  ].join("\n");

  return { subject, html, text };
}

export interface FounderLeadAlertInput {
  founderEmail: string;
  leadEmail: string;
  startup: Pick<StartupWithTags, "name" | "slug">;
  waitlistCount: number;
}

/** Sent to the founder when someone new joins their waitlist. */
export function founderLeadAlertEmail(
  input: FounderLeadAlertInput
): { subject: string; html: string; text: string } {
  const subject = `New beta lead: ${input.leadEmail}`;
  const cta = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/startups/${input.startup.slug}`;

  const html = shell(
    `New waitlist signup for ${input.startup.name}`,
    `
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:${INK};">
      <strong>${input.leadEmail}</strong> just joined your beta waitlist — you
      now have <strong>${input.waitlistCount} leads</strong> in total.
    </p>
    <p style="margin:0 0 24px;">
      <a href="${cta}" style="display:inline-block;background:${BLACK};color:#FFFFFF;text-decoration:none;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;">
        Export your leads (CSV) &rarr;
      </a>
    </p>`
  );

  const text = [
    `New waitlist signup for ${input.startup.name}`,
    ``,
    `${input.leadEmail} just joined your beta waitlist - you now have ${input.waitlistCount} leads in total.`,
    ``,
    `Export your leads: ${cta}`,
  ].join("\n");

  return { subject, html, text };
}
