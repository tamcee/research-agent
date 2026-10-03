import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, History, X } from "lucide-react";
import { AnimatedButton } from "./ui/animated-button";

interface ResearchInputProps {
  onSubmit: (topic: string) => void;
  onSelectSample: (topic: string) => void;
  isLoading: boolean;
}

const DEFAULT_RECENT = [
  "Future of solid-state batteries in EVs",
  "Comparative safety of nuclear vs solar power",
  "Clinical evidence on intermittent fasting & longevity",
];

const SUGGESTIONS = [
  "Are electric vehicles better for the climate than gas cars?",
  "Is nuclear power necessary to reach net-zero emissions?",
  "Does intermittent fasting produce clinically meaningful longevity benefits?",
];

const RECENT_SEARCHES_KEY = "brief_recent_searches";

export const ResearchInput: React.FC<ResearchInputProps> = ({
  onSubmit,
  onSelectSample,
  isLoading,
}) => {
  const [topic, setTopic] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentSearches(parsed);
          return;
        }
      }
      setRecentSearches(DEFAULT_RECENT);
    } catch {
      setRecentSearches(DEFAULT_RECENT);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const saveRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const updated = [
      trimmed,
      ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase()),
    ].slice(0, 8);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save recent search:", e);
    }
  };

  const removeRecentSearch = (e: React.MouseEvent, itemToRemove: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== itemToRemove);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const clearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectRecent = (search: string) => {
    setTopic(search);
    setIsDropdownOpen(false);
    saveRecentSearch(search);
    onSubmit(search);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isLoading) {
      saveRecentSearch(topic.trim());
      setIsDropdownOpen(false);
      onSubmit(topic.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-12 sm:py-16 text-center animate-fade-in">
      {/* Editorial Title */}
      <div className="mb-6 space-y-3">
        <h1 className="font-serif text-3xl sm:text-5xl font-normal text-stone-900 dark:text-stone-50 tracking-tight leading-[1.15]">
          A quiet digital essay for <br />
          <span className="italic text-stone-700 dark:text-stone-300">
            any complex question.
          </span>
        </h1>
        <p className="text-sm sm:text-base text-stone-500 dark:text-stone-400 max-w-lg mx-auto font-sans leading-relaxed">
          Brief conducts autonomous cross-source research: plans sub-questions, vets
          credible domains, corroborates claims in a local vector DB, and synthesizes a
          cited report.
        </p>
      </div>

      {/* Input Form with Recent Searches Dropdown */}
      <div ref={containerRef} className="relative mt-8 max-w-xl mx-auto text-left">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-center rounded-2xl bg-white dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all focus-within:border-stone-400 dark:focus-within:border-stone-600 focus-within:ring-4 focus-within:ring-amber-500/10 p-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onFocus={() => setIsDropdownOpen(true)}
              onClick={() => setIsDropdownOpen(true)}
              placeholder="Ask a question requiring rigorous investigation..."
              disabled={isLoading}
              className="w-full px-3 py-2 text-sm sm:text-base bg-transparent border-none text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none"
            />
            <AnimatedButton
              type="submit"
              disabled={!topic.trim() || isLoading}
              size="sm"
              className="shrink-0 rounded-xl"
            >
              <span>Research</span>
              <ArrowRight className="w-4 h-4" />
            </AnimatedButton>
          </div>
        </form>

        {/* Recent Searches Dropdown */}
        {isDropdownOpen && recentSearches.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl z-30 overflow-hidden divide-y divide-stone-100 dark:divide-stone-800/60 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="px-4 py-2 text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider flex items-center justify-between">
              <span>Recent Searches</span>
              <button
                type="button"
                onClick={clearAllRecent}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 normal-case font-normal text-xs"
              >
                Clear all
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {recentSearches.map((item, idx) => (
                <div
                  key={`${item}-${idx}`}
                  onClick={() => handleSelectRecent(item)}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-stone-50 dark:hover:bg-stone-800/50 cursor-pointer text-sm text-stone-700 dark:text-stone-300 group transition-colors"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <History className="w-3.5 h-3.5 text-stone-400 shrink-0 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors" />
                    <span className="truncate">{item}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => removeRecentSearch(e, item)}
                    className="p-1 rounded text-stone-300 hover:text-stone-600 dark:text-stone-600 dark:hover:text-stone-300 transition-colors shrink-0 ml-2"
                    title="Remove from history"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Suggested Topics as Samples under "IDEAS" */}
      <div className="mt-8 pt-6 border-t border-stone-200/60 dark:border-stone-800/60 max-w-xl mx-auto text-left">
        <div className="text-xs text-stone-400 dark:text-stone-500 mb-3 font-semibold tracking-wider uppercase">
          Ideas
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                setTopic(suggestion);
                onSelectSample(suggestion);
              }}
              className="text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 bg-stone-100/80 dark:bg-stone-800/60 hover:bg-stone-200/70 dark:hover:bg-stone-700/60 px-3 py-1.5 rounded-lg text-left transition-colors border border-stone-200/40 dark:border-stone-700/40"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
