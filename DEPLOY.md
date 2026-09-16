# Deployment Guide

This guide covers deploying the **Research-to-Report Agent** (FastAPI + LangGraph backend and React + Vite frontend) to production.

---

## Architecture Overview

```
[ Client Browser ]
        │
        ├── (Static SPA) ──> [ Frontend: Vercel / Cloudflare Pages / CDN ]
        │
        └── (HTTP + SSE) ──> [ Backend: FastAPI / Uvicorn ]
                                     │
                 ┌───────────────────┼───────────────────┐
                 ▼                   ▼                   ▼
           [ Groq LLM ]       [ Tavily API ]     [ Chroma DB ]
       (llama-3.3-70b)       (Web Search)     (Local Embeddings)
```

1. **Backend**: Stateless FastAPI app running LangGraph. Uses an in-memory run manager for active jobs and an event queue that streams live pipeline events via Server-Sent Events (SSE).
2. **Embeddings & Vector Store**: Uses `sentence-transformers` (`all-MiniLM-L6-v2`, ~80 MB) and Chroma SQLite vector storage. In containerized or PaaS environments, mount a persistent volume at `backend/data/chroma`.
3. **Frontend**: Static React + Vite SPA built with TypeScript, Tailwind CSS, and VengeanceUI. Connects to backend endpoints (`/api/research`, `/health`) and subscribes to `/api/research/{run_id}/stream`.

---

## Required Environment Variables

### Backend (`backend/.env` or PaaS environment variables)

| Variable | Description | Default | Required in Live Mode? |
|---|---|---|---|
| `GROQ_API_KEY` | Groq Cloud API key | `""` | Yes |
| `GROQ_MODEL` | LLM model name | `llama-3.3-70b-versatile` | No |
| `TAVILY_API_KEY` | Tavily Web Search API key | `""` | Yes |
| `FAKE_MODE` | Set `1` to run pipeline with mock LLM/Search (Chroma runs for real) | `0` | No |
| `ALLOWED_ORIGINS` | Comma-separated allowed frontend origins for CORS | `http://localhost:5173` | Yes (in production) |
| `CHROMA_DIR` | Absolute or relative path to persistent Chroma directory | `backend/data/chroma` | No |

### Frontend (`frontend/.env` or Vercel/Cloudflare environment variables)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Backend URL (leave empty if using Vite dev proxy or same-domain reverse proxy) | `https://api.yourdomain.com` |

---

## Option 1: Docker Compose (Self-Hosting / VPS)

The simplest single-command deployment using Docker and Docker Compose.

### 1. Configure Environment
Create a `.env` file in the project root:
```bash
GROQ_API_KEY=gsk_your_groq_api_key_here
TAVILY_API_KEY=tvly-your_tavily_api_key_here
ALLOWED_ORIGINS=http://localhost,http://localhost:80,http://your-server-ip
FAKE_MODE=0
```

### 2. Launch Services
```bash
docker compose up -d --build
```

- **Frontend**: Accessible at `http://localhost` (or server port 80).
- **Backend API**: Accessible at `http://localhost:8000`.
- **Chroma Storage**: Automatically persisted to the `chroma_data` named Docker volume.

### 3. Inspect Logs
```bash
docker compose logs -f backend
```

---

## Option 2: Decoupled Cloud Deployment (Recommended)

Deploy the backend to a container PaaS (Render, Railway, or Fly.io) and the frontend to a global edge CDN (Vercel or Cloudflare Pages).

### Step 1: Deploy Backend (e.g. Render / Railway)

#### On Render:
1. Create a **New Web Service** pointing to your repository.
2. Select **Docker** environment using `backend/Dockerfile` (or Python environment: `pip install -r requirements.txt`).
3. Set **Start Command** (if not using Docker):
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1
   ```
4. **Attach a Persistent Disk**:
   - Mount Path: `/app/data`
   - Size: 1 GB (sufficient for Chroma vectors across hundreds of runs).
5. **Add Environment Variables**:
   - `GROQ_API_KEY`: Your Groq key
   - `TAVILY_API_KEY`: Your Tavily key
   - `FAKE_MODE`: `0`
   - `ALLOWED_ORIGINS`: `https://your-frontend.vercel.app`
6. Note the public URL (e.g., `https://research-agent-api.onrender.com`).

> [!NOTE]
> **Render Free-Tier Cold Starts**: The backend includes a fast `/health` endpoint. The frontend checks `/health` on load and informs the user if a dormant free-tier server is waking up. In addition, the RunManager buffers all events so that late connections (after wake-up) receive the full replayed event stream without missing data.

---

### Step 2: Deploy Frontend (Vercel / Cloudflare Pages)

#### On Vercel:
1. Import your Git repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Vite**.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Set Environment Variables:
   - `VITE_API_BASE_URL`: `https://research-agent-api.onrender.com` (your backend URL without trailing slash).
7. Click **Deploy**.

---

## Important Production Considerations

### 1. Reverse Proxy Buffering & SSE
Server-Sent Events (`/api/research/{run_id}/stream`) require unbuffered streaming. If routing through Nginx or Cloudflare:
- **Nginx**: Ensure `proxy_buffering off;` and `proxy_set_header X-Accel-Buffering no;` are configured for SSE locations.
- **Cloudflare**: Cloudflare proxies SSE streams without buffering by default for standard content-type `text/event-stream`.

### 2. Embeddings Pre-Caching
The backend uses `sentence-transformers/all-MiniLM-L6-v2`. In `backend/Dockerfile`, the model weights are downloaded during the build step. This eliminates runtime download latency and ensures container startup is near-instantaneous.

### 3. Memory Sizing
- Minimum recommended RAM: **1 GB**.
- Model weights: ~80 MB.
- Python runtime + Chroma + dependencies: ~350 MB.

---

## Production Verification Checklist

1. **Verify Backend Health**:
   ```bash
   curl -s https://your-backend-url/health
   # Expected: {"status":"ok","fake_mode":false,"model":"llama-3.3-70b-versatile","missing_keys":[]}
   ```

2. **Trigger a Test Research Run**:
   ```bash
   curl -X POST https://your-backend-url/api/research \
     -H "Content-Type: application/json" \
     -d '{"topic": "Are electric vehicles better for the climate than gas cars?"}'
   # Returns: {"run_id": "...", "topic": "...", "status": "running"}
   ```

3. **Verify Frontend**:
   - Open your frontend deployment in a web browser.
   - Confirm the backend indicator in the top right shows green ("Live" or "Fake Mode").
   - Test running a research question and verify smooth 16-event SSE progression and report rendering.
