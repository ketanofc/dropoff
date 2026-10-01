import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2.5 rounded-lg text-[17px] font-semibold tracking-[-0.005em] transition-[background-color,color,transform,box-shadow] duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:-translate-y-px hover:bg-primary/90 hover:shadow-[0_6px_18px_rgba(0,0,0,0.14)] active:translate-y-0 active:shadow-[0_2px_6px_rgba(0,0,0,0.10)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:-translate-y-px hover:bg-destructive/90",
        outline:
          "border border-border bg-card text-foreground hover:-translate-y-px hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        ghost: "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
        link: "h-auto rounded-none p-0 text-foreground underline underline-offset-4 hover:underline",
      },
      size: {
        default: "h-14 px-7",
        sm: "h-12 px-6 text-[15px]",
        lg: "h-16 px-9 text-lg",
        icon: "size-12 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
    );
  },
);
Button.displayName = "Button";
