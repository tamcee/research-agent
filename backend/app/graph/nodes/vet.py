"""Vet: score & rank candidates, then select the top-K citable sources.

This is the distinct step the spec asks for — ranking by a trust score, not by raw
search order. Aggregators (lead_only) are excluded from citable sources. A stricter
re-search raises the tier bar to primary/major only.
"""
from __future__ import annotations

from app.config import settings
from app.events import EventType
from app.graph.nodes import active_id_set, get_ctx
from app.graph.state import GraphState
from app.schemas import SourceTier, SubQuestion
from app.services import source_scoring


async def vet_node(state: GraphState, config) -> dict:
    ctx = get_ctx(config)
    sub_questions: list[SubQuestion] = state["sub_questions"]
    active = active_id_set(state)

    for sq in sub_questions:
        if sq.id not in active:
            continue

        for c in sq.candidates:
            c.selected = False
            c.vet_score = source_scoring.score(c, sq.time_sensitive)

        leads = [c for c in sq.candidates if c.lead_only]
        pool = [c for c in sq.candidates if not c.lead_only]
        if sq.strict_filter:
            strict = [c for c in pool if c.tier <= SourceTier.MAJOR]
            pool = strict or pool  # don't starve the sub-question if strict is empty

        pool.sort(key=lambda c: c.vet_score, reverse=True)
        top = pool[: settings.extract_top_k]
        for c in top:
            c.selected = True

        await ctx.emitter.emit(
            EventType.VETTED,
            f"[{sq.id}] ranked {len(pool)} citable sources"
            + (f", dropped {len(leads)} aggregator lead(s)" if leads else "")
            + f"; selected top {len(top)} for extraction",
            sub_question_id=sq.id,
            selected=[c.public() for c in top],
            leads=[c.url for c in leads],
        )
        for c in top:
            await ctx.emitter.emit(
                EventType.SOURCE_SELECTED,
                f"[{sq.id}] » {c.domain or c.url}  (tier {int(c.tier)}, score {c.vet_score})",
                sub_question_id=sq.id,
                url=c.url,
                domain=c.domain,
                tier=int(c.tier),
                score=c.vet_score,
            )

    return {"sub_questions": sub_questions}
