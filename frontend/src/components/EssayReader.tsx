import React, { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Copy,
  Check,
  Download,
  Printer,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  AlertOctagon,
  Eye,
  BookOpen,
} from "lucide-react";
import { Report, Citation } from "../types";
import { Badge } from "./ui/badge";
import { AnimatedButton } from "./ui/animated-button";

interface EssayReaderProps {
  report: Report;
  onNewResearch: () => void;
  onOpenSources: () => void;
}

export const EssayReader: React.FC<EssayReaderProps> = ({
  report,
  onNewResearch,
  onOpenSources,
}) => {
  const [copied, setCopied] = useState(false);
  const [highlightClaims, setHighlightClaims] = useState(false);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);

  // Map citation index to citation object
  const citationsByIndex = useMemo(() => {
    const map = new Map<number, Citation>();
    report.citations.forEach((c) => map.set(c.index, c));
    return map;
  }, [report.citations]);

  // Copy report to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Download report as markdown
  const handleDownload = () => {
    const blob = new Blob([report.markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${report.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Estimate reading time (~200 words per min)
  const wordCount = useMemo(() => {
    return report.markdown.split(/\s+/).filter(Boolean).length;
  }, [report.markdown]);
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Custom text transform to handle citation links [1], dagger †, and double-dagger ‡
  const renderFormattedText = (text: string) => {
    // Regex matches [1], [2], etc., or †, or ‡
    const parts = text.split(/(\[\d+\]|†|‡)/g);

    return parts.map((part, i) => {
      const citationMatch = part.match(/^\[(\d+)\]$/);
      if (citationMatch) {
        const index = parseInt(citationMatch[1], 10);
        const citation = citationsByIndex.get(index);
        return (
          <button
            key={i}
            onClick={() => citation && setActiveCitation(citation)}
            className="inline-flex items-center justify-center text-[11px] font-mono px-1 py-0.5 mx-0.5 rounded text-amber-900 dark:text-amber-300 bg-amber-100/70 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 transition-colors align-baseline hover:scale-105"
            title={citation ? `[${index}] ${citation.domain} — ${citation.title}` : `Citation [${index}]`}
          >
            {part}
          </button>
        );
      }

      if (part === "†") {
        return (
          <span
            key={i}
            className="text-amber-600 dark:text-amber-400 font-bold px-0.5 cursor-help"
            title="Unverified claim — asserted by a single source."
          >
            †
          </span>
        );
      }

      if (part === "‡") {
        return (
          <span
            key={i}
            className="text-rose-600 dark:text-rose-400 font-bold px-0.5 cursor-help"
            title="Disputed claim — independent sources conflict."
          >
            ‡
          </span>
        );
      }

      return part;
    });
  };

  return (
    <article className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      {/* Top Quiet Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-stone-200/60 dark:border-stone-800/80 mb-8 text-xs text-stone-500 dark:text-stone-400">
        <div className="flex items-center gap-3">
          <span className="font-medium text-stone-700 dark:text-stone-300">
            Digital Essay
          </span>
          <span>·</span>
          <span>{readingTime} min read</span>
          <span>·</span>
          <span>{wordCount} words</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Claim Highlighting Toggle */}
          <button
            onClick={() => setHighlightClaims(!highlightClaims)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
              highlightClaims
                ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300"
                : "hover:bg-stone-200/50 dark:hover:bg-stone-800/50"
            }`}
            title="Toggle claim veracity inspection"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Highlight Claims</span>
          </button>

          {/* View Sources */}
          <button
            onClick={onOpenSources}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors"
            title="Inspect cited sources & trust tiers"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sources ({report.citations.length})</span>
          </button>

          {/* Copy Markdown */}
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors"
            title="Copy essay markdown"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-md hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors"
            title="Download .md file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="p-1.5 rounded-md hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors"
            title="Print or save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Claim Veracity Summary Card */}
      <div className="p-4 rounded-xl bg-stone-100/60 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800/60 mb-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-500 font-medium">Claim Verification:</span>
          <Badge variant="verified">
            <ShieldCheck className="w-3 h-3" />
            <span>{report.verified_count} Verified</span>
          </Badge>
          <Badge variant="unverified">
            <HelpCircle className="w-3 h-3" />
            <span>{report.unverified_count} Unverified (†)</span>
          </Badge>
          {report.disputed_count > 0 && (
            <Badge variant="disputed">
              <AlertOctagon className="w-3 h-3" />
              <span>{report.disputed_count} Disputed (‡)</span>
            </Badge>
          )}
        </div>

        <div className="text-[11px] text-stone-400 dark:text-stone-500">
          Cross-source vetted via Chroma vector DB
        </div>
      </div>

      {/* Markdown Essay Body */}
      <div
        className={`prose prose-stone dark:prose-invert max-w-none font-serif leading-relaxed sm:text-lg ${
          highlightClaims ? "claims-highlighted" : ""
        }`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 dark:text-stone-50 mb-6 mt-2 leading-[1.2]">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-stone-800 dark:text-stone-100 mt-10 mb-4 pb-2 border-b border-stone-200/50 dark:border-stone-800/50">
                {children}
              </h2>
            ),
            p: ({ children }) => {
              // Parse strings for citations
              const processed = React.Children.map(children, (child) => {
                if (typeof child === "string") {
                  return renderFormattedText(child);
                }
                return child;
              });

              return (
                <p className="my-4 text-stone-800 dark:text-stone-200 leading-[1.8] text-[17px] sm:text-[18px]">
                  {processed}
                </p>
              );
            },
            li: ({ children }) => {
              const processed = React.Children.map(children, (child) => {
                if (typeof child === "string") {
                  return renderFormattedText(child);
                }
                return child;
              });
              return <li className="my-1.5 text-[16px] sm:text-[17px]">{processed}</li>;
            },
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-amber-800 dark:text-amber-400 underline underline-offset-4 hover:text-amber-950 dark:hover:text-amber-200 transition-colors"
              >
                <span>{children}</span>
                <ExternalLink className="w-3 h-3 opacity-60 inline" />
              </a>
            ),
            hr: () => <hr className="my-8 border-stone-200 dark:border-stone-800" />,
          }}
        >
          {report.markdown}
        </ReactMarkdown>
      </div>

      {/* Floating Citation Details Popover Modal */}
      {activeCitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 flex items-center justify-center font-mono text-xs font-semibold">
                  {activeCitation.index}
                </span>
                <Badge
                  variant={
                    activeCitation.tier === 1
                      ? "tier1"
                      : activeCitation.tier === 2
                      ? "tier2"
                      : "tier3"
                  }
                  size="sm"
                >
                  Tier {activeCitation.tier}{" "}
                  {activeCitation.tier === 1
                    ? "Primary (High Authority)"
                    : activeCitation.tier === 2
                    ? "Major Established Outlet"
                    : "General"}
                </Badge>
              </div>

              <button
                onClick={() => setActiveCitation(null)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <h4 className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100 leading-snug">
              {activeCitation.title}
            </h4>

            <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <span>Domain:</span>
              <code className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-mono text-stone-700 dark:text-stone-300">
                {activeCitation.domain}
              </code>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3 border-t border-stone-100 dark:border-stone-800">
              <span className="text-[11px] text-stone-400">Independent source</span>
              <a
                href={activeCitation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-amber-800 dark:text-amber-400 hover:underline"
              >
                <span>Read original document</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Quiet Actions */}
      <div className="mt-16 pt-8 border-t border-stone-200/60 dark:border-stone-800/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <AnimatedButton onClick={onNewResearch} variant="primary" size="sm">
            <span>Research Another Topic</span>
          </AnimatedButton>
          <AnimatedButton onClick={onOpenSources} variant="secondary" size="sm">
            <span>Explore All Sources</span>
          </AnimatedButton>
        </div>

        <div className="text-xs text-stone-400 dark:text-stone-500 font-sans">
          Generated with LangGraph · Chroma · Groq Llama 3.3 · Tavily
        </div>
      </div>
    </article>
  );
};
