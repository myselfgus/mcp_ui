from __future__ import annotations
import base64
from .base import Tool, tool_registry
from ..speech.base import speech_registry


class SpeechTranscribeTool(Tool):
    name = "speech.transcribe"
    description = "Transcribe audio (base64) to text using speech provider"

    async def run(self, audio_base64: str, provider: str = "openai", language: str | None = None):  # type: ignore[override]
        audio_bytes = base64.b64decode(audio_base64)
        prov = speech_registry.get(provider)
        return await prov.transcribe(audio_bytes, language=language)


class SpeechSynthesizeTool(Tool):
    name = "speech.synthesize"
    description = "Synthesize text to speech returning base64 audio"

    async def run(self, text: str, provider: str = "openai", voice: str | None = None, format: str = "mp3"):  # type: ignore[override]
        prov = speech_registry.get(provider)
        return await prov.synthesize(text, voice=voice, format=format)


tool_registry.register(SpeechTranscribeTool())
tool_registry.register(SpeechSynthesizeTool())
