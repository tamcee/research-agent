import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { ResearchInput } from "./components/ResearchInput";
import { PipelineStream } from "./components/PipelineStream";
import { EssayReader } from "./components/EssayReader";
import { SourcesDrawer } from "./components/SourcesDrawer";
import { AnimatedRays } from "./components/ui/animated-rays";
import { Report, StreamEvent, HealthResponse } from "./types";
import { checkHealth, startResearch, subscribeToStream, API_BASE_URL } from "./services/api";

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
      .catch((err) => {
        console.warn("Backend health check failed:", err);
        if (mounted) {
          setHealthError(true);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Handle starting a live research run
  const handleStartResearch = async (searchTopic: string) => {
    const trimmed = searchTopic.trim();
    if (!trimmed) return;

    setTopic(trimmed);
    setIsLoading(true);
    setError(null);
    setEvents([]);
    setReport(null);

    const targetEndpoint = API_BASE_URL
      ? API_BASE_URL
      : typeof window !== "undefined"
      ? window.location.origin
      : "";

    console.log(`[Brief] Dispatching research run to backend (${targetEndpoint}):`, trimmed);

    try {
      // 1. Trigger API start on the backend (POST /api/research)
      const startRes = await startResearch(trimmed);
      console.log(`[Brief] Run started successfully. run_id:`, startRes.run_id);

      // 2. Subscribe to live SSE stream (GET /api/research/{run_id}/stream)
      subscribeToStream(startRes.run_id, {
        onEvent: (ev) => {
          setEvents((prev) => [...prev, ev]);
          if (ev.type === "done" && ev.data?.report) {
            setReport(ev.data.report);
            setIsLoading(false);
          } else if (ev.type === "error") {
            setError(ev.message || "An error occurred during research execution.");
            setIsLoading(false);
          }
        },
        onError: (err: any) => {
          console.error("[Brief] Stream connection failed:", err);
          setError(
            err?.message ||
              `Stream connection to ${targetEndpoint}/api/research/${startRes.run_id}/stream failed.`
          );
          setIsLoading(false);
        },
        onDone: () => {
          setIsLoading(false);
        },
      });
    } catch (apiErr: any) {
      console.error("[Brief] Failed to initiate research run:", apiErr);
      const detail = apiErr?.message || "Failed to connect to backend.";
      setError(
        `${detail} (Target: ${targetEndpoint}/api/research). Ensure your FastAPI backend server is running and accessible.`
      );
      setIsLoading(false);
    }
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
          onNewResearch={handleNewResearch}
          hasReport={Boolean(report)}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 flex flex-col justify-center">
          {/* View 1: Input Screen (displayed when not loading, no report, and no events yet) */}
          {!report && !isLoading && events.length === 0 && (
            <ResearchInput
              onSubmit={handleStartResearch}
              isLoading={isLoading}
              error={error}
              onClearError={() => setError(null)}
            />
          )}

          {/* View 2: Live Research Pipeline Stream */}
          {(isLoading || (!report && (events.length > 0 || Boolean(error)))) && (
            <PipelineStream
              events={events}
              isComplete={Boolean(report)}
              error={error}
              topic={topic}
              onReset={handleNewResearch}
            />
          )}

          {/* View 3: Digital Essay Reader */}
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
