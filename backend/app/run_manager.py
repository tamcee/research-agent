"""In-memory run registry + event pub/sub for streaming.

One process, no DB (v1). Each run keeps its full event trace and final report in
memory. SSE subscribers get the buffered trace replayed on connect, then live events
— so a client that connects late (container cold start, a refresh) sees the
whole run. Replay + registration happen in one synchronous section, so in asyncio's
single thread no event is dropped or duplicated between them.
"""
from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from typing import Optional
from uuid import uuid4

from app.events import Emitter, Event, EventType
from app.graph.build import run_research

_DONE = object()  # stream sentinel


@dataclass
class RunRecord:
    id: str
    topic: str
    status: str = "running"  # running | done | error
    events: list[dict] = field(default_factory=list)
    report: Optional[dict] = None
    subscribers: list[asyncio.Queue] = field(default_factory=list)
    task: Optional[asyncio.Task] = None


class RunManager:
    def __init__(self) -> None:
        self._runs: dict[str, RunRecord] = {}

    def get(self, run_id: str) -> Optional[RunRecord]:
        return self._runs.get(run_id)

    def start(self, topic: str) -> RunRecord:
        rec = RunRecord(id=uuid4().hex, topic=topic)
        self._runs[rec.id] = rec
        rec.task = asyncio.create_task(self._run(rec))
        return rec

    async def _emit(self, rec: RunRecord, ev: Event) -> None:
        # No await between append and fan-out -> atomic w.r.t. subscribe().
        d = ev.to_dict()
        rec.events.append(d)
        for q in rec.subscribers:
            q.put_nowait(d)

    async def _run(self, rec: RunRecord) -> None:
        emitter = Emitter(lambda ev: self._emit(rec, ev))
        try:
            report = await run_research(rec.topic, emitter=emitter, run_id=rec.id)
            if report is not None:
                rec.report = report.model_dump()
                rec.status = "done"
                await self._emit(rec, Event(EventType.DONE, "done", {"report": rec.report}))
            else:
                rec.status = "error"
                await self._emit(rec, Event(EventType.ERROR, "No report was produced."))
        except Exception as exc:  # noqa: BLE001
            rec.status = "error"
            await self._emit(rec, Event(EventType.ERROR, f"{type(exc).__name__}: {exc}"))
        finally:
            for q in rec.subscribers:
                q.put_nowait(_DONE)
            rec.subscribers.clear()

    def subscribe(self, rec: RunRecord) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue()
        for ev in rec.events:  # replay buffered trace (synchronous section)
            q.put_nowait(ev)
        if rec.status == "running":
            rec.subscribers.append(q)
        else:
            q.put_nowait(_DONE)
        return q

    def unsubscribe(self, rec: RunRecord, q: asyncio.Queue) -> None:
        if q in rec.subscribers:
            rec.subscribers.remove(q)


DONE = _DONE
manager = RunManager()
