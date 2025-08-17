from __future__ import annotations
import base64
from .base import SpeechProvider, speech_registry
from ..config import settings


class OpenAISpeechProvider(SpeechProvider):
    name = "openai"

    async def transcribe(self, audio_bytes: bytes, language: str | None = None):  # type: ignore[override]
        if not settings.openai_api_key:
            return {"text": "(missing OPENAI_API_KEY - stub)", "provider": self.name}
        # Stubbed – avoids network call in test environment
        return {"text": "(stub transcription)", "language": language or "auto", "provider": self.name}

    async def synthesize(self, text: str, voice: str | None = None, format: str = "mp3"):  # type: ignore[override]
        fake_audio = b"FAKE_AUDIO_BYTES"
        b64 = base64.b64encode(fake_audio).decode()
        return {"audio_base64": b64, "voice": voice or settings.tts_voice, "format": format, "provider": self.name, "chars": len(text)}


speech_registry.register(OpenAISpeechProvider())
