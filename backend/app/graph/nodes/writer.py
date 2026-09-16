"""Writer: synthesize the vetted, corroborated claims into an essay-quality report.

Structure (title, executive summary, one section per sub-question in prose, synthesis)
is enforced by the prompt; citation integrity is enforced in code — indices are
assigned here and the Sources section is appended deterministically, so citations are
always correct even if the model's inline markers drift. Verified/unverified/disputed
are marked typographically ([n], [n]†, [n]‡), never with badges.
"""
from __future__ import annotations

from app import llm
from app.events import EventType
from app.graph.nodes import get_ctx
from app.graph.state import GraphState
from app.schemas import Citation, ClaimStatus, Report, SubQuestion

_SYS = (
    "You are an expert research writer. Write a clear, precise, essay-quality report in "
    "flowing prose. Rules:\n"
    "- First line: '# <concise title>'.\n"
    "- Then a 2–4 sentence executive summary stating the core answer up front.\n"
    "- Then one '## ' section per sub-question, in order, written as connected paragraphs "
    "that synthesize the findings into a narrative — not bullet lists.\n"
    "- End with a '## Synthesis' section tying findings back to the research question.\n"
    "- Cite using the EXACT bracketed numbers provided (e.g. [1]). Never invent numbers.\n"
    "- Mark an unverified (single-source) claim with a trailing dagger right after its "
    "citation, e.g. [2]†. Mark a disputed claim with a double dagger, e.g. [3]‡.\n"
    "- Plain, precise language. No filler, no throat-clearing (never 'In today's world'), "
    "do not restate the question back, no marketing tone.\n"
    "- Do NOT write a Sources section; it is appended automatically.\n"
    "Output GitHub-flavored Markdown only."
)

_MARK = {ClaimStatus.VERIFIED: "", ClaimStatus.UNVERIFIED: " (mark with †)", ClaimStatus.DISPUTED: " (mark with ‡)"}
_GLYPH = {ClaimStatus.VERIFIED: "", ClaimStatus.UNVERIFIED: "†", ClaimStatus.DISPUTED: "‡"}


def _assign_citations(sub_questions: list[SubQuestion]) -> list[Citation]:
    citations: list[Citation] = []
    index_by_url: dict[str, int] = {}
    for sq in sub_questions:
        for c in sq.selected_sources():
            if c.lead_only:
                continue
            if not any(cl.source_url == c.url for cl in sq.claims):
                continue
            if c.url not in index_by_url:
                idx = len(citations) + 1
                index_by_url[c.url] = idx
                c.citation_index = idx
                citations.append(
                    Citation(index=idx, url=c.url, title=c.title or c.domain, domain=c.domain, tier=int(c.tier))
                )
    for sq in sub_questions:
        for cl in sq.claims:
            cl.citation_index = index_by_url.get(cl.source_url)
    return citations


def _briefing(topic: str, sub_questions: list[SubQuestion]) -> str:
    lines = [f"Research question: {topic}", "", "Findings by sub-question (use these citation numbers exactly):"]
    for sq in sub_questions:
        lines.append(f"\n### {sq.question}")
        cited = [cl for cl in sq.claims if cl.citation_index]
        if not cited:
            lines.append("- (no well-sourced findings; treat briefly and cautiously)")
        for cl in cited:
            lines.append(f"- [{cl.citation_index}]{_MARK[cl.status]}: {cl.text}")
    return "\n".join(lines)


def _fake_body(topic: str, sub_questions: list[SubQuestion]) -> str:
    title = topic.rstrip("?").strip()
    n = len(sub_questions)
    parts = [
        f"# {title}",
        f"This report examines {title.lower()}. Across {n} lines of inquiry the evidence is "
        "largely consistent, though several points rest on a single source and are flagged as "
        "provisional. The corroborated findings below form the basis of the answer.",
    ]
    for sq in sub_questions:
        parts.append(f"## {sq.question}")
        sentences = [
            f"{cl.text} [{cl.citation_index}]{_GLYPH[cl.status]}"
            for cl in sq.claims
            if cl.citation_index
        ]
        parts.append(
            " ".join(sentences)
            or "The available sources did not yield strongly corroborated findings for this question."
        )
    parts.append("## Synthesis")
    parts.append(
        f"Taken together, the findings sketch a coherent picture of {title.lower()}. "
        "Corroborated claims anchor the answer, while daggered items remain provisional pending "
        "further independent sources."
    )
    return "\n\n".join(parts)


def _assemble(body: str, citations: list[Citation], v: int, u: int, d: int) -> str:
    out = [body.strip()]
    if citations:
        src = ["## Sources"]
        for c in citations:
            src.append(f"{c.index}. [{c.title}]({c.url}) — {c.domain} (tier {c.tier})")
        out.append("\n".join(src))
    out.append(
        "---\n\n"
        "† unverified — asserted by a single source.  ‡ disputed — independent sources conflict.\n\n"
        f"*{v} verified · {u} unverified · {d} disputed claims across all sub-questions.*"
    )
    return "\n\n".join(out)


async def writer_node(state: GraphState, config) -> dict:
    ctx = get_ctx(config)
    await ctx.emitter.emit(EventType.WRITING, "Synthesizing the report…")
    topic = state["topic"]
    sub_questions: list[SubQuestion] = state["sub_questions"]

    citations = _assign_citations(sub_questions)
    all_claims = [cl for sq in sub_questions for cl in sq.claims]
    v = sum(1 for cl in all_claims if cl.status is ClaimStatus.VERIFIED)
    u = sum(1 for cl in all_claims if cl.status is ClaimStatus.UNVERIFIED)
    d = sum(1 for cl in all_claims if cl.status is ClaimStatus.DISPUTED)

    body = await llm.complete(
        _SYS, _briefing(topic, sub_questions), fake=_fake_body(topic, sub_questions), temperature=0.4
    )
    markdown = _assemble(body, citations, v, u, d)
    report = Report(
        topic=topic, markdown=markdown, citations=citations,
        verified_count=v, unverified_count=u, disputed_count=d,
    )
    await ctx.emitter.emit(
        EventType.REPORT_READY, "Report ready",
        verified=v, unverified=u, disputed=d,
        citations=[c.model_dump() for c in citations],
    )
    return {"report": report}
