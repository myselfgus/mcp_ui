from __future__ import annotations
import os
import base64
import httpx
from typing import Dict, Any
from .base import SpeechProvider, speech_registry
from ..config import settings
import logging

logger = logging.getLogger("orchestrator.speech")

OPENAI_API_BASE = os.environ.get("OPENAI_API_BASE", "https://api.openai.com/v1")


class OpenAISpeechProvider(SpeechProvider):
    """OpenAI speech provider using Whisper for transcription and TTS for synthesis."""
    name = "openai"

    async def transcribe(self, audio_bytes: bytes, language: str | None = None) -> Dict[str, Any]:
        """Transcribe audio using OpenAI Whisper."""
        api_key = settings.openai_api_key or os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("Missing OPENAI_API_KEY")

        model = os.environ.get("SPEECH_MODEL", "whisper-1")
        
        # Prepare form data
        files = {
            "file": ("audio.mp3", audio_bytes, "audio/mpeg"),
            "model": (None, model),
        }
        
        if language:
            files["language"] = (None, language)

        headers = {"Authorization": f"Bearer {api_key}"}
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{OPENAI_API_BASE}/audio/transcriptions",
                headers=headers,
                files=files
            )
            response.raise_for_status()
            result = response.json()
            
            logger.info("transcription_completed", extra={
                "model": model,
                "language": language,
                "text_length": len(result.get("text", ""))
            })
            
            return result

    async def synthesize(self, text: str, voice: str | None = None, format: str = "mp3") -> bytes:
        """Synthesize speech using OpenAI TTS."""
        api_key = settings.openai_api_key or os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("Missing OPENAI_API_KEY")

        # Use default voice if not specified
        voice = voice or os.environ.get("TTS_VOICE", "alloy")
        model = "tts-1"  # OpenAI TTS model
        
        payload = {
            "model": model,
            "input": text,
            "voice": voice,
            "response_format": format
        }
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{OPENAI_API_BASE}/audio/speech",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            
            audio_bytes = response.content
            
            logger.info("synthesis_completed", extra={
                "model": model,
                "voice": voice,
                "format": format,
                "text_length": len(text),
                "audio_size": len(audio_bytes)
            })
            
            return audio_bytes


# Register the provider
speech_registry.register(OpenAISpeechProvider())