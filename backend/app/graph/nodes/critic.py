"""Critic: corroborate claims across independent sources via the vector DB.

For each claim, find semantically-similar claims from *other* domains, then have the
LLM judge agree / contradict / unrelated (semantic similarity alone can't tell
corroboration from contradiction). Verdict:
  * agreed by >=1 other domain  -> verified (2+ independent sources)
  * contradicted                -> disputed
  * otherwise                   -> unverified
If a sub-question has too few verified claims and retries remain, flag it for a
stricter re-search.
"""
from __future__ import annotations

from app import llm
from app.config import settings
from app.events import EventType
from app.graph.nodes import active_id_set, get_ctx
from app.graph.state import GraphState
from app.schemas import Adjudication, ClaimStatus, SubQuestion

_ADJ_SYS = (
    "You compare two factual claims from different sources. Decide whether the second "
    "claim AGREES with (corroborates), CONTRADICTS, or is UNRELATED to the first. "
    "Judge the substance, not the wording."
)


async def _adjudicate(a: str, b: str) -> str:
    adj = await llm.structured(
        Adjudication,
        _ADJ_SYS,
        f"Claim A: {a}\nClaim B: {b}",
        fake=lambda: Adjudication(label="agree", reason="fake-mode"),
    )
    return adj.label


async def critic_node(state: GraphState, config) -> dict:
    ctx = get_ctx(config)
    store = ctx.store
    sub_questions: list[SubQuestion] = state["sub_questions"]
    active = active_id_set(state)
    rnd = state.get("research_round", 0)
    can_retry = (rnd + 1) < settings.max_research_rounds

    for sq in sub_questions:
        if sq.id not in active:
            continue

        for claim in sq.claims:
            matches = store.find_corroboration(ctx.run_id, claim) if store else []
            agree, contradict = set(), set()
            for text, domain, _sim in matches:
                if not domain or domain == claim.source_domain:
                    continue
                label = await _adjudicate(claim.text, text)
                if label == "agree":
                    agree.add(domain)
                elif label == "contradict":
                    contradict.add(domain)

            claim.corroborating_domains = sorted(agree)
            claim.contradicting_domains = sorted(contradict)
            if contradict:
                claim.status = ClaimStatus.DISPUTED
            elif agree:
                claim.status = ClaimStatus.VERIFIED
            else:
                claim.status = ClaimStatus.UNVERIFIED

            if claim.status is not ClaimStatus.UNVERIFIED:
                await ctx.emitter.emit(
                    EventType.CORROBORATION,
                    f"[{sq.id}] {claim.status.value}: {claim.text[:70]}"
                    + (f"  (+{len(agree)} domains)" if agree else "")
                    + (f"  (⚠ {len(contradict)} conflict)" if contradict else ""),
                    sub_question_id=sq.id, status=claim.status.value,
                    corroborating=sorted(agree), contradicting=sorted(contradict),
                )

        verified = [c for c in sq.claims if c.status is ClaimStatus.VERIFIED]
        enough = len(verified) >= settings.min_verified_claims_per_subq
        if not enough and can_retry:
            sq.needs_research = True
            sq.strict_filter = True
            sq.retries += 1
            await ctx.emitter.emit(
                EventType.CRITIC_FLAG,
                f"[{sq.id}] only {len(verified)} verified claim(s) — triggering stricter re-search",
                sub_question_id=sq.id, verified=len(verified),
            )
        else:
            sq.needs_research = False
            if not enough:
                await ctx.emitter.emit(
                    EventType.CRITIC_FLAG,
                    f"[{sq.id}] {len(verified)} verified after retries — proceeding with caution",
                    sub_question_id=sq.id, verified=len(verified),
                )

    return {"sub_questions": sub_questions}
