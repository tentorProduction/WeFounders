Design Specifications & UI/UX Guidelines (DESIGN.md)
Project Name: LaunchPad Nepal (बेटा नेपाल / BetaNepal)
Document Version: 1.0.0
Design System Name: Himalaya-UI
Status: Approved for Implementation
________________


1. Design Philosophy & Aesthetic Identity
LaunchPad Nepal combines the clean, high-density discovery aesthetics of BetaList and Linear with culturally resonant Nepali accents. It is designed to feel modern, trustworthy, rapid, and delightfully organized.
1.1 Core Principles
* Clarity over Clutter: Products are the heroes. Clean white/charcoal cards, high-contrast typography, zero generic marketing noise.
* Cultural Resonance Without Stereotypes: Modern Himalayan accents—rhododendron crimson accents (#E11D48), warm mountain stone neutrals, subtle border highlights, and native Devanagari typography support.
* Mobile-First & Bandwidth Conscious: Optimized for 360px–420px mobile viewports (smartphones in Nepal). Lightweight icons, instant visual feedback, responsive bottom sheets for filters.
________________


2. Design Tokens & Color Palette
2.1 Color Palette
/* Light Theme */
--background: #FAFAFA;          /* Crisp Off-White */
--foreground: #09090B;          /* Deep Carbon Black */
--card: #FFFFFF;                /* Pure White */
--card-foreground: #09090B;
--popover: #FFFFFF;
--primary: #DC2626;             /* Crimson Red (Nepal Rhododendron Accent) */
--primary-foreground: #FFFFFF;
--secondary: #F4F4F5;           /* Soft Slate Gray */
--secondary-foreground: #18181B;
--muted: #F4F4F5;
--muted-foreground: #71717A;
--accent: #FEF2F2;              /* Rose Wash for Hover States */
--accent-foreground: #991B1B;
--border: #E4E4E7;
--ring: #DC2626;


/* Dark Theme */
--background: #0A0A0C;          /* Obsidian Deep Night */
--foreground: #EDEDED;
--card: #121215;                /* Elevated Charcoal */
--card-foreground: #EDEDED;
--primary: #EF4444;             /* Vibrant Nepal Crimson */
--primary-foreground: #FFFFFF;
--secondary: #1E1E24;
--muted: #1E1E24;
--muted-foreground: #A1A1AA;
--border: #27272A;


/* Ecosystem & Badge Colors */
--badge-nepal: #DC2626;         /* "Made for Nepal" */
--badge-global: #2563EB;        /* "Global Export" */
--badge-esewa: #60BB46;         /* eSewa Green */
--badge-khalti: #5C2D91;        /* Khalti Purple */
--badge-fonepay: #ED1C24;       /* Fonepay Red */
--badge-verified: #10B981;      /* Emerald Green */
2.2 Typography Scale
* Primary Latin Font: Geist Sans or Inter, sans-serif.
* Devanagari Font Support: Noto Sans Devanagari (system fallback).
* Code / Monospace: Geist Mono or JetBrains Mono.
Token
	Size
	Weight
	Line Height
	Usage
	text-display
	36px (2.25rem)
	800 (Bold)
	1.1
	Homepage Hero Title
	text-h1
	28px (1.75rem)
	700 (SemiBold)
	1.2
	Startup Name on Detail Page
	text-h2
	20px (1.25rem)
	600 (SemiBold)
	1.3
	Section Headers ("Today's Launches")
	text-body
	15px (0.9375rem)
	400 (Regular)
	1.5
	Startup Descriptions & Comments
	text-caption
	13px (0.8125rem)
	500 (Medium)
	1.4
	Tag Chips, Meta info, Timestamps
	text-tiny
	11px (0.6875rem)
	600 (SemiBold)
	1.2
	Badges (BETA, DOMESTIC)
	________________


3. Component Specifications
3.1 Startup Card (The Core Unit)
* Container: Rounded-xl (12px), 1px solid border (--border), subtle hover lift (translate-y-[-2px]), transition 200ms ease.
* Layout:
   * Left: Startup Logo (64x64px, rounded-lg, 1px border).
   * Center:
      * Row 1: Startup Name + Stage Badge (Public Beta) + Market Badge (🇳🇵 Nepal or 🌐 Global).
      * Row 2: Tagline (1 line truncated, secondary muted foreground).
      * Row 3: Ecosystem Tag Chips (e.g. eSewa, Next.js, Fintech).
   * Right: Interactive Upvote Pill Button.
3.2 Interactive Upvote Button
* Default State: Pill shape, border, triangle caret pointing up + vote count (e.g., ▲ 42).
* Active / Voted State: Filled background with --primary (Crimson), white text and caret, spring scale animation (scale-105 on click).
* Hover: Gentle background highlight.
3.3 Ecosystem Tag Chips
* Pill format: Height 22px, font size 12px, font-medium, padding 2px 8px.
* Special styling for verified local tags:
   * eSewa Ready: Green dot indicator + soft green border.
   * Khalti Integrated: Purple dot indicator + soft purple border.
   * Nepali Language: Subtle national flag or Devanagari icon.
________________


4. Page Layouts & Wireframe Specs
4.1 Homepage Layout (/)
+-------------------------------------------------------------------------+
| [Logo] LaunchPad Nepal    [Explore] [Collab] [Quests]    [+ Submit Beta]|
+-------------------------------------------------------------------------+
| HERO BANNER:                                                            |
| "Discover the Next Big Things Built in Nepal & for the World"           |
| [Search Startups, Stacks, or Founders...]                               |
| Filters: [All] [🇳🇵 Made for Nepal] [🌐 Global SaaS] [🔥 Trending]      |
+-------------------------------------------------------------------------+
| FEATURED SPOTLIGHT: (Promoted Startup of the Day with Rich Banner)     |
+-------------------------------------------------------------------------+
| TODAY'S LAUNCHES (Batch: Sep 22, 2026):                                 |
| +---------------------------------------------------------------------+ |
| | [Logo] SajhaPay - One-click recurring billing for Nepali freelancers| |
| |        Tags: [Fintech] [eSewa] [Khalti] [Public Beta]         [▲ 84]| |
| +---------------------------------------------------------------------+ |
| | [Logo] AgriDristi - AI pest detection for Terai paddy farmers       | |
| |        Tags: [Agritech] [Devanagari UI] [Offline First]       [▲ 67]| |
| +---------------------------------------------------------------------+ |
|                                                                         |
| YESTERDAY'S TOP PICKS:                                                  |
| ...                                                                     |
+-------------------------------------------------------------------------+
4.2 Startup Detail / Showcase Page (/startups/[slug])
* Top Bar: Breadcrumbs (Startups > Agritech > AgriDristi).
* Hero Section:
   * 96x96px high-res Logo.
   * Startup Name + Tagline + Social/Website Links.
   * Primary Action Group:
      * "Join Beta Waitlist" (High-emphasis Crimson button -> opens inline email dialog).
      * "Visit Website / Demo" (Secondary button with external arrow).
      * "Upvote (▲ 142)" (Prominent right-aligned button).
* Media Carousel: 16:9 responsive gallery of screenshots and embedded YouTube/Loom demo.
* About the Product: Rich Markdown body explaining the origin story, what problem it solves in Nepal, and what beta feedback they need.
* Testing Quest Banner (if active): Highlighted card showing: "Founder Bounty: Test app on NTC 3G and verify offline sync -> NPR 250 Khalti or 50 Karma."
* Discussion & Feedback Section: Threaded comments, founder replies highlighted with verified crimson checkmark.
4.3 Multi-Step Submission Wizard (/submit)
* Step 1: The Basics: Product Name, Slug, One-sentence Tagline, Website URL.
* Step 2: The Pitch: Detailed Markdown description, Target Market dropdown, Stage selection.
* Step 3: Media & Branding: Logo upload (square 1:1), Banner/Screenshots upload (up to 5, automatic WebP compression), Demo video URL.
* Step 4: Nepal Ecosystem Tags: Checkbox selectors for Payment Gateways (eSewa, Khalti, Fonepay), Telecom (NTC/Ncell OTP Ready), Localization (Bilingual, Devanagari Only), Core Stack.
* Step 5: Review & Submit: Live interactive card preview before finalizing.
4.4 Testing Quests / Bug Bounty Board (/quests)
* Tabular card view of all active testing challenges across Nepali startups.
* Filters: Device (Android / iOS / Web), Reward Type (Cash / Karma / Free Subscription).
* Submission drawer: File uploader for screenshots, rating sliders (UX, Speed, Value), bug description.
4.5 Collab & Co-founder Board (/collab)
* Grid of builder requests:
   * [Looking for Co-founder] "Building an AI legal assistant for Nepali courts. Looking for a full-stack engineer."
   * [Seeking Beta Users] "Looking for 10 restaurant managers in Pokhara to test digital menus."
   * Direct WhatsApp / Telegram / Email action buttons.
________________


5. Responsive Breakpoints & Mobile Optimization
* Mobile (< 640px):
   * Sticky bottom navigation bar: [Feed, Quests, Collab, Search, Profile].
   * Floating action button (FAB) for + Submit.
   * Upvote button expands to full-touch thumb-friendly hit zone (min 48x48px).
* Tablet (640px - 1024px): 2-column card grid.
* Desktop (> 1024px): 3-column layout (Left: Category navigation, Center: Launch Feed, Right: Trending Quests & Collab posts).