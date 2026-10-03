import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand/brand-logo";
import { SignInButton } from "@/components/auth/sign-in-button";

interface AuthCardProps {
  title: string;
  description: string;
  /** Short reassurance line under the button. */
  reassurance?: string;
  /** Optional value bullets explaining what an account unlocks. */
  benefits?: string[];
  className?: string;
}

/**
 * The single signed-out surface shared by every gated route, so /submit and
 * /profile present the same intentional entry point instead of two one-off
 * blocks that drift apart.
 */
export function AuthCard({
  title,
  description,
  reassurance = "Secure sign-in with Google. We never see your password.",
  benefits,
  className,
}: AuthCardProps) {
  return (
    <div className="site-container max-w-xl py-12">
      <div
        className={cn(
          "godly-card deck-card space-y-6 rounded-[22px] border border-[#DADDE1] bg-white p-8 text-center shadow-apple-md md:p-10",
          className
        )}
      >
        <BrandLogo
          markOnly
          markClassName="mx-auto h-9 text-[#17181B]"
          className="justify-center"
        />

        <div className="space-y-2">
          <p className="font-mono text-tiny uppercase tracking-[0.16em] text-muted-foreground">
            WeFounders
          </p>
          <h1 className="text-h2 font-bold text-foreground">{title}</h1>
          <p className="mx-auto max-w-md text-body text-muted-foreground">
            {description}
          </p>
        </div>

        {benefits && benefits.length > 0 && (
          <ul className="mx-auto flex max-w-sm flex-col items-start gap-2 text-left">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-caption text-foreground">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-center pt-1">
          <SignInButton size="lg" className="w-full max-w-xs py-3" />
        </div>

        <p className="text-tiny text-muted-foreground">{reassurance}</p>
      </div>
    </div>
  );
}