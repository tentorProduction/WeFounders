import type { Metadata } from "next";
import Link from "next/link";
import { Megaphone, Rocket, Shield, TrendingUp, Users } from "lucide-react";

import { getViewer } from "@/lib/auth/viewer";
import { getStartupsByFounder } from "@/lib/data/profiles";
import { AccountActions } from "@/components/auth/account-actions";
import { SignInButton } from "@/components/auth/sign-in-button";
import { StartupLogo } from "@/components/startups/startup-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Your Profile",
  description:
    "Your WeFounders builder profile — launches, waitlist leads and promotion status.",
};

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_approval: "In review",
  approved: "Live",
  rejected: "Not approved",
};

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint: string;
}) {
  return (
    <div className="rounded-[10px] border border-[#E4E4E7] bg-[#FFFFFF] p-5 space-y-1">
      <span className="text-tiny font-mono uppercase text-[#71717A]">{label}</span>
      <p className="font-mono text-h1 font-bold text-[#18181B]">{value}</p>
      <p className="text-tiny font-mono text-[#71717A]">{hint}</p>
    </div>
  );
}

/** Builder profile: real session, real launches, no placeholder analytics. */
export default async function ProfilePage() {
  const viewer = await getViewer();

  if (!viewer.authenticated || !viewer.userId) {
    return (
      <div className="site-container max-w-xl space-y-6 py-12 text-center">
        <div className="space-y-6 rounded-[10px] border border-[#E4E4E7] bg-[#FFFFFF] p-8 shadow-xs md:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[10px] bg-[#DC2626] font-archivo text-display font-bold text-[#FAFAFA] shadow-xs">
            W
          </div>

          <div className="space-y-2">
            <Badge
              variant="outline"
              className="rounded-full border-[rgba(220,38,38,0.18)] bg-[#FAFAFA] px-3 py-1 font-mono text-caption font-bold text-[#DC2626]"
            >
              Builder Profile
            </Badge>
            <h1 className="font-archivo text-display font-bold text-[#18181B]">
              Sign in to WeFounders
            </h1>
            <p className="text-body text-[#71717A]">
              Track your launches, export waitlist leads, upvote products and earn
              testing bounties.
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <SignInButton size="lg" className="w-full max-w-xs py-6 text-body" />
          </div>
        </div>
      </div>
    );
  }

  const startups = await getStartupsByFounder(viewer.userId);
  const displayName = viewer.fullName || viewer.email?.split("@")[0] || "Builder";
  const totalUpvotes = startups.reduce((sum, s) => sum + s.upvotes_count, 0);
  const totalWaitlist = startups.reduce((sum, s) => sum + s.waitlist_count, 0);
  const liveCount = startups.filter((s) => s.status === "approved").length;

  return (
    <div className="site-container max-w-5xl space-y-8 py-8">
      {/* Profile header */}
      <div className="rounded-[10px] border border-[#E4E4E7] bg-[#FFFFFF] p-6 shadow-apple-md md:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            {viewer.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={viewer.avatarUrl}
                alt=""
                className="h-20 w-20 rounded-[10px] border-2 border-[#E4E4E7] object-cover shadow-apple-sm"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-[10px] bg-[#DC2626] font-archivo text-display font-bold text-[#FAFAFA] shadow-apple-sm">
                {displayName[0]?.toUpperCase()}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-archivo text-display font-bold text-[#18181B]">
                  {displayName}
                </h1>
                <Badge
                  variant="secondary"
                  className="gap-1 border-[#E4E4E7] bg-[#FAFAFA] text-tiny font-semibold"
                >
                  <Shield className="h-3 w-3 text-emerald-500" /> Google verified
                </Badge>
              </div>

              <p className="text-body text-[#71717A]">{viewer.email}</p>
              <p className="font-mono text-tiny text-[#71717A]">
                {liveCount} live {liveCount === 1 ? "launch" : "launches"}
              </p>
            </div>
          </div>

          <AccountActions />
        </div>
      </div>

      {/* Real engagement totals, summed from this founder's launches */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Upvotes"
          value={totalUpvotes}
          hint="Across your launches"
        />
        <StatCard
          label="Waitlist leads"
          value={totalWaitlist}
          hint="Opt-in beta signups"
        />
        <StatCard
          label="Launches"
          value={startups.length}
          hint={`${liveCount} approved`}
        />
      </div>

      {/* Your launches */}
      <section className="space-y-4">
        <h2 className="text-h2 font-archivo font-bold text-[#18181B]">
          Your submissions
        </h2>

        {startups.length === 0 ? (
          <div className="space-y-3 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <Rocket className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="text-subheading font-bold text-foreground">
              No submissions yet
            </h3>
            <p className="mx-auto max-w-sm text-body text-muted-foreground">
              Submit your beta to get your first users from Nepal&apos;s builder
              community.
            </p>
            <Button asChild className="mt-2">
              <Link href="/submit">Submit your beta</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {startups.map((startup) => (
              <li
                key={startup.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4"
              >
                <StartupLogo
                  name={startup.name}
                  logoUrl={startup.logo_url || null}
                  seed={startup.slug}
                  size={48}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/startups/${startup.slug}`}
                      className="text-body font-semibold hover:underline"
                    >
                      {startup.name}
                    </Link>
                    <Badge variant="outline" className="text-tiny">
                      {STATUS_LABELS[startup.status] ?? startup.status}
                    </Badge>
                  </div>
                  <p className="truncate text-caption text-muted-foreground">
                    {startup.tagline}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-4 font-mono text-tiny text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" aria-hidden />
                      {startup.upvotes_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" aria-hidden />
                      {startup.waitlist_count}
                    </span>
                  </div>
                </div>

                <Button asChild variant="outline" size="sm" className="rounded-[10px]">
                  <Link href={`/startups/${startup.slug}/promote`}>
                    <Megaphone className="mr-1.5 h-4 w-4" aria-hidden />
                    Promote
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
