import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "outline"
    | "verified"
    | "unverified"
    | "disputed"
    | "tier1"
    | "tier2"
    | "tier3"
    | "tier4";
  size?: "sm" | "md";
}

/**
 * Badge - VengeanceUI
 * Styled status and category indicators tailored for claim labeling and source tiers.
 */
export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 tracking-tight font-medium",
    md: "text-xs px-2.5 py-1 tracking-normal font-medium",
  };

  const variantStyles = {
    default:
      "bg-stone-200/70 text-stone-800 dark:bg-stone-800 dark:text-stone-300 border border-stone-300/60 dark:border-stone-700",
    outline:
      "border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 bg-transparent",
    verified:
      "bg-emerald-50 text-emerald-800 border border-emerald-300/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
    unverified:
      "bg-amber-50 text-amber-800 border border-amber-300/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
    disputed:
      "bg-rose-50 text-rose-800 border border-rose-300/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60",
    tier1:
      "bg-indigo-50 text-indigo-800 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60",
    tier2:
      "bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
    tier3:
      "bg-stone-100 text-stone-700 border border-stone-300 dark:bg-stone-800/80 dark:text-stone-300 dark:border-stone-700",
    tier4:
      "bg-stone-100 text-stone-500 border border-stone-200 dark:bg-stone-900/60 dark:text-stone-400 dark:border-stone-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full transition-colors",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

