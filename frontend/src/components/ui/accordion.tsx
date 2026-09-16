import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionItemProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  badge?: React.ReactNode;
}

/**
 * AccordionItem - VengeanceUI
 * Smooth expanding container with chevron rotation.
 */
export function AccordionItem({
  title,
  subtitle,
  children,
  defaultOpen = false,
  className = "",
  badge,
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "rounded-lg border border-stone-200/80 dark:border-stone-800/80 bg-white/50 dark:bg-stone-900/30 overflow-hidden transition-colors",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-left flex items-center justify-between gap-3 select-none hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate">
              {title}
            </span>
            {subtitle && (
              <span className="text-xs text-stone-500 dark:text-stone-400 truncate">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {badge}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-stone-400"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="px-4 pb-4 pt-1 text-xs text-stone-600 dark:text-stone-300 border-t border-stone-100 dark:border-stone-800/50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
