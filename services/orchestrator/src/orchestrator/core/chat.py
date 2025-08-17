from __future__ import annotations
from typing import AsyncIterator, Any, List, Dict
from ..providers.base import provider_registry
import logging
from ..config import settings
from ..tools.base import tool_registry

logger = logging.getLogger("orchestrator.tools")

async def run_tools(tool_calls: List[Dict[str, Any]]):
    for call in tool_calls:
        name = call["name"]
        params = call.get("params", {})
        tool = tool_registry.get(name)
        result = await tool.run(**params)
    logger.info("tool_run", extra={"tool": name})
        yield {"type": "tool_result", "tool": name, "data": result}

async def chat_stream(messages: List[Dict[str, str]], model: str | None = None, provider: str = "openai", tool_calls: List[Dict[str, Any]] | None = None) -> AsyncIterator[Dict[str, Any]]:
    if tool_calls:
        async for tr in run_tools(tool_calls):
            yield tr
    prov = provider_registry.get(provider)
    async for chunk in prov.stream_chat(messages, model=model or settings.default_model):
        yield chunk
    yield {"type": "end", "reason": "completed"}
