Product Requirements Document (PRD)
Project Name: LaunchPad Nepal (बेटा नेपाल / BetaNepal)
Document Version: 1.0.0
Target Release: Q4 2026
Document Owner: Product Team
Status: Ready for Engineering Review
________________


1. Executive Summary & Vision
1.1 Product Vision
LaunchPad Nepal is the premier pre-launch and early-stage startup discovery platform tailored specifically for Nepal’s burgeoning tech and startup ecosystem. Inspired by global platforms like BetaList and Product Hunt, LaunchPad Nepal bridges the critical gap between visionary Nepali founders (indie hackers, college hackathon winners, bootstrapped SaaS builders) and active early adopters, beta testers, talent, and angel investors.
1.2 The Problem in Nepal
1. Fragmented Discovery: Nepali founders announce projects across dispersed Facebook groups ("Developers Nepal", "IT Startups Nepal"), LinkedIn posts, and random Discord servers. Discoverability fades within hours.
2. Lack of Qualified Local Beta Testers: Founders struggle to find real users who can validate local infrastructure workflows (e.g., eSewa/Khalti checkout, NTC/Ncell OTP delivery, performance over 3G/4G networks, and Nepali/Romanized-Nepali UX).
3. Early Traction Deficit: College hackathon projects (e.g., from DSH Hacks, Hack Club, Pulchowk Campus, Kathmandu University) have immense potential but die post-competition due to zero post-launch distribution.
4. Talent & Co-Founder Isolation: Solo founders lack a dedicated local board to recruit their first 1-2 founding engineers, UI designers, or growth interns.
1.3 The Solution
A unified, high-curation platform where:
* Founders list pre-launch MVPs and beta products to collect verified waitlist signups.
* Local beta testers complete structured "Testing Quests" (bug bounties & UX reviews) in exchange for reputation badges, perks, or local micro-rewards.
* A "Collab & Co-founder Board" connects builders with team members.
* Startups receive exposure tailored to their target market: "Made for Nepal" (Domestic Fintech, Edtech, Agritech, Local SaaS) or "Built in Nepal for the World" (Global AI tools, Micro-SaaS, DevTools).
________________


2. Target Audience & User Personas
Persona 1: The College Indie Hacker / Hackathon Builder
* Name: Bikash (20, CS student in Kathmandu)
* Context: Built an AI-powered note-sharing app during a 36-hour hackathon. Has code on GitHub and deployment on Vercel.
* Pain Point: Doesn't know how to get his first 100 users or validate if anyone outside his college class will use it.
* Goal: Launch a beta page in 5 minutes, collect early waitlist emails, get feedback from senior engineers.
Persona 2: The Bootstrapped SaaS Founder
* Name: Sunita (28, SaaS Founder in Lalitpur)
* Context: Building an inventory and accounting micro-SaaS for retail stores across Nepal.
* Pain Point: Needs beta stores to test Fonepay QR integration and billing offline-sync resilience.
* Goal: Run an invite-only closed beta, screen qualified store owners, incentivize structured feedback.
Persona 3: The Tech-Curious Early Adopter / Tester
* Name: Rohit (24, Junior Developer & Tech Enthusiast)
* Context: Loves testing new apps, hunting bugs, exploring AI utilities.
* Pain Point: Gets frustrated by buggy Nepali apps that never ask for feedback before commercial launch.
* Goal: Discover cool local projects early, give feedback directly to founders, earn community recognition and tester badges.
Persona 4: The Angel Investor / Scout
* Name: Pradeep (38, Tech Executive & Angel Scout)
* Context: Looking for promising early-stage founders and grassroots innovation across Nepal.
* Goal: Monitor trending projects before they hit mainstream headlines.
________________


3. Core Value Propositions & Unique Features for Nepal
Feature
	Global BetaList
	LaunchPad Nepal
	Startup Discovery
	Global generic submissions
	Filter by Domestic (Nepal) vs Global Export
	Local Infrastructure Tags
	None
	Tags for: eSewa, Khalti, Fonepay, Sparrow SMS, NTC/Ncell Ready, Devanagari UI
	Feedback Mechanism
	Simple comment box
	Testing Quests (structured bug bounties & task-based feedback)
	Team Building
	None
	Collab & Co-founder Board (Internships, Co-founders, Beta Testers)
	Monetization & Featured Slots
	Credit card (Stripe only)
	Dual Payment: Local eSewa/Khalti QR + International Stripe/Card
	Localization & Performance
	English only, heavyweight
	Bilingual (English/Nepali UI) + Low-bandwidth / PWA optimization
	________________


4. Product Scope & Functional Requirements
4.1 Feature Breakdown (MoSCoW Framework)
MUST HAVE (P0 - MVP)
* Authentication: OAuth with Google & GitHub, Email Magic Link.
* Startup Submission Flow:
   * Multi-step wizard: Startup Name, Tagline (max 60 chars), Pitch/Description (Markdown), Website/Demo URL, Logo, Hero Screenshot Gallery (up to 5 images), Target Market (Nepal Domestic or Global/Export).
   * Ecosystem Tech Tags (eSewa, Khalti, Fonepay, Sparrow SMS, Firebase, Supabase, Next.js, Flutter, AI/ML).
   * Stage indicator: Idea/Concept, Closed Alpha, Public Beta, Recently Launched.
* Startup Directory & Feed:
   * "Trending Today", "Latest Betas", "Top of the Week".
   * Filter by Market (Domestic vs Global), Category (Fintech, Edtech, AI, E-Commerce, DevTools, Climate), and Tech Tag.
* Upvoting System:
   * 1 vote per user per startup.
   * Sybil/Bot protection: requires account verification and minimum karma to upvote.
* Startup Detail / Showcase Page:
   * Visual gallery carousel, founder information, tech stack chips.
   * Primary CTA: "Join Waitlist" (custom email capture modal) or "Visit Beta Demo".
   * Threaded comment section with verified "Founder" badge.
* Waitlist Management for Founders:
   * Built-in lead capture form storing emails directly in founder's dashboard.
   * 1-click CSV export of waitlist subscribers.
SHOULD HAVE (P1 - Fast Follow)
* Testing Quests (Structured Beta Bounties):
   * Founder can post specific quests (e.g., "Test KYC verification using Ncell 4G and submit screenshot").
   * Testers submit task completion proofs (text, screenshots, device info).
   * Founder approves/rejects submissions; approved testers earn "Pro Tester" XP and karma.
* Founder Collab & Gigs Board:
   * Founders post open opportunities: Looking for Co-founder, Founding Engineer, UI/UX Reviewer, First 10 Beta Customers.
   * Direct contact trigger (WhatsApp, Telegram, Email).
* Featured Launch Promotion (Local Monetization):
   * Founders can pay for "Featured Launch of the Day" / "Newsletter Spotlight" using eSewa or Khalti.
COULD HAVE (P2 - Future Enhancements)
* Hackathon Showcase Hub (Partner with local colleges/hackathons to import finalist demos).
* Weekly automated email digest ("5 Hottest Nepali Tech Betas this week").
* Mobile PWA with offline browsing and instant push notifications.
WON'T HAVE (Out of Scope for v1)
* In-platform tokenized crypto rewards.
* Full-scale equity crowdfunding or equity management.
* Complex project management software inside the platform.
________________


5. User Flows
Flow 1: Founder Launches a Beta
1. User clicks "Submit Startup" -> Prompts sign-in (Google/GitHub).
2. Step 1: Basic Information (Name, Tagline, Category, Target Market).
3. Step 2: Pitch & Media (Detailed story, product screenshots, YouTube demo video embed).
4. Step 3: Ecosystem Tags & Beta Setup (Choose tech tags, select waitlist mode vs external URL, optionally create a Testing Quest).
5. Step 4: Preview & Submission.
6. Auto-moderation check + Admin review queue -> Status changes to Approved & scheduled for daily launch batch (12:00 AM NPT).
Flow 2: Early Adopter Tests a Product
1. Visitor browses feed -> Discovers startup "P2P Nepal" (Plastic Recycling Tracker).
2. Clicks into detail page -> Reviews screenshots and "Testing Quest: Test QR scanner on low-end Android".
3. Clicks "Accept Quest" -> Redirected to test the app.
4. Returns to LaunchPad Nepal -> Submits feedback: Device info, 2 bug screenshots, rating (1-5 for UX, Speed, Value).
5. Founder receives notification -> Accepts submission -> Tester gains +50 Karma and "Alpha Hunter" badge.
________________


6. Success Metrics & KPIs
* Acquisition: 150+ startup submissions in first 90 days across Nepal tech colleges and indie hubs.
* Engagement: 5,000+ monthly active beta browsers; average of 25 waitlist signups per live startup.
* Quality & Validation: 500+ structured testing quest submissions completed.
* Retention: 40% of registered builders return to comment, vote, or post collab listings within 30 days.
________________


7. Risks & Mitigation Strategies
* Risk 1: Low Initial Submission Volume
   * Mitigation: Direct outreach and partnership with student clubs (Devpost, Hack Club, IT clubs at IOE Pulchowk, KU, St. Xavier's, Islington, Herald). Offer free promotional featured spots to college hackathon winners.
* Risk 2: Upvote Manipulation & Spam
   * Mitigation: Require verified accounts for voting; weight votes by account age; implement rate limiting and an admin moderation queue before listings go live.
* Risk 3: Payment Gateway Compliance in Nepal
   * Mitigation: Integrate official Khalti Merchant API and eSewa ePay SDK with server-side signature verification.