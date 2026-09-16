"""Full-text extraction: trafilatura first, BeautifulSoup fallback.

Runs only on top-ranked sources (decided by the vet node). Network + parsing are
offloaded to threads so the search/extract fan-out stays concurrent.
"""
from __future__ import annotations

import asyncio

import httpx

from app.config import settings

_MAX_CHARS = 12_000
_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/122.0 Safari/537.36 ResearchAgent/0.1"
    )
}


def _parse(html: str) -> str | None:
    import trafilatura

    text = trafilatura.extract(html, include_comments=False, include_tables=False)
    if text and text.strip():
        return text
    # Fallback: strip tags with BeautifulSoup.
    from bs4 import BeautifulSoup

    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "noscript", "header", "footer", "nav"]):
        tag.decompose()
    text = soup.get_text(" ", strip=True)
    return text or None


async def extract(url: str) -> tuple[str | None, bool]:
    """Return (text, ok). `ok` is False on network/parse failure."""
    if settings.fake_mode:
        return f"Fake extracted body for {url}. Placeholder full text.", True

    try:
        async with httpx.AsyncClient(
            timeout=settings.request_timeout_s, follow_redirects=True, headers=_HEADERS
        ) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            html = resp.text
        text = await asyncio.to_thread(_parse, html)
    except Exception:
        return None, False

    if not text:
        return None, False
    return text[:_MAX_CHARS], True
