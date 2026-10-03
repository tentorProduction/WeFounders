# WeFounders.dev — Backend Setup

How the Neon database and Clerk sign-in fit together, and how to provision a
fresh environment. Ten minutes, once.

## 1. Environment

Copy `.env.example` to `.env.local` and fill it in. Next.js also loads a plain
`.env` at lower precedence.

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | Neon **pooled** connection string (host ends in `-pooler`). **Server only.** |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Ships to the browser. Not a secret. |
| `CLERK_SECRET_KEY` | **Server only.** Never name it `NEXT_PUBLIC_*`. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` — the route in `app/sign-in/[[...sign-in]]`. |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` — the route in `app/sign-up/[[...sign-up]]`. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/profile` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/submit` |
| `NEXT_PUBLIC_SITE_URL` | Used for metadata, sitemap and payment callbacks. |

Variables that used to exist and can be deleted: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`SESSION_SECRET`, and every `NEXT_PUBLIC_FIREBASE_*`.

## 2. Applying the schema

`db/schema.sql` is the single source of truth. It creates the enums, 12 tables,
indexes, the counter triggers and the tag taxonomy.

There is no `db:push`: paste the file into **Neon Console → your project →
SQL Editor → Run**. It provisions a fresh database; re-running it against an
existing one will fail on `CREATE TYPE` / `CREATE TABLE`, which is intentional.

Then check it:

```bash
npm run db:setup   # connectivity + tables + enums + triggers + taxonomy
```

That script never writes — it only tells you what is still missing.

## 3. Clerk

1. Clerk Dashboard → **API Keys** → copy the publishable and secret keys into
   `.env.local`.
2. Clerk Dashboard → **User & Authentication → Sign-in methods** → enable
   **Google**.
3. Clerk Dashboard → **Sessions** → add the production domain to the allowed
   origins / redirect URLs, plus `http://localhost:3000` for development.

## 4. Identity model

Clerk owns sign-in; Neon owns everything else.

1. The browser signs in at `/sign-in`; Clerk issues its own HttpOnly session
   cookie.
2. A server render or action calls `readSession()` (`lib/auth/session.ts`),
   which resolves the Clerk session and maps it to a `profiles` row.
3. The first time a Clerk user is seen, the server provisions that row — a uuid
   derived from the Clerk user id, so repeat sign-ins land on the same profile.
   Provisioning happens on read rather than through a webhook, so a dropped
   webhook delivery can never lock a founder out of their own profile.
4. `getViewer()` (`lib/auth/viewer.ts`) wraps that in the shape the pages use.

Consequences worth knowing:

- `profiles.id` is a plain uuid and does **not** reference a Clerk schema;
  `clerk_user_id` is the only link back to the auth provider.
- `role` lives in `profiles`, not in Clerk metadata. `verifyAdmin()`
  (`lib/auth/admin.ts`) reads it on every admin request, and `app/admin/layout.tsx`
  runs it for every admin page.
- **Every read and write runs server-side.** There is no client data API, so
  `DATABASE_URL` is a server secret — never expose it with a `NEXT_PUBLIC_`
  prefix or from a browser fetch.
- Founder-only surfaces (the waitlist CSV export) compare
  `startups.founder_id` against the session's user id. There is no query-string
  override.

## 5. Adding a new sign-in provider

Enable it in the Clerk dashboard under **Sign-in methods**. Nothing in this app
changes: `readSession()` reads whatever Clerk's session says, and the profile is
provisioned from the verified identity either way.

## 6. Media

Startup media are plain URLs in `startup_media.media_url` — screenshots, logos
and demo videos live wherever the founder hosts them (and whatever an admin
uploads in the future). There is no storage bucket to provision. If you later
add direct uploads, pick an object store and keep the column contract: a URL
string, public or signed.