"""Tavily web search. Returns raw SourceCandidates (unscored).

Fake mode returns a deterministic spread of sources across tiers so the rest of
the pipeline (vetting, corroboration, verified/unverified) has realistic input.
"""
from __future__ import annotations

from urllib.parse import quote_plus

from app.config import settings
from app.schemas import SourceCandidate

# (url template, display name) spanning primary / major / low / lead-only tiers.
_FAKE_SITES = [
    ("https://www.ncbi.nlm.nih.gov/pmc/articles/PMC{n}/", "NCBI PMC", 0.93, "2025-02-10"),
    ("https://arxiv.org/abs/24{n}.11111", "arXiv", 0.90, "2025-06-01"),
    ("https://www.reuters.com/article/{q}", "Reuters", 0.86, "2025-09-15"),
    ("https://www.bbc.com/news/{q}", "BBC News", 0.82, "2025-08-20"),
    ("https://insights.medium.com/{q}", "Industry blog", 0.60, "2024-03-02"),
    ("https://en.wikipedia.org/wiki/{q}", "Wikipedia", 0.70, None),
]


def _fake_search(query: str, max_results: int) -> list[SourceCandidate]:
    slug = quote_plus(query.lower())[:40] or "topic"
    out: list[SourceCandidate] = []
    for i, (tmpl, name, sc, date) in enumerate(_FAKE_SITES[:max_results]):
        url = tmpl.format(n=f"{7000 + i}", q=slug)
        out.append(
            SourceCandidate(
                url=url,
                title=f"{name}: {query}",
                snippet=(
                    f"Findings on {query}. A recent study finds consistent evidence; "
                    f"see the dataset and peer-reviewed analysis (doi.org)."
                ),
                published_date=date,
                tavily_score=sc,
            )
        )
    return out


async def search(
    query: str,
    max_results: int | None = None,
    *,
    include_domains: list[str] | None = None,
    days: int | None = None,
) -> list[SourceCandidate]:
    n = max_results or settings.candidates_per_subq
    if settings.fake_mode:
        return _fake_search(query, n)

    from tavily import AsyncTavilyClient

    client = AsyncTavilyClient(api_key=settings.tavily_api_key)
    kwargs: dict = {"search_depth": "advanced", "max_results": n}
    if include_domains:
        kwargs["include_domains"] = include_domains
    if days:
        kwargs["days"] = days
    resp = await client.search(query, **kwargs)

    out: list[SourceCandidate] = []
    for r in resp.get("results", []):
        out.append(
            SourceCandidate(
                url=r.get("url", ""),
                title=r.get("title", ""),
                snippet=r.get("content", ""),
                published_date=r.get("published_date"),
                tavily_score=float(r.get("score", 0.0) or 0.0),
            )
        )
    return [c for c in out if c.url]
