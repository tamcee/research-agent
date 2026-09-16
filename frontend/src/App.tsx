import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { ResearchInput } from "./components/ResearchInput";
import { PipelineStream } from "./components/PipelineStream";
import { EssayReader } from "./components/EssayReader";
import { SourcesDrawer } from "./components/SourcesDrawer";
import { AnimatedRays } from "./components/ui/animated-rays";
import { Report, StreamEvent, HealthResponse } from "./types";
import { checkHealth, startResearch, subscribeToStream } from "./services/api";
import { SAMPLE_REPORT, SAMPLE_EVENTS } from "./components/MockData";

export function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return (
      localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState(false);

  // Run state
  const [topic, setTopic] = useState("");
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  // Sync dark mode class on documentElement
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Check health on mount
  useEffect(() => {
    let mounted = true;
    checkHealth()
      .then((data) => {
        if (mounted) {
          setHealth(data);
          setHealthError(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setHealthError(true);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Handle starting a research run
  const handleStartResearch = async (searchTopic: string) => {
    setTopic(searchTopic);
    setIsLoading(true);
    setError(null);
    setEvents([]);
    setReport(null);

    try {
      // 1. Trigger API start
      const startRes = await startResearch(searchTopic);

      // 2. Subscribe to SSE stream
      subscribeToStream(startRes.run_id, {
        onEvent: (ev) => {
          setEvents((prev) => [...prev, ev]);
          if (ev.type === "done" && ev.data?.report) {
            setReport(ev.data.report);
            setIsLoading(false);
          } else if (ev.type === "error") {
            setError(ev.message || "An error occurred during research.");
            setIsLoading(false);
          }
        },
        onError: (err) => {
          console.error("Stream error:", err);
          setError("Connection to pipeline stream was interrupted.");
          setIsLoading(false);
        },
        onDone: () => {
          setIsLoading(false);
        },
      });
    } catch (apiErr: any) {
      console.warn("Backend API unavailable, simulating preview stream:", apiErr);
      // If backend is not running yet, provide seamless simulation with sample events
      let currentEventIdx = 0;
      const interval = setInterval(() => {
        if (currentEventIdx < SAMPLE_EVENTS.length) {
          const ev = SAMPLE_EVENTS[currentEventIdx];
          setEvents((prev) => [...prev, ev]);
          currentEventIdx++;
        } else {
          clearInterval(interval);
          setReport({
            ...SAMPLE_REPORT,
            topic: searchTopic,
          });
          setIsLoading(false);
        }
      }, 700);
    }
  };

  const handleLoadSample = () => {
    setTopic(SAMPLE_REPORT.topic);
    setEvents(SAMPLE_EVENTS);
    setReport(SAMPLE_REPORT);
    setIsLoading(false);
    setError(null);
  };

  const handleNewResearch = () => {
    setReport(null);
    setEvents([]);
    setIsLoading(false);
    setError(null);
    setTopic("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-stone-900 dark:bg-[#0B0D11] dark:text-stone-100 transition-colors">
      <AnimatedRays className="flex-1 flex flex-col">
        {/* Header */}
        <Header
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          health={health}
          healthError={healthError}
          onLoadSample={handleLoadSample}
          onNewResearch={handleNewResearch}
          hasReport={Boolean(report)}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 flex flex-col justify-center">
          {/* View 1: Input Screen */}
          {!report && !isLoading && events.length === 0 && (
            <ResearchInput onSubmit={handleStartResearch} isLoading={isLoading} />
          )}

          {/* View 2: Live Research Pipeline Stream */}
          {(isLoading || (!report && events.length > 0)) && (
            <PipelineStream
              events={events}
              isComplete={Boolean(report)}
              error={error}
              topic={topic}
            />
          )}

          {/* View 3: Quiet Digital Essay Reader */}
          {report && (
            <EssayReader
              report={report}
              onNewResearch={handleNewResearch}
              onOpenSources={() => setSourcesOpen(true)}
            />
          )}
        </main>

        {/* Sources Drawer */}
        {report && (
          <SourcesDrawer
            isOpen={sourcesOpen}
            onClose={() => setSourcesOpen(false)}
            citations={report.citations}
          />
        )}
      </AnimatedRays>
    </div>
  );
}

export default App;
