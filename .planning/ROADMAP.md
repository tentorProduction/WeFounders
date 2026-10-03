# Development Roadmap — WeFounders

This roadmap outlines active and upcoming milestones managed under the GSD protocol.

---

## Completed Milestones ✅

- [x] **M1: Neon PostgreSQL & Clerk Auth Migration**
  - Full migration from legacy databases to serverless Neon PostgreSQL.
  - Integration of Clerk authentication with database profile provisioning.
- [x] **M2: International Rebrand & UI Overhaul**
  - Full transition to WeFounders (`wefounders.dev`).
  - Implemented high-performance vector icons (`@phosphor-icons/react`) across all components.
  - Replaced legacy regional emblems with custom SVG brand marks.
- [x] **M3: Production Hardening & Repository Sanitization**
  - Purged 6,500+ lines of obsolete migrations, draft guides, and legacy cache files.
  - Added Edge middleware fallback protection to eliminate 500 downtime on Vercel.
  - Streamlined `.env` and `.env.local` to essential variables only.

---

## Active & Upcoming Milestones 🚀

## Connected platform specification (2026-10-03)

Execution order, using existing Neon / Clerk application:

1. Secure foundation: additive schema, suspension enforcement, database rate limits, private launch reads, audit and reputation ledgers. Verify lint, types, build; commit.
2. Connected workflows: follows, bookmarks, public profiles, onboarding, updates, notifications, drafts, quests and reviews, founder/tester dashboards, reports, search and activity. Verify; commit.
3. Administration and presentation: users, moderation, payments, analytics, settings, homepage, mobile navigation, SEO, curated launch import. Verify security journeys and responsive routes; commit.

Provider-dependent work must expose unavailable states. No fabricated activity, rewards, prices or identity. Preserve existing payment verification and launch components.

- [ ] **M4: Global Startup Directory & Curation**
  - Enhance discovery filters (e.g. by business model, tech stack, funding stage).
  - Add search autocompletion and rich tag filtering.
- [ ] **M5: Analytics & Growth Tooling**
  - Founder analytics dashboard for tracking waitlist signups and upvote trajectories.
  - OpenGraph dynamic cards for social sharing.
- [ ] **M6: Community Quests & Founder Bounties**
  - Live collaboration board and testing reward workflows.
