#!/usr/bin/env python3
"""End-to-end CLI harness for the research pipeline (build-order step 1).

Usage:
    python scripts/run_cli.py "your research question"
    FAKE_MODE=1 python scripts/run_cli.py "your research question"   # no API keys

Streams live progress, prints the final report, and writes it to ./report.md.
"""
from __future__ import annotations

import argparse
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))  # put backend/ on sys.path

from app.config import settings  # noqa: E402
from app.events import Emitter, cli_sink  # noqa: E402
from app.graph.build import run_research  # noqa: E402

RULE = "═" * 72


async def _run(topic: str, out_path: str) -> int:
    try:
        report = await run_research(topic, emitter=Emitter(cli_sink))
    except Exception as exc:  # noqa: BLE001
        print(f"\n[✗] Pipeline failed: {type(exc).__name__}: {exc}", file=sys.stderr)
        return 1
    if report is None:
        print("\n[✗] No report was produced.", file=sys.stderr)
        return 1

    print(f"\n{RULE}\n")
    print(report.markdown)
    print(f"\n{RULE}")
    print(
        f"claims — verified={report.verified_count} "
        f"unverified={report.unverified_count} disputed={report.disputed_count} | "
        f"citations={len(report.citations)}"
    )
    Path(out_path).write_text(report.markdown, encoding="utf-8")
    print(f"report written to {out_path}")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Run the research-to-report pipeline.")
    ap.add_argument("topic", nargs="+", help="the research question")
    ap.add_argument("-o", "--out", default="report.md", help="output markdown path")
    args = ap.parse_args()
    topic = " ".join(args.topic).strip()

    missing = settings.missing_keys()
    if missing:
        print(
            f"[!] Missing {', '.join(missing)}. Add them to backend/.env, "
            "or run with FAKE_MODE=1 for a stubbed offline run.",
            file=sys.stderr,
        )
        return 2

    mode = "FAKE (stubbed Groq + Tavily)" if settings.fake_mode else f"LIVE · model={settings.groq_model}"
    print(f"\n[research-agent] mode={mode}\nTopic: {topic}\n")
    return asyncio.run(_run(topic, args.out))


if __name__ == "__main__":
    raise SystemExit(main())
