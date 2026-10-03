# Deployment Guide

This guide covers deploying the **Research-to-Report Agent** (FastAPI + LangGraph backend and React + Vite frontend) to production using **Hugging Face Spaces (Docker SDK)** for the backend and **Vercel** for the frontend.

---

## Architecture Overview

```
[ Client Browser ]
        │
        ├── (Static SPA) ──> [ Frontend: Vercel (Edge CDN) ]
        │
        └── (HTTP + SSE) ──> [ Backend: Hugging Face Spaces (Docker, Port 7860) ]
                                     │ (16 GB RAM · 2 vCPUs Free)
                 ┌───────────────────┼───────────────────┐
                 ▼                   ▼                   ▼
           [ Groq LLM ]       [ Tavily API ]     [ Chroma DB ]
       (qwen3.8-27b)          (Web Search)     (Local Embeddings)
```

1. **Backend**: FastAPI app running LangGraph. Uses an in-memory run manager for active jobs and an event queue that streams live pipeline events via Server-Sent Events (SSE). Runs inside a 16 GB RAM Docker container on Hugging Face Spaces.
2. **Embeddings & Vector Store**: Uses `sentence-transformers` (`all-MiniLM-L6-v2`, ~80 MB) and Chroma SQLite vector storage. Model weights are pre-cached during Docker build.
3. **Frontend**: Static React + Vite SPA built with TypeScript, Tailwind CSS, and VengeanceUI. Connects to the backend via `VITE_API_BASE_URL`.

---

## Required Environment Variables

### Backend (`backend/.env` or Hugging Face Space Secrets)

| Variable | Description | Default | Required in Live Mode? |
|---|---|---|---|
| `GROQ_API_KEY` | Groq Cloud API key | `""` | Yes |
| `GROQ_MODEL` | LLM model name | `qwen/qwen3.8-27b` | No |
| `TAVILY_API_KEY` | Tavily Web Search API key | `""` | Yes |
| `FAKE_MODE` | Set `1` to run pipeline with mock LLM/Search (Chroma runs for real) | `0` | No |
| `ALLOWED_ORIGINS` | Comma-separated allowed frontend origins for CORS (or `*`) | `*` | Yes (in production) |
| `CHROMA_DIR` | Absolute or relative path to persistent Chroma directory | `/home/user/app/data/chroma` | No |

### Frontend (`frontend/.env` or Vercel Environment Variables)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Backend URL (no trailing slash) | `https://<username>-research-agent-backend.hf.space` |

---

## Production Deployment (Recommended)

### Step 1: Deploy Backend to Hugging Face Spaces (Docker SDK)

Hugging Face Spaces provides **16 GB RAM and 2 vCPUs** on its free tier, preventing Out-Of-Memory (OOM) crashes during sentence-transformer embedding and vector deduplication.

#### 1. Create Space on Hugging Face:
1. Log in to [huggingface.co](https://huggingface.co).
2. Click your profile picture (top right) $\rightarrow$ **New Space**.
3. Configure the Space:
   - **Space name**: `research-agent-backend`
   - **Space SDK**: **Docker** $\rightarrow$ **Blank**
   - **Space hardware**: Free (2 vCPU · 16 GB RAM)
   - **Visibility**: **Public** (required for browser frontend API requests)
4. Click **Create Space**.

#### 2. Add Secrets (Environment Variables):
1. In your Space, go to **Settings** $\rightarrow$ **Variables and secrets**.
2. Under **Secrets**, click **New secret** and add:
   - `GROQ_API_KEY`: Your Groq Cloud API key
   - `GROQ_MODEL`: `qwen/qwen3.8-27b`
   - `TAVILY_API_KEY`: Your Tavily API key
   - `ALLOWED_ORIGINS`: `*` (or your Vercel URL once deployed)
   - `FAKE_MODE`: `0`

#### 3. Push Code to Hugging Face Space:
You can sync your GitHub repository to your Space:
```bash
# Add Hugging Face Space as a git remote
git remote add space https://huggingface.co/spaces/<YOUR_HF_USERNAME>/research-agent-backend

# Push main branch to the Space
git push space main
```
The Space will build the `Dockerfile`, pre-cache the sentence transformer weights, and start FastAPI listening on port `7860`.

Your backend live endpoint will be:
```
https://<YOUR_HF_USERNAME>-research-agent-backend.hf.space
```

---

### Step 2: Deploy Frontend to Vercel

1. Log in to [vercel.com](https://vercel.com) and import the `tamcee/research-agent` repository.
2. In the deployment configuration:
   - **Root Directory**: Select `frontend`
   - **Framework Preset**: `Vite` (automatically detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Under **Environment Variables**, add:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://<YOUR_HF_USERNAME>-research-agent-backend.hf.space` *(no trailing slash)*
4. Click **Deploy**.

---

## Local Self-Hosting: Docker Compose

For single-command local testing with Docker Compose:

### 1. Launch Services
```bash
docker compose up -d --build
```

- **Frontend**: Accessible at `http://localhost` (port 80).
- **Backend API**: Accessible at `http://localhost:7860`.
- **Chroma Storage**: Automatically persisted to the `chroma_data` named Docker volume.

### 2. Inspect Logs
```bash
docker compose logs -f backend
```

---

## Production Verification Checklist

1. **Verify Backend Health**:
   ```bash
   curl -s https://<YOUR_HF_USERNAME>-research-agent-backend.hf.space/health
   # Expected: {"status":"ok","fake_mode":false,"model":"qwen/qwen3.8-27b","missing_keys":[]}
   ```

2. **Trigger a Test Research Run**:
   ```bash
   curl -X POST https://<YOUR_HF_USERNAME>-research-agent-backend.hf.space/api/research \
     -H "Content-Type: application/json" \
     -d '{"topic": "Are electric vehicles better for the climate than gas cars?"}'
   # Returns: {"run_id": "...", "topic": "...", "status": "running"}
   ```

3. **Verify Frontend**:
   - Open your Vercel deployment URL in a browser.
   - Confirm the backend indicator in the top right shows `Live (qwen3.8-27b)`.
   - Submit a research question and verify real-time SSE streaming.
