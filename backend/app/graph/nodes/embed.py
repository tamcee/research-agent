"""Embed: distill atomic claims from each source, dedup, and store in Chroma.

Claims are the unit of corroboration. Near-identical claims from the *same* source
are dropped at store time; cross-domain repeats are kept (that's corroboration).
On a re-search round, a sub-question's prior claims are cleared first.
"""
from __future__ import annotations

import asyncio
from uuid import uuid4

from app import llm
from app.config import settings
from app.events import EventType
from app.graph.nodes import active_id_set, get_ctx
from app.graph.state import GraphState
from app.schemas import Claim, DistilledClaims, SubQuestion

_SYS = (
    "Extract the key factual claims from the provided source text, as they relate to the "
    "sub-question. Each claim must be atomic (one assertion), self-contained (no pronouns "
    "referring outside it), and verifiable. Do not include opinions, hedging, or filler. "
    "Return at most a handful of the most important claims."
)


def _user(sq: SubQuestion, domain: str, text: str) -> str:
    return (
        f"Sub-question: {sq.question}\nSource domain: {domain}\n\n"
        f"Source text:\n\"\"\"\n{text[:8000]}\n\"\"\""
    )


def _fake_claims(sq: SubQuestion, domain: str) -> DistilledClaims:
    # One shared claim (identical across sources -> corroborates -> verified) and one
    # domain-unique claim (single source -> unverified).
    shared = (
        f"Current evidence broadly supports the mainstream view on "
        f"{sq.question.rstrip('?').lower()}."
    )
    unique = f"{domain} reports a specific detail regarding {sq.search_query}."
    return DistilledClaims(claims=[shared, unique])


async def embed_node(state: GraphState, config) -> dict:
    ctx = get_ctx(config)
    store = ctx.store
    sub_questions: list[SubQuestion] = state["sub_questions"]
    active = active_id_set(state)
    is_research = state.get("research_round", 0) > 0

    for sq in sub_questions:
        if sq.id not in active:
            continue
        if is_research and store is not None:
            store.delete_subq(ctx.run_id, sq.id)
            sq.claims = []

        sources = [c for c in sq.selected_sources() if c.extracted and c.extracted_text]

        async def distill(c):
            out = await llm.structured(
                DistilledClaims,
                _SYS,
                _user(sq, c.domain, c.extracted_text or ""),
                fake=lambda: _fake_claims(sq, c.domain),
            )
            return c, out.claims[: settings.max_claims_per_source]

        results = await asyncio.gather(*(distill(c) for c in sources))

        for c, claim_texts in results:
            for text in claim_texts:
                text = (text or "").strip()
                if not text:
                    continue
                claim = Claim(
                    id=uuid4().hex,
                    sub_question_id=sq.id,
                    text=text,
                    source_url=c.url,
                    source_domain=c.domain,
                )
                if store is not None and not store.add_claim(ctx.run_id, claim):
                    continue  # near-duplicate within this source
                sq.claims.append(claim)
                await ctx.emitter.emit(
                    EventType.CLAIM_ADDED,
                    f"[{sq.id}] • {text[:90]}",
                    sub_question_id=sq.id, domain=c.domain, text=text,
                )

    return {"sub_questions": sub_questions}
