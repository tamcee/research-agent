"""Assemble and run the LangGraph state machine.

    planner → search → vet → extract → embed → critic ─┬─(needs re-search)→ escalate → search …
                                                        └─(done)──────────→ writer → END
"""
from __future__ import annotations

from uuid import uuid4

from langgraph.graph import END, START, StateGraph

from app.events import Emitter, EventType
from app.graph.nodes import get_ctx
from app.graph.nodes.critic import critic_node
from app.graph.nodes.embed import embed_node
from app.graph.nodes.extract import extract_node
from app.graph.nodes.planner import planner_node
from app.graph.nodes.search import search_node
from app.graph.nodes.vet import vet_node
from app.graph.nodes.writer import writer_node
from app.graph.state import GraphState
from app.schemas import Report
from app.services.vectorstore import VectorStore


async def escalate_node(state: GraphState, config) -> dict:
    ctx = get_ctx(config)
    rnd = state.get("research_round", 0) + 1
    flagged = [sq.id for sq in state["sub_questions"] if sq.needs_research]
    await ctx.emitter.emit(
        EventType.RESEARCH_ROUND,
        f"Re-search round {rnd}: {len(flagged)} sub-question(s) with stricter (primary/major) filters",
        round=rnd, sub_question_ids=flagged,
    )
    return {"research_round": rnd}


def _route_after_critic(state: GraphState) -> str:
    return "escalate" if any(sq.needs_research for sq in state["sub_questions"]) else "writer"


def build_graph():
    g = StateGraph(GraphState)
    g.add_node("planner", planner_node)
    g.add_node("search", search_node)
    g.add_node("vet", vet_node)
    g.add_node("extract", extract_node)
    g.add_node("embed", embed_node)
    g.add_node("critic", critic_node)
    g.add_node("escalate", escalate_node)
    g.add_node("writer", writer_node)

    g.add_edge(START, "planner")
    g.add_edge("planner", "search")
    g.add_edge("search", "vet")
    g.add_edge("vet", "extract")
    g.add_edge("extract", "embed")
    g.add_edge("embed", "critic")
    g.add_conditional_edges("critic", _route_after_critic, {"escalate": "escalate", "writer": "writer"})
    g.add_edge("escalate", "search")
    g.add_edge("writer", END)
    return g.compile()


GRAPH = build_graph()


async def run_research(topic: str, emitter: Emitter | None = None, run_id: str | None = None) -> Report | None:
    """Run the full pipeline for a topic. Returns the final Report (or None on failure)."""
    run_id = run_id or uuid4().hex
    store = VectorStore()
    state: GraphState = {"topic": topic, "sub_questions": [], "research_round": 0, "errors": []}
    config = {
        "configurable": {"emitter": emitter or Emitter(), "run_id": run_id, "store": store},
        "recursion_limit": 50,
    }
    result = await GRAPH.ainvoke(state, config=config)
    return result.get("report")
