"""LangGraph state. total=False so nodes return partial updates (overwrite merge)."""
from __future__ import annotations

from typing import Optional, TypedDict

from app.schemas import Report, SubQuestion


class GraphState(TypedDict, total=False):
    topic: str
    sub_questions: list[SubQuestion]
    active_ids: list[str]        # sub-question ids being (re)processed this round
    research_round: int          # 0 = initial pass; >0 = stricter re-searches
    report: Optional[Report]
    errors: list[str]
