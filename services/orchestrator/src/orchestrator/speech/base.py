from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Dict, Any


class SpeechProvider(ABC):
    """Abstract base class for speech providers (STT/TTS)."""
    name: str

    @abstractmethod
    async def transcribe(self, audio_bytes: bytes, language: str | None = None) -> Dict[str, Any]:
        """
        Transcribe audio to text.
        
        Args:
            audio_bytes: Raw audio data
            language: Optional language hint (e.g., 'en', 'es')
            
        Returns:
            Dictionary with 'text' key and optionally 'words' with timing info
        """
        ...

    @abstractmethod
    async def synthesize(self, text: str, voice: str | None = None, format: str = "mp3") -> bytes:
        """
        Synthesize text to speech.
        
        Args:
            text: Text to synthesize
            voice: Optional voice identifier
            format: Audio format ('mp3', 'wav', 'ogg')
            
        Returns:
            Raw audio bytes
        """
        ...


class SpeechRegistry:
    def __init__(self):
        self._providers: Dict[str, SpeechProvider] = {}

    def register(self, provider: SpeechProvider):
        self._providers[provider.name] = provider

    def get(self, name: str) -> SpeechProvider:
        if name not in self._providers:
            raise KeyError(f"Speech provider '{name}' not registered")
        return self._providers[name]

    def list(self) -> list[str]:
        return list(self._providers.keys())


speech_registry = SpeechRegistry()