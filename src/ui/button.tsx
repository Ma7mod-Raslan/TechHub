import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../ui/utils";
import { buttonVariants } from "../utils/button-utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

// 👇 هنا بنستخدم النوع الصحيح بدل any
type ButtonRef = React.ElementRef<"button">;

// forwardRef بنمرر النوعين: المرجع والخصائص
export const Button = React.forwardRef<ButtonRef, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
