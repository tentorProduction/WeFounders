"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatPlanPrice } from "@/lib/promotions/plans";
import type { PromotionPlan } from "@/lib/promotions/plans";
import { Button } from "@/components/ui/button";

export interface PromoteCheckoutProps {
  startupSlug: string;
  plans: PromotionPlan[];
  /** True when PAYMENTS_MODE != live — shows the no-real-money notice. */
  sandbox: boolean;
  /** True when Khalti will resolve through the local simulated gateway. */
  khaltiSimulated: boolean;
}

type Provider = "esewa" | "khalti";

const GATEWAYS: Array<{
  key: Provider;
  label: string;
  dotClass: string;
  note: string;
}> = [
  {
    key: "esewa",
    label: "eSewa EPAY",
    dotClass: "bg-foreground",
    note: "Nepal's digital wallet, by F1Soft",
  },
  {
    key: "khalti",
    label: "Khalti Wallet",
    dotClass: "bg-foreground/60",
    note: "Pay from your Khalti balance or connected bank",
  },
];

/**
 * Promotion checkout with Black & White monochrome style.
 */
export function PromoteCheckout({
  startupSlug,
  plans,
  sandbox,
  khaltiSimulated,
}: PromoteCheckoutProps) {
  const [tier, setTier] = useState(plans[0]?.tier ?? "featured_48h");
  const [provider, setProvider] = useState<Provider>("esewa");

  const selectedPlan = plans.find((plan) => plan.tier === tier) ?? plans[0];

  if (!selectedPlan) return null;

  return (
    <form
      method="post"
      action={`/api/payments/${provider}`}
      className="space-y-6"
    >
      <input type="hidden" name="startup_slug" value={startupSlug} />
      <input type="hidden" name="plan_tier" value={selectedPlan.tier} />

      {/* Plan selection */}
      <fieldset className="space-y-3">
        <legend className="text-caption font-semibold uppercase tracking-wider text-muted-foreground font-mono">
          1 · Choose your plan
        </legend>
        {plans.map((plan) => {
          const active = plan.tier === selectedPlan.tier;
          return (
            <button
              key={plan.tier}
              type="button"
              aria-pressed={active}
              onClick={() => setTier(plan.tier)}
              className={cn(
                "w-full rounded-xl border p-4 text-left transition-all",
                active
                  ? "border-foreground bg-secondary ring-2 ring-foreground/20"
                  : "border-border bg-card hover:border-foreground/40"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-1.5 text-body font-semibold">
                    {active && (
                      <Sparkles
                        className="h-4 w-4 text-foreground"
                        aria-hidden
                      />
                    )}
                    {plan.label}
                    <span className="text-caption font-normal text-muted-foreground">
                      ({plan.durationHours >= 24
                        ? `${plan.durationHours / 24} days`
                        : `${plan.durationHours} hours`}
                      )
                    </span>
                  </p>
                  <p className="mt-0.5 text-caption text-muted-foreground">
                    {plan.blurb}
                  </p>
                </div>
                <p className="shrink-0 text-body font-mono font-extrabold text-foreground">
                  {formatPlanPrice(plan)}
                </p>
              </div>
              {active && (
                <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
                  {plan.perks.map((perk) => (
                    <li
                      key={perk}
                      className="flex items-start gap-2 text-caption text-foreground/90"
                    >
                      <Check
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground"
                        aria-hidden
                      />
                      {perk}
                    </li>
                  ))}
                </ul>
              )}
            </button>
          );
        })}
      </fieldset>

      {/* Gateway toggle */}
      <fieldset className="space-y-3">
        <legend className="text-caption font-semibold uppercase tracking-wider text-muted-foreground font-mono">
          2 · Pay with
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {GATEWAYS.map((gateway) => {
            const active = provider === gateway.key;
            return (
              <button
                key={gateway.key}
                type="button"
                aria-pressed={active}
                onClick={() => setProvider(gateway.key)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all",
                  active
                    ? "border-foreground bg-secondary ring-2 ring-foreground/20"
                    : "border-border bg-card hover:border-foreground/40"
                )}
              >
                <span
                  aria-hidden
                  className={cn("h-4 w-4 shrink-0 rounded-full border border-border", gateway.dotClass)}
                />
                <span>
                  <span className="block text-body font-semibold">
                    {gateway.label}
                  </span>
                  <span className="block text-tiny text-muted-foreground">
                    {gateway.note}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        {provider === "khalti" && khaltiSimulated && (
          <p className="text-tiny text-muted-foreground font-mono">
            No Khalti test key is configured — checkout will use the local
            simulated gateway.
          </p>
        )}
      </fieldset>

      {/* Sandbox notice */}
      {sandbox && (
        <p className="rounded-lg border border-border bg-secondary px-3 py-2 text-caption font-mono">
          <strong>Sandbox mode</strong> — eSewa runs on public EPAYTEST and Khalti on test keys. No real money moves.
        </p>
      )}

      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <div>
          <p className="text-caption text-muted-foreground font-mono">Total due now</p>
          <p className="text-h2 font-mono font-extrabold text-foreground">
            {formatPlanPrice(selectedPlan)}
          </p>
        </div>
        <Button type="submit" size="lg" className="min-w-44 bg-foreground text-background hover:bg-foreground/90 font-medium">
          Pay with {provider === "esewa" ? "eSewa" : "Khalti"}
        </Button>
      </div>
    </form>
  );
}
