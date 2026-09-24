import Link from "next/link";
import { Megaphone } from "lucide-react";

import { getStartupFeed } from "@/lib/fixtures/startups";
import { StartupLogo } from "@/components/startups/startup-logo";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Promote Your Startup Spotlight",
  description:
    "Put your beta in the Featured Spotlight at the top of the WeFounders discovery feed, paid via eSewa or Khalti.",
};

/** Startup picker shown when a founder hits /promote from the banner. */
export default async function PromoteIndexPage() {
  const startups = await getStartupFeed();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-12 pt-8">
      <div className="text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Megaphone className="h-6 w-6" aria-hidden />
        </span>
        <h1 className="mt-3 text-h1 font-extrabold tracking-tight">
          Promote your startup
        </h1>
        <p className="mx-auto mt-2 max-w-md text-body text-muted-foreground">
          Own the glowing Featured Spotlight at the top of the discovery feed.
          Paid in NPR via eSewa or Khalti — pick the startup to promote:
        </p>
      </div>

      <ul className="mt-8 space-y-3">
        {startups.map((startup) => (
          <li key={startup.id}>
            <Link
              href={`/startups/${startup.slug}/promote`}
              className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
            >
              <StartupLogo
                name={startup.name}
                logoUrl={startup.logo_url || null}
                seed={startup.id}
                size={48}
              />
              <div className="min-w-0 flex-1">
                <p className="text-body font-semibold">{startup.name}</p>
                <p className="truncate text-caption text-muted-foreground">
                  {startup.tagline}
                </p>
              </div>
              <Button variant="outline" size="sm" tabIndex={-1}>
                Choose plan
              </Button>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-center text-tiny text-muted-foreground">
        Don&apos;t see your startup? <Link href="/submit" className="text-primary hover:underline">Submit your beta</Link>{" "}
        first — approved launches can be promoted instantly.
      </p>
    </div>
  );
}
