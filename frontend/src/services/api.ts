import { HealthResponse, StartRunResponse, GetRunResponse, StreamEvent } from '../types';

// Read API base URL from Vite environment variable (e.g. deployed backend URL)
// or fallback to empty string (which uses Vite proxy / relative path in development)
const rawBase = import.meta.env.VITE_API_BASE_URL || '';
export const API_BASE_URL = rawBase.replace(/\/+$/, '');

export async function checkHealth(): Promise<HealthResponse> {
  const url = `${API_BASE_URL}/health`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function startResearch(topic: string): Promise<StartRunResponse> {
  const url = `${API_BASE_URL}/api/research`;
  console.log(`[Brief API] POST ${url}`, { topic });
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `${res.status} ${res.statusText}` }));
    throw new Error(err.detail || `Server error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function getResearchRun(runId: string): Promise<GetRunResponse> {
  const url = `${API_BASE_URL}/api/research/${runId}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch run: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export interface StreamCallbacks {
  onEvent: (event: StreamEvent) => void;
  onError?: (err: any) => void;
  onDone?: () => void;
}

export function subscribeToStream(runId: string, callbacks: StreamCallbacks): () => void {
  const url = `${API_BASE_URL}/api/research/${runId}/stream`;
  console.log(`[Brief API] Subscribing to SSE: ${url}`);
  const es = new EventSource(url);

  es.onmessage = (messageEvent) => {
    try {
      const parsed: StreamEvent = JSON.parse(messageEvent.data);
      callbacks.onEvent(parsed);

      if (parsed.type === 'done' || parsed.type === 'error') {
        es.close();
        if (callbacks.onDone) callbacks.onDone();
      }
    } catch (err) {
      console.error('Failed to parse SSE payload:', err, messageEvent.data);
    }
  };

  es.onerror = (err) => {
    // Check if EventSource was gracefully closed
    if (es.readyState === EventSource.CLOSED) {
      if (callbacks.onDone) callbacks.onDone();
      return;
    }
    console.error(`[Brief API] SSE connection error on ${url}:`, err);
    if (callbacks.onError) {
      callbacks.onError(
        new Error(`SSE connection failed to ${url}. Verify backend server is running and accessible.`)
      );
    }
    es.close();
  };

  return () => {
    es.close();
  };
}
