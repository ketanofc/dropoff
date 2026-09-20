import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-blue-500 text-white px-6 py-2 rounded-lg border-b-4 border-blue-600 hover:brightness-110 hover:-translate-y-[1px] hover:border-b-6 active:brightness-90 active:translate-y-[2px] active:border-b-2",
        primary:
          "bg-blue-500 text-white px-6 py-2 rounded-lg border-b-4 border-blue-600 hover:brightness-110 hover:-translate-y-[1px] hover:border-b-6 active:brightness-90 active:translate-y-[2px] active:border-b-2",
        destructive:
          "bg-red-500 text-white px-6 py-2 rounded-lg border-b-4 border-red-600 hover:brightness-110 hover:-translate-y-[1px] hover:border-b-6 active:brightness-90 active:translate-y-[2px] active:border-b-2",
        outline:
          "bg-transparent text-blue-600 px-6 py-2 rounded-lg border-2 border-blue-600 hover:bg-blue-50 hover:brightness-105 hover:-translate-y-[1px] active:bg-blue-100 active:translate-y-[2px]",
        secondary:
          "bg-gray-100 text-gray-900 px-6 py-2 rounded-lg border-b-4 border-gray-300 hover:bg-gray-200 hover:brightness-105 hover:-translate-y-[1px] hover:border-b-6 active:bg-gray-300 active:translate-y-[2px] active:border-b-2",
        ghost:
          "bg-transparent text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 hover:-translate-y-[1px] active:bg-gray-200 active:translate-y-[2px]",
        link: "text-blue-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "text-base px-6 py-3",
        sm: "text-sm px-4 py-2",
        lg: "text-lg px-8 py-4",
        icon: "size-10",
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