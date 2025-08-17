from __future__ import annotations
import os
from typing import AsyncIterator, Any
import httpx
from .base import ChatProvider, provider_registry
from ..config import settings

OPENAI_API_BASE = os.environ.get("OPENAI_API_BASE", "https://api.openai.com/v1")

class OpenAIProvider(ChatProvider):
    name = "openai"

    async def stream_chat(self, messages: list[dict[str, str]], model: str | None = None) -> AsyncIterator[dict[str, Any]]:
        api_key = settings.openai_api_key or os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("Missing OPENAI_API_KEY")
        model_name = model or settings.default_model
        payload = {
            "model": model_name,
            "messages": messages,
            "stream": True,
        }
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(f"{OPENAI_API_BASE}/chat/completions", json=payload, headers=headers, timeout=None)
            resp.raise_for_status()
            # Using streaming chunks with SSE-like data lines (OpenAI style)
            async for line in resp.aiter_lines():
                if not line:
                    continue
                if line.startswith("data: "):
                    data = line[len("data: "):].strip()
                    if data == "[DONE]":
                        break
                    yield {"type": "token", "token": data}

provider_registry.register(OpenAIProvider())
