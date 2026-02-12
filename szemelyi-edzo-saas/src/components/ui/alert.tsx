import * as React from "react";
import { cn } from "@/lib/utils";

export const Alert = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground",
      className
    )}
    {...props}
  />
);
