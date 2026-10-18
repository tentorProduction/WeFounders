# Current State — WeFounders

## Search Console review — 2026-10-18

Scope: inspect WeFounders reports, repair confirmed technical SEO defects, preserve pre-existing working changes.

1. Windsor confirmed `searchconsole` / `sc-domain:wefounders.dev`. Finalized 2026-07-19 through 2026-10-16: 1 click, 11 impressions, CTR 9.09%, average position 3.8182. Disclosed query is branded; previous 90 days has no rows. Sitemap has 37 submitted URLs, zero errors/warnings; submitted URL count does not prove indexing.
2. Correct unsafe/inaccurate JSON-LD, canonical metadata, search indexing directives, and public profile/quest visibility. Keep keyword targeting tied to real content; no ranking guarantees or thin generated pages.
3. Run lint, TypeScript, production build and focused route checks. Record local versus deployed results separately.

Status: local SEO milestone verified with lint (zero warnings), TypeScript, production build, 13 middleware scope checks, 3 structured-data escaping checks, 3 generated artifact checks, and HTTP 200/no-redirect checks for robots.txt and sitemap.xml using HTML crawler headers. Production configuration and deployment remain pending. Windsor does not expose Page Indexing exclusion reasons, URL Inspection, or Core Web Vitals in this connector.

Deployment access: GitHub's successful production check identifies `tentorproduction/wefounders`, confirmed by the user. The available Vercel CLI login cannot access that team; the browser project opens at Vercel sign-in. The user has been asked to sign in. No deployment or credential changes have been made.

### Confirmed deployed crawl problem

HTML navigation requests without cookies (including a Googlebot user-agent test) to /, /robots.txt and /startups/capgen return HTTP 307 to the Clerk development instance /v1/client/handshake. Plain non-HTML fetches return 200, so a simple health check misses this. Production must use a verified Clerk production domain and production instance keys; migrating existing Clerk identities must be planned before switching instances. No credentials were changed. Excluding robots.txt/sitemap.xml from authentication middleware fixes the crawl metadata path without relaxing admin/API authorization. Full page-redirect resolution requires provider configuration and a redeploy.

Account migration gate: `ensureProfile()` resolves only `clerk_user_id`; a new production ID with an existing email would violate the unique profile email constraint. There is no existing linking flow. Establish verified development-to-production user mappings, then update only `profiles.clerk_user_id` transactionally while preserving profile UUIDs, roles, suspension flags and ownership. Do not automatically link unverified emails or run the administrator bootstrap as a migration.

### Content baseline

Current DB: 2 approved live products; 22 public profiles, of which only 4 have a bio of at least 20 characters. Empty-profile indexing is disabled and those profiles are omitted from the sitemap while their public pages remain usable. This reduces the generated sitemap to 18 eligible URLs; the previously submitted 37 URLs are not an indexed-page count. The only disclosed Search Console query is wefounders (1 click, 7 impressions). No nonbrand keyword opportunity can be scored reliably from this small sample.

### Local changes

Preserved pending SEO metadata and FAQ improvements. Added canonical/social metadata for profiles and quests; proper invalid-quest 404 eligibility; public-only profile and quest launch queries; noindex for internal search and incomplete profiles; accurate generic WebPage markup rather than invented software prices/platforms; escaped database-backed JSON-LD on home, directory and showcase pages; clearer homepage copy targeting real startup-launch and beta-testing tasks. Production artifacts and malicious closing-script escaping checks passed. Full local HTTP smoke checks remain limited by the current authentication integration, so they are not recorded as passed.

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

Deployment gate: user confirmed the Clerk production instance/domain is ready. Verify the Vercel production environment actually uses that instance and plan existing-user linkage before changing instance keys. Never paste or commit credentials.
