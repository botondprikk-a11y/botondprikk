import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-primary text-white shadow hover:opacity-90",
  outline: "border border-border text-foreground hover:bg-card",
  ghost: "text-foreground hover:bg-card",
  subtle: "bg-card text-foreground hover:bg-white"
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
        variants[variant],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
