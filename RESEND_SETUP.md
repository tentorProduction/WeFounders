# Resend Setup — Wefounder.dev Transactional Email

Transactional email (waitlist confirmations, founder lead alerts) is sent via
[Resend](https://resend.com) (free tier: 3,000 emails/month — deployment guide §2).

## Current state

- **API key**: configured in `.env.local` (`RESEND_API_KEY`). Working and authenticated.
- **Sending domain**: `wefounder.dev` registered in Resend (region `ap-northeast-1`),
  status `not_started` — **waiting on DNS records below**.

## DNS records to add at your DNS provider for wefounder.dev

| # | Type  | Name                | Value |
|---|-------|---------------------|-------|
| 1 | TXT   | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC44LvYhPE4h+Cr82FtGmgxdn1NwubWT4IYsKA/zloYIEyWiCUdfxipNCQ2tmPTXsIZxRdeGIlB3gYy2T63qMp0sanvgRwqVWa35Aad9D7A+3EJO+PQM/k6icHNXwmxBkWHyaDYc+W0SHIiY7xLXKfnPC2CYpkHHqw6zJrIywggoQIDAQAB` |
| 2 | MX    | `send` (priority 10) | `feedback-smtp.ap-northeast-1.amazonses.com` |
| 3 | TXT   | `send`              | `v=spf1 include:amazonses.com ~all` |
| 4 | CNAME | `rsend`             | `send.forge.rmta.net` |

After adding the records, verify at https://resend.com/domains (or
`POST /domains/:id/verify`). Sending address becomes anything `@wefounder.dev`.

## Go-live checklist

1. Add the 4 DNS records above and wait for propagation.
2. Verify the domain in the Resend dashboard.
3. Update `.env.local` / Vercel env:
   `RESEND_FROM_EMAIL=Wefounder <hello@wefounder.dev>`
4. Send a test email (join a waitlist with your own address) and confirm delivery.

## How the app uses it

- `lib/email/resend.ts` — REST client, fire-and-forget (a failed send never
  breaks the user flow; it is logged server-side only).
- `lib/email/templates.ts` — branded HTML/text templates (crimson W header).
- `actions/waitlist.ts` — sends the confirmation right after a lead is captured.
- Without `RESEND_API_KEY` set, the app runs silently without email.
