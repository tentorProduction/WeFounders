# AGENTS.md — Get Shit Done (GSD) Protocol

This repository follows the **Get Shit Done (GSD)** execution framework. All coding agents and contributors must adhere to these directives.

---

## 1. Core Operating Principles

1. **Spec-Driven Execution (Discuss → Plan → Execute → Verify → Commit)**
   - Never write sprawling or unverified code blocks.
   - Formulate atomic, step-by-step plans before modifying files.
   - Execute one atomic change at a time.
   - Verify changes with compiler, lint, and build checks before moving on.
   - Conclude each milestone with a focused, conventional Git commit.

2. **Zero Context Rot**
   - Keep context utilization low and lean.
   - Maintain the single source of truth in `.planning/` (`PROJECT.md`, `ROADMAP.md`, `STATE.md`).
   - Read only the files necessary for the current task.

3. **Production Truth (No Illusions)**
   - Never write mock/synthetic fallbacks that mask database or network connection errors.
   - Surface real errors cleanly with proper boundaries.
   - Never hardcode credentials, secrets, or personal emails into codebase or commits.

---

## 2. Architecture & Invariants

- **Framework:** Next.js 15 (App Router, React 19, Server Components).
- **Styling:** Tailwind CSS with custom design tokens defined in `tailwind.config.ts`.
- **Icons:** Use **Phosphor Icons** (`@phosphor-icons/react/dist/ssr`) exclusively. No emojis or generic icon packs in production components.
- **Database:** Neon Serverless PostgreSQL via `@neondatabase/serverless` (`lib/db/neon.ts`).
- **Authentication:** Clerk (`@clerk/nextjs`). Profiles are mapped in `lib/auth/session.ts` with Clerk user IDs.
- **Dynamic Routes:** Any route querying headers, cookies, or database at request time must declare `export const dynamic = "force-dynamic"`.
- **Branding:** "WeFounders" — Global Startup Launch & Beta Platform. No geographic or legacy constraints.

---

## 3. Mandatory Verification Gates

Before completing any task or pushing to Git, run and verify:

```bash
npm run lint         # Must pass with 0 errors / 0 warnings
npx tsc --noEmit     # Must pass with 0 type errors
npm run build        # Must produce clean static & dynamic routes
```

---

## 4. Planning & State Tracking

- Check `.planning/STATE.md` for current health, active milestone, and recent commits.
- Check `.planning/ROADMAP.md` for prioritized tasks and open goals.
- Check `.planning/PROJECT.md` for architectural design and data schemas.
