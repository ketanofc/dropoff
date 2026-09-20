import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 text-sm font-medium cursor-pointer transition-all rounded-lg [&_svg]:pointer-events-none [&_svg]:shrink-0 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-blue-500 text-white px-6 py-2 border-b-[4px] border-blue-600 hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:brightness-90 active:translate-y-[2px] active:border-b-[2px]",
        destructive:
          "bg-red-500 text-white px-6 py-2 border-b-[4px] border-red-600 hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:brightness-90 active:translate-y-[2px] active:border-b-[2px]",
        outline:
          "bg-transparent text-blue-500 px-6 py-2 border-b-[4px] border-blue-600 hover:bg-blue-50 hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:bg-blue-100 active:brightness-90 active:translate-y-[2px] active:border-b-[2px]",
        secondary:
          "bg-slate-100 text-slate-900 px-6 py-2 border-b-[4px] border-slate-300 hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:brightness-90 active:translate-y-[2px] active:border-b-[2px]",
        ghost:
          "bg-transparent text-slate-600 px-6 py-2 hover:bg-slate-100 hover:brightness-110 hover:-translate-y-[1px] active:bg-slate-200 active:brightness-90 active:translate-y-[2px]",
        link: "text-blue-500 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 py-2 text-base",
        sm: "h-10 px-4 text-sm",
        lg: "h-14 px-8 text-lg",
        icon: "size-12",
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