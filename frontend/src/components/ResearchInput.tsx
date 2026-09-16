import React, { useState } from "react";
import { ArrowRight, Sparkles, Compass } from "lucide-react";
import { AnimatedButton } from "./ui/animated-button";

interface ResearchInputProps {
  onSubmit: (topic: string) => void;
  isLoading: boolean;
}

const SUGGESTIONS = [
  "Are electric vehicles better for the climate than gas cars?",
  "Is nuclear power necessary to reach net-zero emissions?",
  "Does intermittent fasting produce clinically meaningful longevity benefits?",
  "How does deep learning scaling compare between dense models and mixture-of-experts?",
];

export const ResearchInput: React.FC<ResearchInputProps> = ({ onSubmit, isLoading }) => {
  const [topic, setTopic] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isLoading) {
      onSubmit(topic.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-12 sm:py-16 text-center animate-fade-in">
      {/* Editorial Title */}
      <div className="mb-6 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-900/50">
          <Compass className="w-3.5 h-3.5" />
          Autonomous Cross-Source Research
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-normal text-stone-900 dark:text-stone-50 tracking-tight leading-[1.15]">
          A quiet digital essay for <br />
          <span className="italic text-stone-700 dark:text-stone-300">any complex question.</span>
        </h1>
        <p className="text-sm sm:text-base text-stone-500 dark:text-stone-400 max-w-lg mx-auto font-sans leading-relaxed">
          Plans sub-questions, vets credible domains, corroborates claims in a local vector DB, and synthesizes a cited report.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative mt-8 max-w-xl mx-auto text-left">
        <div className="relative flex items-center rounded-2xl bg-white dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all focus-within:border-stone-400 dark:focus-within:border-stone-600 focus-within:ring-4 focus-within:ring-amber-500/10 p-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
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

      {/* Suggested Topics */}
      <div className="mt-8 pt-6 border-t border-stone-200/60 dark:border-stone-800/60 max-w-xl mx-auto text-left">
        <div className="flex items-center gap-1.5 text-xs text-stone-400 dark:text-stone-500 mb-3 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Explore prompt ideas</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                setTopic(suggestion);
                onSubmit(suggestion);
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
