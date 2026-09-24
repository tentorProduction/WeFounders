import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-caption uppercase tracking-wider font-semibold transition-all focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow-sm",
        secondary: "border-border bg-secondary text-secondary-foreground font-medium",
        outline: "border-border text-foreground bg-transparent font-medium",
        // Market badges mapped to warm palette
        nepal: "border-transparent bg-[#D98C7B] text-white font-bold shadow-sm",
        global: "border-transparent bg-[#8C8F94] text-white font-bold shadow-sm",
        // Ecosystem gateway badges
        esewa: "border-transparent bg-[#6E8B74] text-white font-semibold",
        khalti: "border-transparent bg-[#A691A0] text-white font-semibold",
        fonepay: "border-transparent bg-[#C85A48] text-white font-semibold",
        verified: "border-[#6E8B74]/40 bg-[#6E8B74]/15 text-[#546E5A] dark:text-[#84A38A] font-semibold",
        // Stage badges
        stage: "border-[#D3C6BF]/40 bg-[#F5DCD5]/50 dark:bg-[#3A322F] text-foreground font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
