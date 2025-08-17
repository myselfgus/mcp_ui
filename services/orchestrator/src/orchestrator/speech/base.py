from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Any, Dict


class SpeechProvider(ABC):
    name: str

    @abstractmethod
    async def transcribe(self, audio_bytes: bytes, language: str | None = None) -> Dict[str, Any]:
        """Return transcription text and metadata."""

    @abstractmethod
    async def synthesize(self, text: str, voice: str | None = None, format: str = "mp3") -> Dict[str, Any]:
        """Return synthesized audio bytes (base64) and metadata."""


class SpeechRegistry:
    def __init__(self):
        self._providers: dict[str, SpeechProvider] = {}

    def register(self, provider: SpeechProvider):
        self._providers[provider.name] = provider

    def get(self, name: str) -> SpeechProvider:
        if name not in self._providers:
            raise KeyError(f"Speech provider '{name}' not registered")
        return self._providers[name]

    def list(self):  # pragma: no cover - simple
        return list(self._providers.keys())


speech_registry = SpeechRegistry()
