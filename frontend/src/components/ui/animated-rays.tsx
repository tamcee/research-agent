import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedRaysProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * AnimatedRays - VengeanceUI
 * A subtle ambient background with rotating soft radiant beams.
 * Creates an atmospheric, quiet editorial aesthetic.
 */
export function AnimatedRays({ className = "", children }: AnimatedRaysProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn("relative w-full h-full", className)}>{children}</div>;
  }

  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[450px] opacity-30 dark:opacity-20 blur-[100px] rounded-full bg-gradient-to-b from-amber-200/50 via-amber-100/20 to-transparent dark:from-amber-500/10 dark:via-blue-900/10 dark:to-transparent"
        aria-hidden="true"
      />
      {/* Rotating ray beams */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] opacity-25 dark:opacity-15 animate-spin-slow"
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, rgba(217, 119, 6, 0.08) 0deg, transparent 35deg, rgba(217, 119, 6, 0.05) 90deg, transparent 140deg, rgba(99, 102, 241, 0.05) 190deg, transparent 240deg, rgba(217, 119, 6, 0.07) 300deg, transparent 360deg)",
          filter: "blur(40px)",
        }}
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
