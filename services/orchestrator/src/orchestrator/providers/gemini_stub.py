from __future__ import annotations
from typing import AsyncIterator, Any
from .base import ChatProvider, provider_registry

class GeminiStubProvider(ChatProvider):
    name = "gemini"

    async def stream_chat(self, messages: list[dict[str, str]], model: str | None = None) -> AsyncIterator[dict[str, Any]]:
        # Simple echo stub for now
        user_content = " ".join(m["content"] for m in messages if m["role"] == "user")
        for piece in [f"[gemini-stub] {user_content}"]:
            yield {"type": "token", "token": piece}

provider_registry.register(GeminiStubProvider())
