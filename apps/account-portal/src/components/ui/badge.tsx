import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/utils/utils";
import { cva } from "class-variance-authority";

const badgeVariants = cva(
  "realm-sigil focus:ring-ring inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-primary/25 text-primary hover:bg-primary/30 border-transparent",
        secondary:
          "bg-secondary/40 text-secondary-foreground hover:bg-secondary/50 border-transparent",
        destructive:
          "border-destructive/40 bg-destructive/15 text-destructive hover:bg-destructive/20",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
