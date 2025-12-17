import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-400 ease-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-soft hover:shadow-float hover:scale-[1.02] active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-soft hover:shadow-float hover:scale-[1.02]",
        outline:
          "border border-input bg-background/50 hover:bg-secondary/50 hover:text-secondary-foreground backdrop-blur-sm",
        secondary:
          "bg-secondary text-secondary-foreground shadow-soft hover:shadow-float hover:scale-[1.02]",
        ghost: 
          "hover:bg-secondary/50 hover:text-secondary-foreground",
        link: 
          "text-primary underline-offset-4 hover:underline",
        // NeuraNote special variants
        hero: 
          "bg-primary text-primary-foreground shadow-glow hover:shadow-float hover:scale-[1.03] active:scale-[0.98] px-8 py-6 text-base font-medium",
        soft:
          "bg-secondary/60 text-secondary-foreground backdrop-blur-sm hover:bg-secondary/80 border border-border/50",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-xl px-4 text-xs",
        lg: "h-12 rounded-2xl px-8 text-base",
        xl: "h-14 rounded-3xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
