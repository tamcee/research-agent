import React from "react";
import { Sun, Moon, BookOpen, Activity } from "lucide-react";
import { HealthResponse } from "../types";
import { Badge } from "./ui/badge";

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  health: HealthResponse | null;
  healthError: boolean;
  onNewResearch: () => void;
  hasReport: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  health,
  healthError,
  onNewResearch,
  hasReport,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#FAF9F5]/85 dark:bg-[#0B0D11]/85 border-b border-stone-200/70 dark:border-stone-800/80 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand / Logo */}
        <button
          onClick={onNewResearch}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-7 h-7 rounded-md bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center font-serif text-sm font-semibold shadow-sm group-hover:scale-105 transition-transform">
            B
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-base font-medium tracking-tight text-stone-900 dark:text-stone-100">
              Brief
            </span>
          </div>
        </button>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Backend Status */}
          {healthError ? (
            <Badge variant="outline" size="sm" className="hidden sm:inline-flex text-stone-500 border-stone-300 dark:border-stone-800">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400 dark:bg-stone-600 mr-1" />
              Offline (Demo Available)
            </Badge>
          ) : health ? (
            <Badge variant="outline" size="sm" className="hidden sm:inline-flex border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
              {health.fake_mode ? "Fake Mode (No Keys)" : `Live (${health.model.split("/").pop()})`}
            </Badge>
          ) : (
            <Badge variant="outline" size="sm" className="hidden sm:inline-flex text-stone-400">
              <Activity className="w-3 h-3 mr-1 animate-spin" />
              Checking...
            </Badge>
          )}

          {hasReport && (
            <button
              onClick={onNewResearch}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 rounded-md transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-stone-500" />
              <span>New Topic</span>
            </button>
          )}

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 rounded-md text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors focus:outline-none"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
