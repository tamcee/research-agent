import React from "react";
import { ExternalLink, ShieldCheck, ArrowLeft } from "lucide-react";
import { Citation } from "../types";
import { Badge } from "./ui/badge";
import { AnimatedButton } from "./ui/animated-button";

interface SourcesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  citations: Citation[];
}

export const SourcesDrawer: React.FC<SourcesDrawerProps> = ({
  isOpen,
  onClose,
  citations,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-stone-900 h-full shadow-2xl flex flex-col border-l border-stone-200 dark:border-stone-800">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 rounded-md text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">
              Bibliography & Sources
            </h3>
          </div>
          <Badge variant="default" size="sm">
            {citations.length} Cited
          </Badge>
        </div>

        {/* Source Tier Legend */}
        <div className="px-5 py-3 bg-stone-50 dark:bg-stone-800/30 border-b border-stone-100 dark:border-stone-800/50 text-[11px] text-stone-500 space-y-1">
          <div className="font-medium text-stone-700 dark:text-stone-300">
            Source Trust Hierarchy:
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-indigo-700 dark:text-indigo-400">● Tier 1: Academic / Gov / Journals</span>
            <span className="text-blue-700 dark:text-blue-400">● Tier 2: Major Outlets</span>
            <span className="text-stone-600 dark:text-stone-400">● Tier 3: Reputable General</span>
          </div>
        </div>

        {/* Citations List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {citations.map((citation) => (
            <div
              key={citation.index}
              className="p-4 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/20 space-y-2 hover:border-stone-300 dark:hover:border-stone-700 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 flex items-center justify-center font-mono text-[11px] font-semibold">
                    {citation.index}
                  </span>
                  <code className="text-xs font-mono font-medium text-stone-700 dark:text-stone-300">
                    {citation.domain}
                  </code>
                </div>

                <Badge
                  variant={
                    citation.tier === 1
                      ? "tier1"
                      : citation.tier === 2
                      ? "tier2"
                      : "tier3"
                  }
                  size="sm"
                >
                  Tier {citation.tier}
                </Badge>
              </div>

              <h4 className="font-serif text-sm font-semibold text-stone-900 dark:text-stone-100 leading-snug">
                {citation.title}
              </h4>

              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="w-3 h-3" /> Corroborated
                </span>
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-amber-800 dark:text-amber-400 hover:underline"
                >
                  <span>Open Source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800">
          <AnimatedButton onClick={onClose} variant="secondary" size="sm" className="w-full">
            Close Bibliography
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
};

