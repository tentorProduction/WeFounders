# Project Specification — WeFounders

**Live Domain:** [https://wefounders.dev](https://wefounders.dev)  
**Repository:** [https://github.com/tentorProduction/WeFounders](https://github.com/tentorProduction/WeFounders)  
**Primary Purpose:** Global startup launchpad, discovery feed, product directory, community upvoting, and founder bounty platform.

---

## 1. System Architecture

```
                    ┌───────────────────────────┐
                    │   Vercel Edge & Server    │
                    │   (Next.js 15 App Router) │
                    └─────────────┬─────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
          ▼                       ▼                       ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Neon Postgres  │    │    Clerk Auth    │    │   Resend Email   │
│  (Serverless SQL)│    │  (Identity & SSO)│    │ (Notifications)  │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

---

## 2. Directory Structure & Key Modules

- `app/`: Next.js 15 App Router pages, layouts, and API routes.
  - `app/page.tsx`: Global discovery feed and featured spotlight.
  - `app/leaderboard/`: Ranked startups by community upvotes.
  - `app/submit/`: Multi-step startup submission and verification workflow.
  - `app/startups/[slug]/`: Deep-dive product profile, screenshots, waitlist, comments.
  - `app/admin/`: Admin moderation panel for startups, quests, and submissions.
  - `middleware.ts`: Clerk authentication gate with runtime fallback protection.
- `components/`: UI and feature components.
  - `components/icons/`: Phosphor vector icon system.
  - `components/brand/`: WeFounders SVG mark and logo typography.
  - `components/startups/`: Cards, filters, tags, waitlist modals, upvote buttons.
- `lib/`: Business logic, storage, and database drivers.
  - `lib/db/neon.ts`: Neon SQL client with pooled connection fallback.
  - `lib/auth/session.ts`: Clerk user session resolution & database profile provisioning.
  - `lib/data/`: Data access layer for startups, quests, site statistics, and media.
  - `lib/payments/`: Payment abstraction layer.
- `db/schema.sql`: Authoritative PostgreSQL schema for Neon.

---

## 3. Environment Invariants

Only the following environment variables are recognized:

- `DATABASE_URL`: Neon pooled PostgreSQL connection string.
- `DATABASE_URL_UNPOOLED`: Direct PostgreSQL connection string.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk client key.
- `CLERK_SECRET_KEY`: Clerk server secret.
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`: `/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`: `/sign-up`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`: `/`
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`: `/`
- `NEXT_PUBLIC_SITE_URL`: `https://wefounders.dev`
- `PAYMENTS_MODE`: `sandbox` | `production`
- `RESEND_API_KEY`: *(Optional)* API key for email delivery.
- `RESEND_FROM_EMAIL`: *(Optional)* Sender address.
