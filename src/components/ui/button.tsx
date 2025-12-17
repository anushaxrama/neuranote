import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-foreground text-background rounded-full hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground rounded-full hover:opacity-90",
        outline:
          "border border-foreground/20 bg-transparent rounded-full hover:bg-foreground hover:text-background",
        secondary:
          "bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80",
        ghost: 
          "hover:bg-secondary/50 hover:text-foreground rounded-full",
        link: 
          "text-foreground underline-offset-4 hover:underline",
        // Embla-style hero button
        hero: 
          "bg-foreground text-background rounded-full hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] font-medium shadow-lg shadow-foreground/10",
        soft:
          "bg-secondary/60 text-secondary-foreground backdrop-blur-sm hover:bg-secondary/80 border border-border/50 rounded-full",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg font-medium",
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
