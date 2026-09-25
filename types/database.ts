/**
 * Database types for LaunchPad Nepal.
 * Mirrors the Supabase PostgreSQL schema defined in TRD §2.
 */

/* ------------------------------------------------------------------ */
/* Enum types (TRD §2)                                                 */
/* ------------------------------------------------------------------ */

export type UserRole = "user" | "founder" | "moderator" | "admin";
export type StartupStage = "concept" | "closed_alpha" | "public_beta" | "launched";
export type TargetMarket = "nepal_domestic" | "global_export" | "hybrid";
export type StartupStatus = "draft" | "pending_approval" | "approved" | "rejected";
export type QuestStatus = "active" | "paused" | "completed";
export type SubmissionStatus = "pending" | "accepted" | "rejected";
export type CollabType =
  | "cofounder"
  | "founding_engineer"
  | "designer"
  | "beta_tester"
  | "intern";
export type PaymentProvider = "khalti" | "esewa" | "stripe";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

/* ------------------------------------------------------------------ */
/* Row types                                                           */
/* ------------------------------------------------------------------ */

export interface Profile {
  /** Plain uuid derived from the Firebase uid — Supabase Auth is not used. */
  id: string;
  firebase_uid: string;
  email: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  website_url: string | null;
  github_handle: string | null;
  twitter_handle: string | null;
  phone_number: string | null;
  is_phone_verified: boolean;
  karma_score: number;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Startup {
  id: string;
  founder_id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string; // Markdown
  website_url: string;
  demo_video_url: string | null;
  logo_url: string;
  banner_url: string | null;
  stage: StartupStage;
  target_market: TargetMarket;
  status: StartupStatus;
  launch_date: string | null;
  upvotes_count: number;
  comments_count: number;
  waitlist_count: number;
  is_featured: boolean;
  featured_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  category: "payment" | "telecom" | "stack" | "industry";
}

export interface StartupTag {
  startup_id: string;
  tag_id: string;
}

export interface StartupMedia {
  id: string;
  startup_id: string;
  media_url: string;
  media_type: "image" | "video";
  caption: string | null;
  display_order: number;
  created_at: string;
}

export interface Upvote {
  id: string;
  startup_id: string;
  user_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  startup_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  is_founder_reply: boolean;
  created_at: string;
  updated_at: string;
}

export interface WaitlistEntry {
  id: string;
  startup_id: string;
  email: string;
  phone: string | null;
  user_id: string | null;
  notes: string | null;
  referral_source: string | null;
  created_at: string;
}

export interface TestingQuest {
  id: string;
  startup_id: string;
  title: string;
  task_instructions: string;
  target_devices: string | null;
  reward_description: string | null;
  status: QuestStatus;
  max_submissions: number;
  submissions_count: number;
  created_at: string;
  updated_at: string;
}

export interface QuestSubmission {
  id: string;
  quest_id: string;
  /** Null when the report was filed before the tester signed in. */
  tester_id: string | null;
  tester_name: string;
  feedback_text: string;
  rating_ux: number; // 1–5
  rating_speed: number; // 1–5
  proof_screenshots: string[];
  device_info: Record<string, unknown> | null;
  status: SubmissionStatus;
  founder_feedback: string | null;
  created_at: string;
}

export interface CollabPost {
  id: string;
  startup_id: string | null;
  author_id: string | null;
  title: string;
  role_type: CollabType;
  description: string;
  equity_or_compensation: string | null;
  contact_channel: string; // Email, WhatsApp link, Telegram
  is_active: boolean;
  created_at: string;
}

export interface Promotion {
  id: string;
  startup_id: string;
  founder_id: string;
  amount_npr: number;
  provider: PaymentProvider;
  transaction_id: string | null;
  reference_id: string;
  // PROMPT 7 plans: "Featured Spotlight (48 Hours)" / "Weekly Power Launch (7 Days)".
  plan_tier: "featured_48h" | "weekly_7d";
  status: PaymentStatus;
  verified_at: string | null;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/* Composite / feed types                                              */
/* ------------------------------------------------------------------ */

/** Startup joined with its tags — the shape rendered by StartupCard. */
export interface StartupWithTags extends Startup {
  tags: Tag[];
}

/** Quest joined with its parent startup — the shape rendered by QuestCard. */
export interface QuestWithStartup extends TestingQuest {
  startup: Pick<Startup, "id" | "name" | "slug" | "logo_url">;
}

/** Public author fields shown on a discussion comment. */
export interface CommentAuthor {
  username: string;
  full_name: string;
  avatar_url: string | null;
  karma_score: number;
  role: UserRole;
}

/** Comment joined with its author — the shape rendered by the discussion thread. */
export interface CommentWithAuthor extends Omit<Comment, "user_id"> {
  /** The author's profile id — comments always carry a real author. */
  user_id: string;
  author: CommentAuthor;
}
