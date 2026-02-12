import * as React from "react";
import { cn } from "@/lib/utils";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-border bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-primary/30",
        className
      )}
      {...props}
    />
  )
);
Select.displayName = "Select";
