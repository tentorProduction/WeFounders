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
        // Market badges mapped to Auralis Clean Paper palette
        nepal: "border-red-200 bg-red-50 text-red-800 font-bold shadow-xs",
        global: "border-blue-200 bg-blue-50 text-blue-800 font-bold shadow-xs",
        // Ecosystem gateway badges
        esewa: "border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold",
        khalti: "border-violet-200 bg-violet-50 text-violet-800 font-semibold",
        fonepay: "border-red-200 bg-red-50 text-red-800 font-semibold",
        verified: "border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold",
        // Stage badges
        stage: "border-[#E4E4E7] bg-[#FFFFFF] text-[#18181B] font-semibold",
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
