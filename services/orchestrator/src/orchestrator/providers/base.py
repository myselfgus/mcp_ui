from __future__ import annotations
from abc import ABC, abstractmethod
from typing import AsyncIterator, Dict, Any

class ChatProvider(ABC):
    name: str

    @abstractmethod
    async def stream_chat(self, messages: list[dict[str, str]], model: str | None = None) -> AsyncIterator[dict[str, Any]]:
        ...

class ProviderRegistry:
    def __init__(self):
        self._providers: dict[str, ChatProvider] = {}

    def register(self, provider: ChatProvider):
        self._providers[provider.name] = provider

    def get(self, name: str) -> ChatProvider:
        if name not in self._providers:
            raise KeyError(f"Provider '{name}' not registered")
        return self._providers[name]

provider_registry = ProviderRegistry()
