import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

/**
 * AnimatedButton - VengeanceUI
 * Spring-based interaction with sleek hover shine and press compression.
 */
export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, className = "", variant = "primary", size = "md", disabled, ...rest }, ref) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:opacity-50 disabled:pointer-events-none overflow-hidden select-none";

    const variantStyles = {
      primary:
        "bg-stone-900 text-stone-50 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white shadow-sm",
      secondary:
        "bg-amber-100/70 text-amber-950 hover:bg-amber-100 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700/80 border border-amber-200/60 dark:border-stone-700",
      outline:
        "border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100/70 dark:hover:bg-stone-800/60",
      ghost:
        "text-stone-600 hover:text-stone-900 hover:bg-stone-100/60 dark:text-stone-400 dark:hover:text-stone-100 dark:hover:bg-stone-800/50",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2 gap-2",
      lg: "text-base px-5 py-2.5 gap-2.5",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled ? 1 : 1.015 }}
        whileTap={{ scale: disabled ? 1 : 0.97 }}
        transition={{
          type: "spring",
          stiffness: 450,
          damping: 25,
          mass: 0.5,
        }}
        disabled={disabled}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...rest}
      >
        {children}
      </motion.button>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

