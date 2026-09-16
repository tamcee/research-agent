# Research-to-Report Agent

An autonomous research pipeline: give it a question, and a graph of agents plans
sub-questions, searches the web, **vets and ranks** sources, extracts full text,
checks claims for **cross-source corroboration** via a local vector DB, and writes
a cited, essay-quality report — streaming its progress live.

- **Backend:** FastAPI + LangGraph, Groq (LLM), Tavily (search), Chroma (local vector DB),
  sentence-transformers (local embeddings), trafilatura (extraction).
- **Frontend:** React + Vite + TypeScript (a quiet "digital essay" reading experience).

## Pipeline

```
planner → search → vet → extract → embed → critic ─┬─(too few verified)→ escalate → search …
                                                    └─(done)───────────→ writer
```

Every claim is labeled **verified** (corroborated across 2+ independent domains),
**unverified** (single source), or **disputed** (sources conflict). Wikipedia and other
aggregators are used only as leads — never cited.

## Backend quickstart

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # then add GROQ_API_KEY + TAVILY_API_KEY

# End-to-end, no keys needed (stubs Groq + Tavily; Chroma + embeddings run for real):
FAKE_MODE=1 python scripts/run_cli.py "Are electric vehicles better for the climate than gas cars?"

# Live (after adding keys to .env):
python scripts/run_cli.py "your research question"
```

First run downloads the embedding model (`all-MiniLM-L6-v2`, ~80 MB).

Configuration (models, thresholds, tier lists) lives in `backend/app/config.py` and
`backend/app/services/source_scoring.py`. Deployment steps: see [DEPLOY.md](DEPLOY.md).

## Frontend quickstart

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` to experience the quiet digital essay reader powered by VengeanceUI, live 16-event SSE streaming, and interactive citations.

