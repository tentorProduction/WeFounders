import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { getStartupById } from "@/lib/data/startups";
import { formatPlanPrice, getPlan } from "@/lib/promotions/plans";
import { getPromotionByReference } from "@/lib/promotions/store";
import { isSandboxPayments } from "@/lib/payments/config";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Payment Gateway Sandbox",
  description: "Test eSewa and Khalti payment checkout flows for WeFounders promotions.",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Simulated payment gateway (sandbox only). Used when sandbox mode is on and
 * no real gateway credentials exist (currently the Khalti-without-key case),
 * so the full initiate → pay → callback → activation flow can be exercised
 * offline. Resolves the payment by redirecting into the real callback route
 * with a `sim_` pidx, which the callback accepts only in simulated mode.
 */
export default async function SandboxCheckoutPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const ref = typeof params.ref === "string" ? params.ref : "";

  const promotion = ref ? await getPromotionByReference(ref) : null;
  if (!promotion) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-body text-muted-foreground">
          This sandbox checkout link is invalid or expired.
        </p>
        <Button asChild className="mt-4">
          <Link href="/promote">Back to promotion plans</Link>
        </Button>
      </div>
    );
  }

  const [startup, plan] = await Promise.all([
    getStartupById(promotion.startup_id),
    Promise.resolve(getPlan(promotion.plan_tier)),
  ]);
  const provider = promotion.provider;
  const brandBg = provider === "khalti" ? "#5C2D91" : "#60BB46";

  if (promotion.status === "completed") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-body">
          This payment was already completed — the promotion is live.
        </p>
        <Button asChild className="mt-4">
          <Link href={`/startups/${startup?.slug ?? ""}/promote?payment=success`}>
            View promotion status
          </Link>
        </Button>
      </div>
    );
  }

  const pidx = `sim_${Date.now().toString(36)}`;
  const callback = (status: "success" | "canceled") =>
    `/api/payments/khalti/callback?pidx=${pidx}&purchase_order_id=${encodeURIComponent(
      promotion.reference_id
    )}&status=${status}`;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-10">
      <div
        className="rounded-xl p-5 text-white shadow-lg"
        style={{ background: brandBg }}
      >
        <p className="text-tiny font-semibold uppercase tracking-widest opacity-80">
          {provider === "khalti" ? "Khalti Wallet" : "eSewa"} · Sandbox
        </p>
        <p className="mt-3 text-caption opacity-90">
          Paying for {startup?.name ?? "your startup"}
        </p>
        <p className="mt-1 text-display font-extrabold tracking-tight">
          {plan ? formatPlanPrice(plan) : `NPR ${promotion.amount_npr}`}
        </p>
        {plan && (
          <p className="text-caption opacity-90">{plan.label}</p>
        )}
      </div>

      <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
        <p className="flex items-start gap-2 text-caption text-foreground">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
          <span>
            <strong>Simulated gateway</strong> — sandbox mode is on and no{" "}
            {provider === "khalti" ? "KHALTI_SECRET_KEY" : "gateway credentials"} are
            configured, so this checkout is resolved locally. No real transaction
            takes place. Add test keys from{" "}
            {provider === "khalti" ? "test-admin.khalti.com" : "merchant.esewa.com.np"}{" "}
            to use the provider&apos;s real sandbox instead.
          </span>
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <p className="text-caption text-muted-foreground">
          Reference
        </p>
        <p className="font-mono text-tiny text-foreground">{promotion.reference_id}</p>
        {isSandboxPayments() && (
          <p className="mt-3 text-tiny text-muted-foreground">
            Sandbox mode is on (PAYMENTS_MODE != live) — providers run on test
            credentials and no real money can move.
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button asChild className="flex-1" style={{ background: brandBg }}>
          <Link href={callback("success")}>Pay now (sandbox)</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href={callback("canceled")}>Cancel</Link>
        </Button>
      </div>
    </div>
  );
}
