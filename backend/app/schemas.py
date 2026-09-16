"""Domain models (pydantic) shared across the pipeline, API, and LLM I/O.

Two groups:
  * LLM-facing schemas (PlannerOutput, DistilledClaims, Adjudication) — used with
    structured output. Kept minimal and Literal-typed so tool-calling is reliable.
  * Runtime/state models (SourceCandidate, Claim, SubQuestion, Report).
"""
from __future__ import annotations

from enum import Enum, IntEnum
from typing import Literal, Optional

from pydantic import BaseModel, Field


# --------------------------------------------------------------------------- #
# LLM-facing structured outputs
# --------------------------------------------------------------------------- #
class PlannedSubQuestion(BaseModel):
    question: str = Field(..., description="A focused, self-contained sub-question.")
    search_query: str = Field(..., description="A concise web-search query for it.")
    time_sensitive: bool = Field(
        False, description="True if recent/current sources matter for this sub-question."
    )


class PlannerOutput(BaseModel):
    sub_questions: list[PlannedSubQuestion] = Field(default_factory=list)


class DistilledClaims(BaseModel):
    claims: list[str] = Field(
        default_factory=list,
        description="Atomic, self-contained factual claims, each verifiable on its own.",
    )


class Adjudication(BaseModel):
    label: Literal["agree", "contradict", "unrelated"]
    reason: str = ""


# --------------------------------------------------------------------------- #
# Runtime / state models
# --------------------------------------------------------------------------- #
class SourceTier(IntEnum):
    PRIMARY = 1   # .gov, .edu, arXiv, PubMed, official filings, top journals
    MAJOR = 2     # major established outlets
    GENERAL = 3   # generally reputable sites
    LOW = 4       # blogs, aggregators, content farms


class ClaimStatus(str, Enum):
    VERIFIED = "verified"        # corroborated across 2+ independent domains
    UNVERIFIED = "unverified"    # asserted by a single source
    DISPUTED = "disputed"        # independent sources contradict


class SourceCandidate(BaseModel):
    url: str
    title: str = ""
    snippet: str = ""
    published_date: Optional[str] = None
    tavily_score: float = 0.0

    domain: str = ""
    tier: SourceTier = SourceTier.GENERAL
    lead_only: bool = False          # aggregator (e.g. Wikipedia): a lead, never cited
    primary_source_hint: bool = False
    vet_score: float = 0.0
    selected: bool = False           # chosen for full-text extraction
    extracted: bool = False
    citation_index: Optional[int] = None

    # Full text is kept in state for the pipeline but stripped before it hits the API.
    extracted_text: Optional[str] = Field(default=None, exclude=True)

    def public(self) -> dict:
        return self.model_dump(exclude={"extracted_text"})


class Claim(BaseModel):
    id: str
    sub_question_id: str
    text: str
    source_url: str
    source_domain: str
    status: ClaimStatus = ClaimStatus.UNVERIFIED
    corroborating_domains: list[str] = Field(default_factory=list)
    contradicting_domains: list[str] = Field(default_factory=list)
    citation_index: Optional[int] = None


class SubQuestion(BaseModel):
    id: str
    question: str
    search_query: str
    time_sensitive: bool = False

    candidates: list[SourceCandidate] = Field(default_factory=list)
    claims: list[Claim] = Field(default_factory=list)

    retries: int = 0
    needs_research: bool = False     # critic flagged; drives the re-search loop
    strict_filter: bool = False      # tighten domain tier on the next search

    def selected_sources(self) -> list[SourceCandidate]:
        return [c for c in self.candidates if c.selected]


class Citation(BaseModel):
    index: int
    url: str
    title: str
    domain: str
    tier: int


class Report(BaseModel):
    topic: str
    markdown: str = ""
    citations: list[Citation] = Field(default_factory=list)
    verified_count: int = 0
    unverified_count: int = 0
    disputed_count: int = 0
