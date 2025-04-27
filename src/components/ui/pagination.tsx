
import * as React from "react";
import { cn } from "@/lib/utils";

const Pagination = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-1", className)}
    {...props}
  />
));
Pagination.displayName = "Pagination";

export { Pagination };
