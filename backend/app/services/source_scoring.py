"""Source scoring & the configurable domain-trust tier list.

This is the single place to tune which domains are trusted. Ranking uses:
  * domain tier (primary > major > general > low)
  * a primary-source hint (does the page point at a study/dataset/filing?)
  * recency, only when the sub-question is time-sensitive
  * a small nudge from Tavily's own relevance score

Aggregators/encyclopedias (Wikipedia, Britannica, …) are marked `lead_only`:
usable to find leads, never cited as a final source.
"""
from __future__ import annotations

import re
from datetime import datetime
from urllib.parse import urlparse

from app.schemas import SourceCandidate, SourceTier

# --------------------------------------------------------------------------- #
# CONFIGURABLE TIER LIST — edit these sets to tune trust.
# --------------------------------------------------------------------------- #
PRIMARY_SUFFIXES = (".gov", ".gov.uk", ".edu", ".ac.uk", ".mil", ".int")

PRIMARY_DOMAINS = {
    "arxiv.org", "ncbi.nlm.nih.gov", "pubmed.ncbi.nlm.nih.gov", "nih.gov",
    "who.int", "cdc.gov", "nature.com", "science.org", "sciencedirect.com",
    "nejm.org", "thelancet.com", "cell.com", "pnas.org", "bmj.com",
    "jamanetwork.com", "sec.gov", "bls.gov", "census.gov", "federalreserve.gov",
    "worldbank.org", "imf.org", "oecd.org", "europa.eu", "doi.org",
}

MAJOR_DOMAINS = {
    "reuters.com", "apnews.com", "bbc.com", "bbc.co.uk", "nytimes.com",
    "wsj.com", "washingtonpost.com", "economist.com", "ft.com", "bloomberg.com",
    "theguardian.com", "npr.org", "pbs.org", "propublica.org", "cnbc.com",
    "politico.com", "axios.com", "nationalgeographic.com", "smithsonianmag.com",
}

# lead_only -> can inform search, never cited in the final report
LEAD_ONLY_DOMAINS = {
    "wikipedia.org", "wikiwand.com", "britannica.com", "quora.com",
    "reddit.com", "answers.com",
}

LOW_DOMAINS = {
    "medium.com", "substack.com", "blogspot.com", "wordpress.com",
    "tumblr.com", "buzzfeed.com",
}

# Used to tighten a stricter re-search (kept for callers that want an allowlist).
TRUSTED_ALLOWLIST = sorted(PRIMARY_DOMAINS | MAJOR_DOMAINS)

_TIER_BASE = {
    SourceTier.PRIMARY: 1.0,
    SourceTier.MAJOR: 0.75,
    SourceTier.GENERAL: 0.5,
    SourceTier.LOW: 0.2,
}

_PRIMARY_HINT_TOKENS = (
    "doi.org", "doi:", "arxiv", "clinicaltrials", "dataset", "working paper",
    "peer-reviewed", "peer reviewed", "published in", "et al", "preprint",
    "study finds", "according to the study", "sec filing", "10-k",
)


def _host(url: str) -> str:
    return (urlparse(url).hostname or "").lower().lstrip(".")


def domain_of(url: str) -> str:
    """Public hostname accessor (e.g. 'www.bbc.com'), used as the source's domain key."""
    return _host(url)


def _matches(host: str, domains: set[str]) -> bool:
    return any(host == d or host.endswith("." + d) for d in domains)


def classify(url: str) -> tuple[SourceTier, bool]:
    """Return (tier, lead_only) for a URL."""
    host = _host(url)
    if not host:
        return SourceTier.GENERAL, False
    if _matches(host, LEAD_ONLY_DOMAINS):
        return SourceTier.LOW, True
    if host.endswith(PRIMARY_SUFFIXES) or _matches(host, PRIMARY_DOMAINS):
        return SourceTier.PRIMARY, False
    if _matches(host, MAJOR_DOMAINS):
        return SourceTier.MAJOR, False
    if _matches(host, LOW_DOMAINS):
        return SourceTier.LOW, False
    return SourceTier.GENERAL, False


def primary_source_hint(url: str, snippet: str) -> bool:
    host = _host(url)
    if _matches(host, {"arxiv.org", "doi.org", "pubmed.ncbi.nlm.nih.gov", "ncbi.nlm.nih.gov"}):
        return True
    text = f"{url} {snippet}".lower()
    return any(tok in text for tok in _PRIMARY_HINT_TOKENS)


def _recency_bonus(published_date: str | None) -> float:
    if not published_date:
        return 0.0
    m = re.search(r"(19|20)\d{2}", published_date)
    if not m:
        return 0.0
    year = int(m.group(0))
    age = datetime.now().year - year
    if age <= 1:
        return 0.2
    if age <= 3:
        return 0.1
    return 0.0


def score(c: SourceCandidate, time_sensitive: bool) -> float:
    """Compute a vetting score in ~[0, 1.45]. Higher = extract first."""
    s = _TIER_BASE.get(c.tier, 0.4)
    if c.primary_source_hint:
        s += 0.15
    if time_sensitive:
        s += _recency_bonus(c.published_date)
    s += 0.1 * max(0.0, min(1.0, c.tavily_score))
    if c.lead_only:  # never let a lead outrank a citable source
        s = min(s, 0.05)
    return round(s, 4)
