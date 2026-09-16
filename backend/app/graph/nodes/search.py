"""Search: one parallel Tavily query per active sub-question (async fan-out).

Round 0 searches every sub-question. Later rounds re-search only the ones the
critic flagged, refreshing their candidates and clearing the flag.
"""
from __future__ import annotations

import asyncio

from app.events import EventType
from app.graph.nodes import get_ctx
from app.graph.state import GraphState
from app.schemas import SubQuestion
from app.services import source_scoring, tavily_client


async def search_node(state: GraphState, config) -> dict:
    ctx = get_ctx(config)
    sub_questions: list[SubQuestion] = state["sub_questions"]
    rnd = state.get("research_round", 0)

    active = sub_questions if rnd == 0 else [sq for sq in sub_questions if sq.needs_research]
    active_ids = [sq.id for sq in active]

    async def run_one(sq: SubQuestion) -> None:
        await ctx.emitter.emit(
            EventType.SUBQ_STARTED,
            f"[{sq.id}] {sq.question}",
            sub_question_id=sq.id,
            question=sq.question,
        )
        sq.candidates = []
        sq.needs_research = False  # handled this round
        days = 365 if sq.time_sensitive else None
        cands = await tavily_client.search(sq.search_query, days=days)
        for c in cands:
            c.domain = source_scoring.domain_of(c.url)
            c.tier, c.lead_only = source_scoring.classify(c.url)
            c.primary_source_hint = source_scoring.primary_source_hint(c.url, c.snippet)
        sq.candidates = cands
        await ctx.emitter.emit(
            EventType.SOURCE_FOUND,
            f"[{sq.id}] found {len(cands)} candidate sources",
            sub_question_id=sq.id,
            count=len(cands),
        )

    await asyncio.gather(*(run_one(sq) for sq in active))
    return {"sub_questions": sub_questions, "active_ids": active_ids}
