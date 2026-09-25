import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, PartyPopper, XCircle } from "lucide-react";

import { getStartupBySlug } from "@/lib/data/startups";
import { PROMOTION_PLANS } from "@/lib/promotions/plans";
import {
  getActiveFeatured,
  getLatestPromotion,
} from "@/lib/promotions/store";
import {
  getPaymentsMode,
  isKhaltiSimulated,
  isSandboxPayments,
} from "@/lib/payments/config";
import { PromoteCheckout } from "@/components/startups/promote-checkout";
import { StartupLogo } from "@/components/startups/startup-logo";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const startup = await getStartupBySlug(slug);
  return { title: `Promote ${startup?.name ?? "your startup"}` };
}

type PaymentStatus = "success" | "failed" | "canceled" | "error";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const STATUS_BANNERS: Record<
  PaymentStatus,
  { title: string; body: string; tone: "success" | "error" | "muted" }
> = {
  success: {
    title: "Payment received — your promotion is live!",
    body: "Your startup now owns the glowing Featured Spotlight at the top of the feed until the plan expires.",
    tone: "success",
  },
  failed: {
    title: "Payment not completed",
    body: "The gateway could not confirm the transaction, so no promotion was activated and nothing was charged.",
    tone: "error",
  },
  canceled: {
    title: "Payment canceled",
    body: "You backed out of the gateway — nothing was charged.",
    tone: "muted",
  },
  error: {
    title: "We couldn't reach the payment gateway",
    body: "The initiation request failed. Please try again in a moment.",
    tone: "error",
  },
};

function paymentStatusOf(
  raw: string | string[] | undefined
): PaymentStatus | null {
  if (typeof raw !== "string") return null;
  return (["success", "failed", "canceled", "error"] as const).includes(
    raw as PaymentStatus
  )
    ? (raw as PaymentStatus)
    : null;
}

export default async function PromoteStartupPage({
  params,
  searchParams,
}: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const startup = await getStartupBySlug(slug);
  if (!startup) notFound();

  const [latest, activeFeatured] = await Promise.all([
    getLatestPromotion(startup.id),
    getActiveFeatured(),
  ]);
  const isActive = activeFeatured?.promotion.startup_id === startup.id;

  const status = paymentStatusOf(query.payment);
  const reference = typeof query.ref === "string" ? query.ref : null;
  const banner = status ? STATUS_BANNERS[status] : null;

  const untilLabel = isActive
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kathmandu",
      }).format(activeFeatured.until)
    : null;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-12 pt-6">
      {/* Startup header */}
      <div className="flex items-center gap-4">
        <StartupLogo
          name={startup.name}
          logoUrl={startup.logo_url || null}
          seed={startup.id}
          size={56}
        />
        <div className="min-w-0">
          <h1 className="text-h2 font-extrabold tracking-tight">
            Promote {startup.name}
          </h1>
          <p className="truncate text-caption text-muted-foreground">
            {startup.tagline}
          </p>
        </div>
      </div>
      <Link
        href={`/startups/${startup.slug}`}
        className="mt-2 inline-block text-caption text-primary hover:underline"
      >
        ← Back to {startup.name}&apos;s showcase
      </Link>

      {/* Active placement */}
      {isActive && untilLabel && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3">
          <PartyPopper className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <p className="text-caption">
            <strong>Currently featured</strong> in the discovery feed spotlight
            until <strong>{untilLabel}</strong> (NPT). Buying another plan
            restarts the window.
          </p>
        </div>
      )}

      {/* Payment result banner */}
      {banner && (
        <div
          className={cn(
            "mt-4 rounded-xl border px-4 py-3",
            banner.tone === "success" &&
              "border-emerald-500/40 bg-emerald-500/10",
            banner.tone === "error" && "border-red-500/40 bg-red-500/10",
            banner.tone === "muted" && "border-border bg-muted/40"
          )}
        >
          <p className="flex items-center gap-2 text-body font-semibold">
            {banner.tone === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
            ) : banner.tone === "error" ? (
              <XCircle className="h-4 w-4 text-red-600" aria-hidden />
            ) : null}
            {banner.title}
          </p>
          <p className="mt-1 text-caption text-muted-foreground">
            {banner.body}
          </p>
          {reference && (
            <p className="mt-1 font-mono text-tiny text-muted-foreground">
              ref {reference}
            </p>
          )}
        </div>
      )}

      <p className="mt-6 text-body font-semibold">
        Put {startup.name} in front of Nepal&apos;s builders
      </p>
      <p className="text-caption text-muted-foreground">
        Promotions place your beta in the glowing Featured Spotlight at the top
        of the discovery feed — the first thing every visitor sees.
      </p>

      <div className="mt-5">
        <PromoteCheckout
          startupSlug={startup.slug}
          plans={PROMOTION_PLANS}
          sandbox={isSandboxPayments()}
          khaltiSimulated={isKhaltiSimulated()}
        />
      </div>

      {/* Latest attempt context */}
      {latest && !isActive && latest.status === "failed" && (
        <p className="mt-6 text-tiny text-muted-foreground">
          A previous attempt (ref {latest.reference_id}) did not complete. You
          can safely retry below.
        </p>
      )}

      <p className="mt-8 text-tiny text-muted-foreground">
        Payments are processed in NPR by eSewa (F1Soft) and Khalti.{" "}
        {getPaymentsMode() === "sandbox"
          ? "Sandbox mode is currently enabled."
          : "Live merchant mode."}
      </p>
    </div>
  );
}
