from __future__ import annotations
import os
import io
import tempfile
from typing import Optional
import httpx
from .base import SpeechProvider, TranscriptionResult, TranscriptionOptions, SynthesisOptions, WordTiming, speech_registry
from ..config import settings

class OpenAISpeechProvider(SpeechProvider):
    """OpenAI speech provider using Whisper for STT and TTS for synthesis"""
    name = "openai"

    def __init__(self):
        self.api_key = settings.openai_api_key or os.environ.get("OPENAI_API_KEY")
        if not self.api_key:
            raise RuntimeError("Missing OPENAI_API_KEY for OpenAI speech provider")
        self.base_url = os.environ.get("OPENAI_API_BASE", "https://api.openai.com/v1")

    async def transcribe(self, audio_data: bytes, opts: TranscriptionOptions) -> TranscriptionResult:
        """Transcribe audio using OpenAI Whisper API"""
        headers = {"Authorization": f"Bearer {self.api_key}"}
        
        # Create form data with audio file
        files = {
            "file": ("audio.mp3", io.BytesIO(audio_data), "audio/mpeg"),
            "model": (None, opts.model or "whisper-1"),
            "response_format": (None, "verbose_json"),  # Get word-level timestamps
        }
        
        if opts.language:
            files["language"] = (None, opts.language)

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/audio/transcriptions",
                headers=headers,
                files=files
            )
            response.raise_for_status()
            
            result = response.json()
            
            # Extract word timing if available
            words = None
            if "words" in result:
                words = [
                    WordTiming(word=w["word"], start=w["start"], end=w["end"])
                    for w in result["words"]
                ]
            
            return TranscriptionResult(
                text=result["text"],
                words=words
            )

    async def synthesize(self, text: str, opts: SynthesisOptions) -> bytes:
        """Synthesize speech using OpenAI TTS API"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": opts.model or "tts-1",
            "input": text,
            "voice": opts.voice or "alloy",
            "response_format": opts.format,
        }
        
        if opts.speed != 1.0:
            payload["speed"] = max(0.25, min(4.0, opts.speed))  # OpenAI limits

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/audio/speech",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            
            return response.content

# Register the provider
speech_registry.register(OpenAISpeechProvider())