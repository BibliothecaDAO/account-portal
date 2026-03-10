import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/utils/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "realm-button focus-visible:ring-ring inline-flex items-center justify-center gap-2 rounded-[0.9rem] border [font-family:var(--font-ui)] text-sm font-medium tracking-[0.14em] whitespace-nowrap uppercase transition-all duration-200 focus-visible:ring-1 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "",
        destructive:
          "border-destructive/60 bg-destructive/85 text-destructive-foreground hover:bg-destructive",
        outline: "realm-button--ghost",
        secondary: "realm-button--subtle",
        ghost:
          "realm-button--ghost border-transparent bg-transparent shadow-none",
        link: "realm-button--link text-primary px-0 py-0 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-[0.8rem] px-3 text-[11px]",
        lg: "h-11 rounded-[1rem] px-8",
        icon: "h-10 w-10 rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
