# Current State — WeFounders

## Search Console SEO — 2026-10-19

Scope: inspect `sc-domain:wefounders.dev`, repair confirmed technical SEO defects, preserve existing content and working changes. No ranking guarantees or synthetic keyword pages.

### Deployment and fixes

- SEO implementation `308ffb1` and state updates through `be7deb5` were pushed to `main`. Vercel production deployment `G3np5FnEGTpjv7cNDNsTMKZxxNZr` is Ready; independent October 19 live checks confirm the new metadata and sitemap. A draft PR could not be created because the GitHub connector returned integration HTTP 403; Git push succeeded.
- Preserved pending metadata/FAQ improvements. Corrected canonical/social metadata, public profile/quest visibility, malformed quest-ID handling, and JSON-LD escaping. Removed fabricated software pricing/platform claims. Internal search and incomplete profiles are excluded from indexing and the sitemap. Only crawl metadata bypasses Clerk middleware; admin/API authorization remains enforced.
- Live robots.txt and sitemap.xml return HTTP 200 without redirects using HTML crawler headers. The sitemap contains 18 canonical URLs, including four complete profiles; internal search is omitted. The database baseline is two live products and 22 public profiles, four with a bio of at least 20 characters.
- Capgen's stored description contained copied site navigation. A guarded one-row maintenance update replaced only that field with its existing founder-provided solution text. An audit entry preserves the original/replacement and reason with a null actor, without impersonating an administrator. Only description, its automatic timestamp and generated search vector changed. Live metadata, JSON-LD and visible pitch now contain the repaired description.

### Search Console evidence

- Windsor finalized July 19 through October 16: one click, 11 impressions, CTR 9.09%, average position 3.8182. Only the branded query is disclosed; previous 90 days has no rows. Aggregation/privacy limits prevent inferring zero nonbrand searches or calculating growth.
- Direct Page Indexing report, last updated October 12: three indexed pages and 39 excluded pages. Reasons: 32 discovered/currently not indexed, five noindex exclusions, and two HTTP URL redirects. HTTP-to-HTTPS redirects are expected and were left intact.
- The homepage's cached October 7 inspection detected an X-Robots-Tag noindex header. Its actual Google live test on October 18 passed: URL is available to Google / Page can be indexed. The homepage indexing request was accepted into Google's priority crawl queue. The historical noindex cause is not proven; do not describe the site as currently blocked from Google based solely on a simulated request.
- On October 19, Google accepted `https://wefounders.dev/sitemap.xml` with status Success and 18 discovered URLs. The older www sitemap's 37 URLs are a previous report snapshot, not an indexed-page count.
- Noindex validation for the five historical exclusions started October 19. Validation and indexing completion are pending Google's processing; neither is claimed complete.
- Google's Manual Actions and Security Issues reports both show No issues detected. This is not a comprehensive application security audit. The October 18 Core Web Vitals overview showed No data.

### Authentication decision

The deployed Clerk development instance redirects cookie-free HTML navigation requests to a development-browser handshake. Plain non-HTML fetches return 200, and Google's actual live homepage test passed. These observations must be distinguished.

The user-supplied Clerk dashboard was verified against the deployed frontend host. It has only Development and offers Create production instance, contradicting the earlier production-readiness claim. The user explicitly chose Keep development instance for now; the creation dialog was cancelled. No production instance, credentials, identities or profile mappings were changed.

Future cutover requires verified production setup and existing-user mappings. `ensureProfile()` resolves only `clerk_user_id`; a new Clerk ID with an existing email otherwise violates the unique profile email constraint. Preserve internal profile UUIDs, roles, suspension flags and ownership. Do not auto-link unverified emails or use administrator bootstrap as a migration.

### Verification

Lint (zero warnings), TypeScript, production build, 13 actual Next middleware matcher checks, three JSON-LD closing-script escaping checks and generated metadata/sitemap artifact checks passed for the implementation. The final October 19 `npm run lint`, `npx tsc --noEmit` and `npm run build` all passed, generating all 21 static routes and the dynamic routes. Full local page HTTP smoke checks were limited by the development authentication integration and are not claimed as passed. Independent deployed checks and Google's actual live inspection are recorded above.

## Historical project state (2026-10-04)

**Last Updated:** 2026-10-04  
**Latest Commit:** `db34bde` (feat(onboarding): make all fields compulsory with live 20-char bio counter and strict validation)
**Active Branch:** `main`  
**Latest Deployment Status:** Live at `https://wefounders.dev`

---

## 1. Quality & Verification Status

| Gate | Command | Result |
| :--- | :--- | :--- |
| **ESLint** | `npm run lint` | Passed (0 warnings, 0 errors) |
| **TypeScript** | `npx tsc --noEmit` | Passed (0 errors) |
| **Production Build** | `npm run build` | Passed (17/17 static & dynamic routes compiled) |
| **Live Runtime** | `curl -I https://wefounders.dev` | `200 OK` |

---

## 2. Infrastructure & Services

- **Database:** Neon PostgreSQL (operational, schema migrated via `db/schema.sql`).
- **Auth Provider:** Clerk (live, fallback middleware enabled).
- **Hosting:** Vercel (Edge network, auto-deploying from `origin/main`).
- **Branding & Assets:** Fully internationalized to WeFounders with custom SVG logo and Phosphor icons.
- **Environment:** Clean `.env` and `.env.local` synchronized with zero deprecated variables.

The historical production-readiness claim was superseded by the direct Clerk inspection and the user's decision to retain Development. Follow the current Authentication decision above before any future cutover. Never paste or commit credentials.
