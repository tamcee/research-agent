import { HealthResponse, StartRunResponse, GetRunResponse, StreamEvent } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/health`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.statusText}`);
  }
  return res.json();
}

export async function startResearch(topic: string): Promise<StartRunResponse> {
  const res = await fetch(`${API_BASE_URL}/api/research`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to start research run');
  }
  return res.json();
}

export async function getResearchRun(runId: string): Promise<GetRunResponse> {
  const res = await fetch(`${API_BASE_URL}/api/research/${runId}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch run: ${res.statusText}`);
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
    // Note: SSE close triggers error event in browsers, so check readyState
    if (es.readyState === EventSource.CLOSED) {
      if (callbacks.onDone) callbacks.onDone();
      return;
    }
    if (callbacks.onError) {
      callbacks.onError(err);
    }
    es.close();
  };

  return () => {
    es.close();
  };
}
