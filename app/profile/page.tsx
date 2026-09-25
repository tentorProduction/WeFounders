"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LogOut,
  Heart,
  Rocket,
  Shield,
  CheckCircle,
  Swords,
  Plus,
} from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STARTUP_FIXTURES } from "@/lib/fixtures/startups";
import { StartupCard } from "@/components/startups/startup-card";
import { useOptimisticUpvotes } from "@/lib/hooks/use-optimistic-upvotes";
import type { StartupWithTags } from "@/types/database";

export default function ProfilePage() {
  const { user, loading, authError, signInWithGoogle, signInDemoUser, signOutUser, clearAuthError } = useAuth();
  const [activeTab, setActiveTab] = useState<"analytics" | "upvoted" | "submissions" | "bounties" | "settings">("analytics");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { getUpvote, toggleUpvote } = useOptimisticUpvotes();

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      clearAuthError();
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="site-container py-12 flex flex-col items-center justify-center space-y-4 max-w-4xl">
        <div className="h-16 w-16 animate-pulse rounded-full bg-secondary" />
        <div className="h-6 w-48 animate-pulse rounded-lg bg-secondary" />
        <div className="h-4 w-64 animate-pulse rounded-lg bg-secondary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="site-container py-12 max-w-xl text-center space-y-6">
        <div className="rounded-lg border border-border bg-card p-8 md:p-10 shadow-xs space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-[#B98A45] text-[#15171C] font-mono text-display font-bold shadow-xs">
            W
          </div>

          <div className="space-y-2">
            <Badge variant="outline" className="border-[#B98A45]/40 text-[#FFE8B8] font-mono font-bold text-caption px-3 py-1 rounded-full">
              Founder Analytics &amp; Builder Profile
            </Badge>
            <h1 className="text-display font-bold text-foreground">
              Sign In to WeFounders
            </h1>
            <p className="text-body text-muted-foreground">
              Track launch analytics, upvote startups, collect waitlist leads, and earn testing bounties.
            </p>
          </div>

          {authError && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-caption text-destructive text-left flex flex-col gap-2">
              <span>⚠️ {authError}</span>
              <button
                onClick={() => signInDemoUser()}
                className="text-tiny font-bold underline text-foreground text-left"
              >
                Or continue using Demo Founder Account →
              </button>
            </div>
          )}

          <div className="pt-2 flex flex-col items-center gap-3">
            <Button
              size="lg"
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="w-full max-w-xs gap-3 bg-[#B98A45] text-[#15171C] font-bold py-6 text-body rounded-full shadow-xs hover:bg-[#B98A45]/90"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.545,6.477,2.545,12s4.476,10,10,10c5.768,0,9.756-4.056,9.756-9.924c0-0.697-0.075-1.372-0.198-2.037L12.545,10.239z" />
              </svg>
              {isSigningIn ? "Signing in..." : "Continue with Google"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => signInDemoUser()}
              className="w-full max-w-xs border-[#322A1F] text-muted-foreground hover:text-foreground font-mono rounded-full"
            >
              Use Demo Founder Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Logged-in user view
  const upvotedStartups = STARTUP_FIXTURES.slice(0, 3);

  return (
    <div className="site-container py-8 max-w-5xl space-y-8">
      {/* Profile Header */}
      <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-apple-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt={user.displayName || "User"}
                className="h-20 w-20 rounded-2xl border-2 border-border object-cover shadow-apple-sm"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-foreground text-background font-bold text-display shadow-apple-sm">
                {(user.displayName || user.email || "U")[0].toUpperCase()}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-display font-bold text-foreground">
                  {user.displayName || "WeFounder Builder"}
                </h1>
                <Badge variant="secondary" className="text-tiny font-semibold gap-1">
                  <Shield className="h-3 w-3 text-emerald-500" /> Verified
                </Badge>
              </div>

              <p className="text-body text-muted-foreground">{user.email}</p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-tiny text-muted-foreground font-mono">
                <span>UID: {user.uid.slice(0, 8)}...</span>
                <span>•</span>
                <span>Karma Points: <strong className="text-foreground">120 pts</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/submit">
                <Plus className="h-4 w-4 mr-1.5" /> Submit Beta
              </Link>
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => signOutUser()}
              className="gap-1.5"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-[#322A1F] flex gap-4 overflow-x-auto font-mono text-caption">
        <button
          onClick={() => setActiveTab("analytics")}
          className={`pb-3 font-semibold flex items-center gap-2 border-b-2 transition-all uppercase tracking-wider ${
            activeTab === "analytics"
              ? "border-[#B98A45] text-[#FFE8B8] font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          📊 Founder Analytics
        </button>

        <button
          onClick={() => setActiveTab("upvoted")}
          className={`pb-3 font-semibold flex items-center gap-2 border-b-2 transition-all uppercase tracking-wider ${
            activeTab === "upvoted"
              ? "border-[#B98A45] text-[#FFE8B8] font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Heart className="h-4 w-4" /> Upvoted ({upvotedStartups.length})
        </button>

        <button
          onClick={() => setActiveTab("submissions")}
          className={`pb-3 font-semibold flex items-center gap-2 border-b-2 transition-all uppercase tracking-wider ${
            activeTab === "submissions"
              ? "border-[#B98A45] text-[#FFE8B8] font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Rocket className="h-4 w-4" /> Submissions
        </button>

        <button
          onClick={() => setActiveTab("bounties")}
          className={`pb-3 font-semibold flex items-center gap-2 border-b-2 transition-all uppercase tracking-wider ${
            activeTab === "bounties"
              ? "border-[#B98A45] text-[#FFE8B8] font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Swords className="h-4 w-4" /> Quests &amp; Bounties
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`pb-3 font-semibold flex items-center gap-2 border-b-2 transition-all uppercase tracking-wider ${
            activeTab === "settings"
              ? "border-[#B98A45] text-[#FFE8B8] font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Account Settings
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-h2 font-bold text-foreground">Launch Performance Analytics</h2>
            <Badge variant="outline" className="font-mono text-tiny border-[#B98A45]/40 text-[#FFE8B8]">
              Live Feed Metrics
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-lg border border-[#322A1F] bg-card p-5 space-y-1">
              <span className="text-tiny font-mono text-muted-foreground uppercase">Launch Views</span>
              <p className="text-h1 font-bold text-foreground font-mono">1,480</p>
              <p className="text-tiny text-emerald-500 font-mono">+18% this batch</p>
            </div>

            <div className="rounded-lg border border-[#322A1F] bg-card p-5 space-y-1">
              <span className="text-tiny font-mono text-muted-foreground uppercase">Total Upvotes</span>
              <p className="text-h1 font-bold text-[#B98A45] font-mono">184</p>
              <p className="text-tiny text-muted-foreground font-mono">Verified platform votes</p>
            </div>

            <div className="rounded-lg border border-[#322A1F] bg-card p-5 space-y-1">
              <span className="text-tiny font-mono text-muted-foreground uppercase">Waitlist Leads</span>
              <p className="text-h1 font-bold text-foreground font-mono">320</p>
              <p className="text-tiny text-emerald-500 font-mono">Double opt-in leads</p>
            </div>

            <div className="rounded-lg border border-[#322A1F] bg-card p-5 space-y-1">
              <span className="text-tiny font-mono text-muted-foreground uppercase">Waitlist Conv. Rate</span>
              <p className="text-h1 font-bold text-[#FFE8B8] font-mono">21.6%</p>
              <p className="text-tiny text-muted-foreground font-mono">Click-to-lead conversion</p>
            </div>
          </div>
        </div>
      )}
      {activeTab === "upvoted" && (
        <div className="space-y-4">
          <p className="text-caption text-muted-foreground">
            Startups you have upvoted and saved for updates.
          </p>
          <div className="space-y-3">
            {upvotedStartups.map((startup: StartupWithTags, index: number) => (
              <StartupCard
                key={startup.id}
                startup={startup}
                rank={index + 1}
                upvote={{
                  ...getUpvote(startup.id, startup.upvotes_count),
                  onToggle: () => toggleUpvote(startup.id),
                }}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === "submissions" && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center space-y-3">
          <Rocket className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="text-subheading font-bold text-foreground">No Submissions Yet</h3>
          <p className="text-body text-muted-foreground max-w-sm mx-auto">
            You haven&apos;t submitted any beta products yet. Launch your startup on WeFounder.dev today!
          </p>
          <Button asChild className="mt-2">
            <Link href="/submit">Submit Your Beta Product</Link>
          </Button>
        </div>
      )}

      {activeTab === "bounties" && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-apple-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-subheading font-bold text-foreground">Testing Quests &amp; Bounties</h3>
              <p className="text-caption text-muted-foreground">Track testing reports and NPR rewards</p>
            </div>
            <Badge variant="outline" className="font-mono text-tiny">
              Karma Rank: Builder Tier 1
            </Badge>
          </div>

          <div className="rounded-xl border border-border bg-background p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-body font-semibold text-foreground">SajhaPay Khalti QR Tester</p>
                <p className="text-caption text-muted-foreground">Submitted 2 days ago • Approved</p>
              </div>
            </div>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-caption">
              + NPR 500
            </span>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-6 shadow-apple-sm">
          <h3 className="text-subheading font-bold text-foreground">Account Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-caption">
            <div className="p-4 rounded-xl border border-border bg-background space-y-1">
              <span className="text-muted-foreground text-tiny">Full Name</span>
              <p className="font-semibold text-foreground text-body">{user.displayName || "Not set"}</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-background space-y-1">
              <span className="text-muted-foreground text-tiny">Email Address</span>
              <p className="font-semibold text-foreground text-body">{user.email}</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-background space-y-1">
              <span className="text-muted-foreground text-tiny">Authentication Provider</span>
              <p className="font-semibold text-foreground text-body">Google OAuth via Firebase</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-background space-y-1">
              <span className="text-muted-foreground text-tiny">Firebase UID</span>
              <p className="font-mono text-foreground text-tiny truncate">{user.uid}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
