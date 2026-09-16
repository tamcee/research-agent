"""Per-run context pulled from LangGraph's config. Nodes call get_ctx(config)."""
from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING, Optional

from app.events import Emitter

if TYPE_CHECKING:
    from app.services.vectorstore import VectorStore


@dataclass
class RunCtx:
    emitter: Emitter
    run_id: str
    store: "Optional[VectorStore]"


def get_ctx(config) -> RunCtx:
    cfg = {}
    if isinstance(config, dict):
        cfg = config.get("configurable", {}) or {}
    return RunCtx(
        emitter=cfg.get("emitter") or Emitter(),
        run_id=cfg.get("run_id") or "run",
        store=cfg.get("store"),
    )


def active_id_set(state) -> set[str]:
    ids = state.get("active_ids")
    if ids:
        return set(ids)
    return {sq.id for sq in state.get("sub_questions", [])}
