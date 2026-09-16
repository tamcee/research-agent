"""Extract: full-text extraction on selected sources only (parallel)."""
from __future__ import annotations

import asyncio

from app.events import EventType
from app.graph.nodes import active_id_set, get_ctx
from app.graph.state import GraphState
from app.schemas import SubQuestion
from app.services import extraction


async def extract_node(state: GraphState, config) -> dict:
    ctx = get_ctx(config)
    sub_questions: list[SubQuestion] = state["sub_questions"]
    active = active_id_set(state)

    targets = [
        (sq, c)
        for sq in sub_questions
        if sq.id in active
        for c in sq.selected_sources()
    ]

    async def run_one(sq: SubQuestion, c) -> None:
        await ctx.emitter.emit(
            EventType.EXTRACTING, f"[{sq.id}] ↓ {c.domain or c.url}",
            sub_question_id=sq.id, url=c.url,
        )
        text, ok = await extraction.extract(c.url)
        c.extracted = ok
        c.extracted_text = text if ok else None
        await ctx.emitter.emit(
            EventType.EXTRACTED,
            f"[{sq.id}] {'extracted' if ok else 'extraction failed'} — {c.domain or c.url}",
            sub_question_id=sq.id, url=c.url, ok=ok, chars=len(text or ""),
        )

    await asyncio.gather(*(run_one(sq, c) for sq, c in targets))
    return {"sub_questions": sub_questions}
