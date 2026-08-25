import * as React from "react"
import { cn } from "@/lib/utils"

const InputGroup = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("relative flex w-full items-center", className)} {...props} />
))
InputGroup.displayName = "InputGroup"

const InputGroupInput = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      "pl-8", // Make room for start icon
      className
    )}
    ref={ref}
    data-slot="input-group-control"
    {...props}
  />
))
InputGroupInput.displayName = "InputGroupInput"

const InputGroupAddon = React.forwardRef(({ className, align = "inline-start", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute flex items-center justify-center text-muted-foreground",
      align === "inline-start" ? "left-2.5" : "right-2.5",
      className
    )}
    {...props}
  />
))
InputGroupAddon.displayName = "InputGroupAddon"

export { InputGroup, InputGroupInput, InputGroupAddon }
