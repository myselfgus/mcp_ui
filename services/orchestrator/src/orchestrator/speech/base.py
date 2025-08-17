from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from dataclasses import dataclass

@dataclass
class WordTiming:
    """Timing information for a spoken word"""
    word: str
    start: float
    end: float

@dataclass
class TranscriptionResult:
    """Result of speech transcription"""
    text: str
    words: Optional[List[WordTiming]] = None

@dataclass
class TranscriptionOptions:
    """Options for speech transcription"""
    language: Optional[str] = None
    model: Optional[str] = None

@dataclass
class SynthesisOptions:
    """Options for speech synthesis"""
    voice: Optional[str] = None
    model: Optional[str] = None
    format: str = "mp3"  # mp3, wav, ogg
    speed: float = 1.0

class SpeechProvider(ABC):
    """Abstract base class for speech providers"""
    name: str

    @abstractmethod
    async def transcribe(self, audio_data: bytes, opts: TranscriptionOptions) -> TranscriptionResult:
        """Transcribe audio data to text"""
        ...

    @abstractmethod
    async def synthesize(self, text: str, opts: SynthesisOptions) -> bytes:
        """Synthesize text to audio"""
        ...

class SpeechRegistry:
    """Registry for speech providers"""
    def __init__(self):
        self._providers: Dict[str, SpeechProvider] = {}

    def register(self, provider: SpeechProvider):
        """Register a speech provider"""
        self._providers[provider.name] = provider

    def get(self, name: str) -> SpeechProvider:
        """Get a speech provider by name"""
        if name not in self._providers:
            raise KeyError(f"Speech provider '{name}' not registered")
        return self._providers[name]

    def list(self) -> List[str]:
        """List available speech provider names"""
        return list(self._providers.keys())

speech_registry = SpeechRegistry()