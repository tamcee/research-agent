"""Provider-agnostic LLM wrapper.

The rest of the app calls only `complete()` and `structured()`. To swap Groq for
another provider, change *this file only* (and requirements). Nodes never import
langchain directly.
"""
from __future__ import annotations

import os
from typing import Callable, Optional, TypeVar

from langchain_core.messages import HumanMessage, SystemMessage
from pydantic import BaseModel
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import settings

T = TypeVar("T", bound=BaseModel)

_models: dict[float, object] = {}


def _get_model(temperature: float):
    """Lazily build + cache a chat model per temperature."""
    if temperature not in _models:
        # --- provider-specific bit #1 (of 2) ---
        from langchain_groq import ChatGroq

        if settings.groq_api_key:
            os.environ["GROQ_API_KEY"] = settings.groq_api_key
        _models[temperature] = ChatGroq(model=settings.groq_model, temperature=temperature)
    return _models[temperature]


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=8), reraise=True)
async def _ainvoke(runnable, messages):
    return await runnable.ainvoke(messages)


async def complete(
    system: str,
    user: str,
    *,
    fake: Optional[str] = None,
    temperature: Optional[float] = None,
) -> str:
    """Free-form completion. In fake mode returns `fake` verbatim."""
    if settings.fake_mode:
        return fake or ""
    temp = settings.llm_temperature if temperature is None else temperature
    model = _get_model(temp)
    resp = await _ainvoke(model, [SystemMessage(content=system), HumanMessage(content=user)])
    return resp.content if isinstance(resp.content, str) else str(resp.content)


async def structured(
    schema: type[T],
    system: str,
    user: str,
    *,
    fake: Optional[Callable[[], T]] = None,
    temperature: Optional[float] = None,
) -> T:
    """Structured output validated against `schema`. In fake mode returns `fake()`."""
    if settings.fake_mode:
        return fake() if fake is not None else schema()
    temp = settings.llm_temperature if temperature is None else temperature
    # --- provider-specific bit #2 (of 2): structured-output method ---
    model = _get_model(temp).with_structured_output(schema)
    return await _ainvoke(model, [SystemMessage(content=system), HumanMessage(content=user)])
