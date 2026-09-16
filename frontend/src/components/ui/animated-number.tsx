import { useEffect, useRef } from "react";
import { useMotionValue, useSpring } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  className?: string;
}

/**
 * AnimatedNumber - VengeanceUI
 * Spring-animated counter for live stats.
 */
export function AnimatedNumber({ value, className = "" }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 250,
  });

  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.round(latest).toLocaleString();
      }
    });
    return () => unsubscribe();
  }, [springValue]);

  return <span ref={ref} className={className}>{value}</span>;
}
