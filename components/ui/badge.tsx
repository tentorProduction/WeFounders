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
        nepal: "border-[rgba(185,138,69,0.4)] bg-[rgba(185,138,69,0.15)] text-[#B98A45] font-bold shadow-xs",
        global: "border-[#26282F] bg-[#15171C] text-[#9A958A] font-bold shadow-xs",
        // Ecosystem gateway badges
        esewa: "border-transparent bg-[#2E4A35] text-[#A8E6B5] font-semibold",
        khalti: "border-transparent bg-[#4A2E4B] text-[#E6B5E8] font-semibold",
        fonepay: "border-transparent bg-[#5A2626] text-[#FFA8A8] font-semibold",
        verified: "border-[rgba(185,138,69,0.4)] bg-[rgba(185,138,69,0.15)] text-[#B98A45] font-semibold",
        // Stage badges
        stage: "border-[#26282F] bg-[#15171C] text-[#F5F1E8] font-semibold",
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
