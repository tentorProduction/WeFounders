import type { Metadata } from "next";
import Link from "next/link";
import { Megaphone, Rocket, Shield, TrendingUp, Users } from "@/components/icons";

import { getViewer } from "@/lib/auth/viewer";
import { getStartupsByFounder } from "@/lib/data/profiles";
import { AccountActions } from "@/components/auth/account-actions";
import { AuthCard } from "@/components/auth/auth-card";
import { StartupLogo } from "@/components/startups/startup-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Your Profile",
  description:
    "Your WeFounders builder profile — launches, waitlist leads and promotion status.",
  robots: { index: false, follow: false },
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
    <div className="rounded-[10px] border border-[#DADDE1] bg-[#FFFFFF] p-5 space-y-1">
      <span className="text-tiny font-mono uppercase text-[#666A73]">{label}</span>
      <p className="font-mono text-h1 font-bold text-[#17181B]">{value}</p>
      <p className="text-tiny font-mono text-[#666A73]">{hint}</p>
    </div>
  );
}

/** Builder profile: real session, real launches, no placeholder analytics. */
export default async function ProfilePage() {
  const viewer = await getViewer();

  if (!viewer.authenticated || !viewer.userId) {
    return (
      <AuthCard
        title="Welcome, builder."
        description="Track launches, waitlists, feedback, and community activity."
        benefits={[
          "See your waitlist leads and export them",
          "Upvote products and join testing bounties",
          "Promote a launch when you are ready",
        ]}
      />
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
      <div className="rounded-[10px] border border-[#DADDE1] bg-[#FFFFFF] p-6 shadow-apple-md md:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            {viewer.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={viewer.avatarUrl}
                alt=""
                className="h-20 w-20 rounded-[10px] border-2 border-[#DADDE1] object-cover shadow-apple-sm"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-[10px] bg-[#FF4B3E] font-archivo text-display font-bold text-[#F2F3F5] shadow-apple-sm">
                {displayName[0]?.toUpperCase()}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-archivo text-display font-bold text-[#17181B]">
                  {displayName}
                </h1>
                <Badge
                  variant="secondary"
                  className="gap-1 border-[#DADDE1] bg-[#F2F3F5] text-tiny font-semibold"
                >
                  <Shield className="h-3 w-3 text-emerald-500" /> Google verified
                </Badge>
              </div>

              <p className="text-body text-[#666A73]">{viewer.email}</p>
              <p className="font-mono text-tiny text-[#666A73]">
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
        <h2 className="text-h2 font-archivo font-bold text-[#17181B]">
          Your submissions
        </h2>

        {startups.length === 0 ? (
          <div className="space-y-3 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <Rocket className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="text-subheading font-bold text-foreground">
              No submissions yet
            </h3>
            <p className="mx-auto max-w-sm text-body text-muted-foreground">
              Submit your beta to get your first users from our global builder
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

