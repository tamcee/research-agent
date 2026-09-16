"""FastAPI app: start a research run, stream its progress over SSE, fetch results.

Run locally:  uvicorn app.main:app --reload   (from backend/)
"""
from __future__ import annotations

import json

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from app.config import settings
from app.run_manager import DONE, manager

app = FastAPI(title="Research-to-Report Agent", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,   # localhost + deployed frontend (from ALLOWED_ORIGINS)
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    allow_credentials=False,
)


class ResearchRequest(BaseModel):
    topic: str


@app.get("/health")
async def health() -> dict:
    """Cheap liveness check — also confirms whether a free-tier backend has woken up."""
    return {
        "status": "ok",
        "fake_mode": settings.fake_mode,
        "model": settings.groq_model,
        "missing_keys": settings.missing_keys(),
    }


@app.post("/api/research")
async def start_research(req: ResearchRequest) -> dict:
    topic = req.topic.strip()
    if not topic:
        raise HTTPException(status_code=400, detail="topic is required")
    rec = manager.start(topic)
    return {"run_id": rec.id, "topic": topic, "status": rec.status}


@app.get("/api/research/{run_id}")
async def get_research(run_id: str) -> dict:
    rec = manager.get(run_id)
    if rec is None:
        raise HTTPException(status_code=404, detail="unknown run_id")
    return {
        "run_id": rec.id,
        "topic": rec.topic,
        "status": rec.status,
        "report": rec.report,
        "events": rec.events,
    }


@app.get("/api/research/{run_id}/stream")
async def stream_research(run_id: str) -> EventSourceResponse:
    rec = manager.get(run_id)
    if rec is None:
        raise HTTPException(status_code=404, detail="unknown run_id")

    async def gen():
        q = manager.subscribe(rec)
        try:
            while True:
                item = await q.get()
                if item is DONE:
                    break
                yield {"data": json.dumps(item, ensure_ascii=False)}
        finally:
            manager.unsubscribe(rec, q)

    return EventSourceResponse(gen())
