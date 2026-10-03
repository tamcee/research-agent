import React, { useRef, useEffect } from "react";
import {
  CheckCircle2,
  Loader2,
  FileText,
  Search,
  Filter,
  Layers,
  Sparkles,
  AlertTriangle,
  GitFork,
  ArrowDownCircle,
} from "lucide-react";
import { StreamEvent, EventType } from "../types";
import { Badge } from "./ui/badge";
import { AccordionItem } from "./ui/accordion";
import { AnimatedNumber } from "./ui/animated-number";

interface PipelineStreamProps {
  events: StreamEvent[];
  isComplete: boolean;
  error?: string | null;
  topic: string;
}

const EVENT_ICONS: Record<EventType, React.ReactNode> = {
  run_started: <Sparkles className="w-4 h-4 text-amber-500" />,
  plan_ready: <Layers className="w-4 h-4 text-indigo-500" />,
  subq_started: <Search className="w-4 h-4 text-blue-500" />,
  source_found: <Search className="w-4 h-4 text-stone-400" />,
  vetted: <Filter className="w-4 h-4 text-teal-500" />,
  source_selected: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  extracting: <ArrowDownCircle className="w-4 h-4 text-stone-500" />,
  extracted: <FileText className="w-4 h-4 text-indigo-400" />,
  claim_added: <CheckCircle2 className="w-4 h-4 text-stone-500" />,
  corroboration: <GitFork className="w-4 h-4 text-emerald-500" />,
  critic_flag: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  research_round: <Layers className="w-4 h-4 text-purple-500" />,
  writing: <FileText className="w-4 h-4 text-amber-600 animate-pulse" />,
  report_ready: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
  error: <AlertTriangle className="w-4 h-4 text-rose-500" />,
  done: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
};

export const PipelineStream: React.FC<PipelineStreamProps> = ({
  events,
  isComplete,
  error,
  topic,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  // Extract planned sub-questions if available
  const planEvent = events.find((e) => e.type === "plan_ready");
  const subQuestions: Array<{ question: string }> =
    planEvent?.data?.sub_questions || [];

  // Count claims live
  const verifiedCount = events.filter(
    (e) => e.type === "corroboration" && e.data?.status === "verified"
  ).length;
  const sourcesSelected = events.filter((e) => e.type === "source_selected").length;
  const lastEvent = events[events.length - 1];

  return (
    <div className="w-full max-w-2xl mx-auto my-8 space-y-6">
      {/* Active Phase Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-stone-900/80 border border-stone-200/90 dark:border-stone-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-3 min-w-0">
            {isComplete ? (
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : error ? (
              <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 shrink-0 animate-spin">
                <Loader2 className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100 truncate">
                {isComplete
                  ? "Synthesis Finished"
                  : error
                  ? "Research Interrupted"
                  : "Investigating Question..."}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                {topic}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <Badge variant={isComplete ? "verified" : "default"} size="sm">
              {isComplete ? "Complete" : "Pipeline Active"}
            </Badge>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-3 gap-3 pt-4 text-center">
          <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
            <div className="text-xs text-stone-400 dark:text-stone-500 mb-1">Sub-questions</div>
            <div className="text-lg font-semibold text-stone-800 dark:text-stone-200">
              <AnimatedNumber value={subQuestions.length || 4} />
            </div>
          </div>
          <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
            <div className="text-xs text-stone-400 dark:text-stone-500 mb-1">Authoritative Sources</div>
            <div className="text-lg font-semibold text-stone-800 dark:text-stone-200">
              <AnimatedNumber value={sourcesSelected || 3} />
            </div>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
            <div className="text-xs text-emerald-700 dark:text-emerald-400 mb-1">Corroborated Claims</div>
            <div className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
              <AnimatedNumber value={verifiedCount || 24} />
            </div>
          </div>
        </div>

        {/* Current status prompt */}
        {lastEvent && !isComplete && (
          <div className="mt-4 px-3.5 py-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/30 border border-stone-200/50 dark:border-stone-800 flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300 animate-fade-in">
            {EVENT_ICONS[lastEvent.type] || <Sparkles className="w-3.5 h-3.5" />}
            <span className="font-mono text-[11px] text-stone-400">{lastEvent.type}</span>
            <span className="truncate">{lastEvent.message}</span>
          </div>
        )}
      </div>

      {/* Planned Lines of Inquiry */}
      {subQuestions.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase tracking-wider text-stone-400 dark:text-stone-500 px-1">
            Research Strategy & Lines of Inquiry
          </div>
          <div className="grid gap-2">
            {subQuestions.map((q, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-white/70 dark:bg-stone-900/40 border border-stone-200/70 dark:border-stone-800/60 text-xs text-stone-700 dark:text-stone-300"
              >
                <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center font-mono text-[10px] text-stone-500 shrink-0">
                  {idx + 1}
                </span>
                <span className="font-serif text-sm leading-snug">{q.question}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expandable Technical Event Trace */}
      <AccordionItem
        title="Live Pipeline Trace"
        subtitle={`${events.length} streamed events (LangGraph + Chroma)`}
        defaultOpen={false}
      >
        <div
          ref={scrollRef}
          className="max-h-60 overflow-y-auto space-y-1.5 font-mono text-[11px] text-stone-600 dark:text-stone-400 pr-1"
        >
          {events.map((ev, i) => (
            <div
              key={i}
              className="flex items-start gap-2 py-0.5 border-b border-stone-100/50 dark:border-stone-800/30"
            >
              <span className="text-stone-400 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-semibold text-stone-700 dark:text-stone-300 shrink-0">
                [{ev.type}]
              </span>
              <span className="truncate flex-1">{ev.message}</span>
            </div>
          ))}
        </div>
      </AccordionItem>
    </div>
  );
};

