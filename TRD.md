Technical Requirements Document (TRD)
Project Name: LaunchPad Nepal (बेटा नेपाल / BetaNepal)
Document Version: 1.0.0
Target Release: Q4 2026
Architect: Lead Systems Architect
Status: Approved for Implementation
________________


1. System Architecture Overview
LaunchPad Nepal is engineered as a modern, high-performance, full-stack web application designed for fast initial load times even on fluctuating mobile networks (3G/4G) common in Nepal.
+-------------------------------------------------------------------------+
|                              Client Tier                                |
|   Next.js 15 (App Router, Server Components, TypeScript, Tailwind CSS)   |
|            PWA Support (Offline Shell, Service Worker Caching)          |
+------------------------------------+------------------------------------+
                                     |
                          HTTPS / REST / Server Actions
                                     |
+------------------------------------+------------------------------------+
|                             Compute Tier                                |
|        Vercel Edge & Node.js Serverless Functions / Server Actions      |
|           Zod Input Validation | Rate Limiting (Upstash Redis)          |
+------------------+-----------------+-------------------+----------------+
                   |                 |                   |
                   v                 v                   v
+------------------+---+  +----------+---------+  +------+----------------+
|    Database Tier     |  |    Storage Tier    |  | Third-Party Services  |
|  Supabase PostgreSQL |  | Supabase Storage / |  | - Khalti ePay API     |
| - Row Level Security |  | Cloudflare R2      |  | - eSewa EPAY API      |
| - Full-Text Search   |  | (WebP Compressed   |  | - Resend (Emails)     |
| - Realtime Channels  |  |  Screenshots/Avatars| | - Sparrow SMS (OTP)   |
+----------------------+  +--------------------+  +-----------------------+
1.1 Tech Stack Justification
* Frontend & Framework: Next.js 15 (React 19, App Router). Provides React Server Components (RSC) for minimal client-side JavaScript, optimal SEO for startup listings, and instant server-side page rendering.
* UI & Styling: Tailwind CSS + shadcn/ui + Radix Primitives + Lucide Icons. Provides lightweight, accessible, fully themeable components.
* Database & Auth: Supabase (PostgreSQL 16). Relational data modeling, built-in Row-Level Security (RLS), real-time subscriptions for upvote counts and comments, and seamless OAuth (Google, GitHub) + magic link authentication.
* Cache & Anti-Spam Rate Limiting: Upstash Redis (@upstash/ratelimit). Serverless in-memory rate limiting to throttle upvotes, waitlist signups, and prevent vote manipulation.
* File & Media Storage: Supabase Storage with CDN caching and client-side image compression (Browser Image Compression) before upload.
* Payments (Nepal Local): Khalti Payment Gateway v2 API + eSewa EPAY v2 API with server-to-server signature validation (HMAC-SHA256).
* Transactional Communication: Resend for transactional email alerts (waitlist confirmations, launch notifications) + optional webhook to Sparrow SMS for phone verification in Nepal (+977).
________________


2. Database Schema Design (PostgreSQL / Supabase DDL)
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- Enum types
CREATE TYPE user_role AS ENUM ('user', 'founder', 'moderator', 'admin');
CREATE TYPE startup_stage AS ENUM ('concept', 'closed_alpha', 'public_beta', 'launched');
CREATE TYPE target_market AS ENUM ('nepal_domestic', 'global_export', 'hybrid');
CREATE TYPE startup_status AS ENUM ('draft', 'pending_approval', 'approved', 'rejected');
CREATE TYPE quest_status AS ENUM ('active', 'paused', 'completed');
CREATE TYPE submission_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE collab_type AS ENUM ('cofounder', 'founding_engineer', 'designer', 'beta_tester', 'intern');
CREATE TYPE payment_provider AS ENUM ('khalti', 'esewa', 'stripe');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');


-- 1. Profiles Table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    website_url TEXT,
    github_handle TEXT,
    twitter_handle TEXT,
    phone_number TEXT,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    karma_score INTEGER DEFAULT 0,
    role user_role DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- 2. Startups Table
CREATE TABLE public.startups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    founder_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    tagline VARCHAR(100) NOT NULL,
    description TEXT NOT NULL, -- Markdown
    website_url TEXT NOT NULL,
    demo_video_url TEXT,
    logo_url TEXT NOT NULL,
    banner_url TEXT,
    stage startup_stage DEFAULT 'public_beta',
    target_market target_market DEFAULT 'nepal_domestic',
    status startup_status DEFAULT 'pending_approval',
    launch_date DATE,
    upvotes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    waitlist_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    featured_until TIMESTAMPTZ,
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(name, '') || ' ' || coalesce(tagline, '') || ' ' || coalesce(description, ''))
    ) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE INDEX startups_search_idx ON public.startups USING GIN(search_vector);
CREATE INDEX startups_status_launch_idx ON public.startups(status, launch_date DESC);
CREATE INDEX startups_upvotes_idx ON public.startups(upvotes_count DESC);


-- 3. Ecosystem & Tech Tags
CREATE TABLE public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL -- 'payment', 'telecom', 'stack', 'industry'
);


CREATE TABLE public.startup_tags (
    startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (startup_id, tag_id)
);


-- 4. Startup Screenshots / Gallery
CREATE TABLE public.startup_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT DEFAULT 'image', -- 'image', 'video'
    caption TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 5. Upvotes Table
CREATE TABLE public.upvotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (startup_id, user_id)
);


-- 6. Comments & Discussions
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_founder_reply BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- 7. Waitlist Subscribers
CREATE TABLE public.waitlist_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    referral_source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (startup_id, email)
);


-- 8. Testing Quests (Bug Bounties / UX tasks)
CREATE TABLE public.testing_quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    task_instructions TEXT NOT NULL,
    target_devices TEXT, -- e.g. "Android 10+, Chrome, Ncell 4G"
    reward_description TEXT, -- e.g. "50 Karma + 1 Month Free Pro + NPR 200 Khalti"
    status quest_status DEFAULT 'active',
    max_submissions INTEGER DEFAULT 20,
    submissions_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- 9. Quest Submissions (Tester Proofs)
CREATE TABLE public.quest_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quest_id UUID NOT NULL REFERENCES public.testing_quests(id) ON DELETE CASCADE,
    tester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    feedback_text TEXT NOT NULL,
    rating_ux INTEGER CHECK (rating_ux BETWEEN 1 AND 5),
    rating_speed INTEGER CHECK (rating_speed BETWEEN 1 AND 5),
    proof_screenshots TEXT[] DEFAULT '{}',
    device_info JSONB,
    status submission_status DEFAULT 'pending',
    founder_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 10. Collab & Co-founder Opportunities
CREATE TABLE public.collab_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    role_type collab_type NOT NULL,
    description TEXT NOT NULL,
    equity_or_compensation TEXT,
    contact_channel TEXT NOT NULL, -- Email, WhatsApp link, Telegram
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 11. Payments & Promotions (eSewa / Khalti Ledger)
CREATE TABLE public.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    founder_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount_npr NUMERIC(10, 2) NOT NULL,
    provider payment_provider NOT NULL,
    transaction_id TEXT UNIQUE,
    reference_id TEXT UNIQUE NOT NULL,
    plan_tier TEXT NOT NULL, -- 'featured_day', 'newsletter_blast'
    status payment_status DEFAULT 'pending',
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
________________


3. Row-Level Security (RLS) Policies
All database tables enforce PostgreSQL Row-Level Security (RLS):
1. Startups:
   * SELECT: Allowed if status = 'approved' OR founder_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin'.
   * INSERT: Allowed for authenticated users (auth.uid() IS NOT NULL).
   * UPDATE: Allowed only if founder_id = auth.uid() (restricted from modifying status or is_featured) or admin.
2. Upvotes:
   * SELECT: Publicly viewable.
   * INSERT: Authenticated users only, enforced 1 vote per startup via primary key (startup_id, user_id).
   * DELETE: user_id = auth.uid().
3. Waitlist Entries:
   * SELECT: Only the founder of the respective startup (auth.uid() = (SELECT founder_id FROM startups WHERE id = waitlist_entries.startup_id)).
   * INSERT: Publicly callable via server action with Upstash rate-limiting.
________________


4. Local Payment Gateway Integration Architectures
4.1 Khalti v2 ePay Integration
* Initiation Endpoint: POST https://a.khalti.com/api/v2/epay/initiate/
* Verification Server Action:
   1. Founder selects promo package (e.g., NPR 1,500 for 48-hour featured banner).
   2. Next.js server initiates transaction with Khalti secret key and receives payment_url and pidx.
   3. Client redirects to Khalti.
   4. On return callback to /api/payments/khalti/callback, server calls POST https://a.khalti.com/api/v2/epay/lookup/ with pidx.
   5. Upon confirmation (status === 'Completed'), update promotions table and set startups.is_featured = TRUE.
4.2 eSewa EPAY Integration
* Initiation: Server generates HMAC-SHA256 signature using SecretKey, total_amount, transaction_uuid, and product_code.
* Callback: Webhook / Callback endpoint /api/payments/esewa/callback decodes Base64 encoded payload, verifies hash integrity, checks transaction status, and activates featured promotion.
________________


5. Anti-Abuse & Bot Prevention
1. Upvote Weighting & Throttling:
   * Upstash Redis token bucket: Max 5 upvotes per IP per minute.
   * User account must be > 24 hours old or have a linked GitHub/Google account.
2. Database Atomic Increments:
   * Upvotes and comments update counters via PostgreSQL triggers to avoid race conditions.
________________


6. Deployment, Environment & CI/CD
* Hosting: Vercel for Next.js App, Supabase Cloud (Singapore / Mumbai region for lowest latency to Nepal).
* Environment Variables:
   * NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
   * UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
   * KHALTI_PUBLIC_KEY, KHALTI_SECRET_KEY
   * ESEWA_MERCHANT_CODE, ESEWA_SECRET_KEY
   * RESEND_API_KEY