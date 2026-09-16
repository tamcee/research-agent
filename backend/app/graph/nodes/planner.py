"""Planner: decompose the topic into 3–6 focused, searchable sub-questions."""
from __future__ import annotations

from app import llm
from app.config import settings
from app.events import EventType
from app.graph.nodes import get_ctx
from app.graph.state import GraphState
from app.schemas import PlannedSubQuestion, PlannerOutput, SubQuestion

_SYS = (
    "You are a meticulous research planner. Given a research question, decompose it "
    "into 3 to 6 focused, mutually-distinct sub-questions that together fully answer it. "
    "Each sub-question must be independently searchable on the web. For each, provide a "
    "concise search query and whether recent/current sources matter (time_sensitive)."
)


def _user(topic: str) -> str:
    return (
        f"Research question: {topic}\n\n"
        f"Produce between {settings.min_sub_questions} and {settings.max_sub_questions} "
        "sub-questions. Avoid overlap; cover distinct facets (definition/state of the art, "
        "evidence, mechanisms/causes, counterpoints/risks, outlook where relevant)."
    )


def _fake_plan(topic: str) -> PlannerOutput:
    base = topic.rstrip("?").strip()
    seeds = [
        (f"What is the current state of {base}?", f"{base} current state overview 2025"),
        (f"What evidence supports the main claims about {base}?", f"{base} evidence study data"),
        (f"What are the main criticisms or risks regarding {base}?", f"{base} criticism risks limitations"),
        (f"What is the near-term outlook for {base}?", f"{base} outlook forecast expert"),
    ]
    return PlannerOutput(
        sub_questions=[
            PlannedSubQuestion(question=q, search_query=s, time_sensitive=True) for q, s in seeds
        ]
    )


async def planner_node(state: GraphState, config) -> dict:
    ctx = get_ctx(config)
    topic = state["topic"]
    await ctx.emitter.emit(EventType.RUN_STARTED, f'Researching: "{topic}"', topic=topic)

    out = await llm.structured(
        PlannerOutput, _SYS, _user(topic), fake=lambda: _fake_plan(topic)
    )
    planned = list(out.sub_questions)[: settings.max_sub_questions]

    # Guarantee a floor of sub-questions even if the model under-produced.
    while len(planned) < settings.min_sub_questions:
        i = len(planned) + 1
        planned.append(
            PlannedSubQuestion(
                question=f"What else is important to know about {topic.rstrip('?')} (aspect {i})?",
                search_query=f"{topic} key facts {i}",
            )
        )

    sub_questions = [
        SubQuestion(
            id=f"sq{i + 1}",
            question=p.question,
            search_query=p.search_query,
            time_sensitive=p.time_sensitive,
        )
        for i, p in enumerate(planned)
    ]
    await ctx.emitter.emit(
        EventType.PLAN_READY,
        f"Decomposed into {len(sub_questions)} sub-questions",
        sub_questions=[{"id": sq.id, "question": sq.question} for sq in sub_questions],
    )
    return {"sub_questions": sub_questions, "research_round": 0}
