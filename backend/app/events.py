"""Progress events emitted by graph nodes and streamed to the frontend.

Nodes never print or touch a socket directly — they call `emitter.emit(...)`.
The sink decides where events go (stdout for the CLI, an asyncio.Queue for SSE),
so the same graph drives both the CLI harness and the API unchanged.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Awaitable, Callable, Optional


class EventType(str, Enum):
    RUN_STARTED = "run_started"
    PLAN_READY = "plan_ready"
    SUBQ_STARTED = "subq_started"
    SOURCE_FOUND = "source_found"
    VETTED = "vetted"
    SOURCE_SELECTED = "source_selected"
    EXTRACTING = "extracting"
    EXTRACTED = "extracted"
    CLAIM_ADDED = "claim_added"
    CORROBORATION = "corroboration"
    CRITIC_FLAG = "critic_flag"
    RESEARCH_ROUND = "research_round"
    WRITING = "writing"
    REPORT_READY = "report_ready"
    ERROR = "error"
    DONE = "done"


@dataclass
class Event:
    type: EventType
    message: str = ""
    data: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {"type": self.type.value, "message": self.message, "data": self.data}

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), ensure_ascii=False)


EmitFn = Callable[[Event], Awaitable[None]]


class Emitter:
    """Wraps an async sink. A missing sink makes emit() a no-op."""

    def __init__(self, sink: Optional[EmitFn] = None):
        self._sink = sink

    async def emit(self, event_type: EventType, message: str = "", **data: Any) -> None:
        if self._sink is None:
            return
        await self._sink(Event(type=event_type, message=message, data=data))


# --- A simple stdout sink for the CLI harness ---

_ICONS = {
    EventType.RUN_STARTED: "▶",
    EventType.PLAN_READY: "☰",
    EventType.SUBQ_STARTED: "?",
    EventType.SOURCE_FOUND: "·",
    EventType.VETTED: "✓",
    EventType.SOURCE_SELECTED: "»",
    EventType.EXTRACTING: "↓",
    EventType.EXTRACTED: "▤",
    EventType.CLAIM_ADDED: "•",
    EventType.CORROBORATION: "≈",
    EventType.CRITIC_FLAG: "⚑",
    EventType.RESEARCH_ROUND: "↻",
    EventType.WRITING: "✎",
    EventType.REPORT_READY: "■",
    EventType.ERROR: "✗",
    EventType.DONE: "●",
}


async def cli_sink(ev: Event) -> None:
    icon = _ICONS.get(ev.type, "·")
    print(f"  {icon} {ev.message}")
