# WeFounders.dev — Backend Setup

How the Supabase database, Supabase Storage and Firebase Google sign-in fit
together, and how to provision a fresh project.

## 1. Environment

Copy `.env.example` to `.env.local` and fill it in. Next.js also loads a plain
`.env` at lower precedence.

| Variable | Notes |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Shipped to the browser. Reads only, via RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only.** Bypasses RLS. Never name it `NEXT_PUBLIC_*`. |
| `SESSION_SECRET` | Signs session cookies. Falls back to the service-role key. |
| `NEXT_PUBLIC_FIREBASE_*` | Public identifiers for the Firebase web app. |
| `NEXT_PUBLIC_SITE_URL` | Used for metadata, sitemap and payment callbacks. |

## 2. Applying the schema

`supabase/schema.sql` is the single source of truth. It creates the enums,
12 tables, indexes, counter triggers, RLS policies, the Storage buckets and the
tag taxonomy.

```bash
# A personal access token from https://supabase.com/dashboard/account/tokens
SUPABASE_ACCESS_TOKEN=sbp_... npm run db:setup
```

The script uses the Management API, so no database password or CLI login is
needed, and it prints what it created when it finishes.

You can equally paste the file into **Dashboard → SQL Editor → Run**. It
provisions a fresh project; re-running it against an existing database will
fail on `CREATE TYPE` / `CREATE TABLE`, which is intentional.

## 3. Storage

Three buckets are created, with public read where it is safe:

| Bucket | Public | Limit | Holds |
| --- | --- | --- | --- |
| `startup-media` | yes | 5 MB | logos, banners, screenshots, demo video |
| `avatars` | yes | 2 MB | profile pictures |
| `quest-proof` | **no** | 10 MB | bug-report screenshots (may contain personal data) |

Objects are addressed as `<user-id>/<startup-id>/<file>` so ownership is
obvious from the path. Uploads run through the service role on the server after
an ownership check, which is why there is no `storage.objects` INSERT policy.

## 4. Identity model

Google sign-in is handled by **Firebase**; the data layer is **Supabase**. The
two are bridged without a Supabase Auth session:

1. The browser signs in with `signInWithPopup(GoogleAuthProvider)`.
2. It POSTs the Firebase ID token to `/api/auth/session`.
3. The server verifies the token against Google's JWKS
   (`lib/auth/firebase-token.ts`) — checking `kid`, the RS256 signature, `aud`,
   `iss`, `exp` and `iat`.
4. It upserts the matching `profiles` row, keyed by a uuid derived from the
   Firebase uid, and sets a signed HttpOnly cookie.
5. Server components and actions read that cookie through
   `getViewer()` (`lib/auth/viewer.ts`).

Consequences worth knowing:

- `profiles.id` is a plain uuid and does **not** reference `auth.users`.
  Supabase Auth is not in the sign-in path.
- **All writes go through the service role** after an explicit authorization
  check in the calling action or route. The RLS policies in the schema are read
  guardrails for the anon key; there are deliberately no client write policies,
  so a leaked anon key still cannot mutate anything.
- Founder-only surfaces (the waitlist CSV export) compare
  `startups.founder_id` against the session's user id. There is no query-string
  override.

## 5. Adding a new sign-in provider

Firebase owns sign-in, so add the provider in the Firebase console and enable it
in `signInWithGoogle()`'s sibling in `lib/firebase/auth-context.tsx`. The
server-side verification in `lib/auth/firebase-token.ts` is provider-agnostic —
it validates any Firebase ID token for the configured project.
