from __future__ import annotations
import base64
from typing import Dict, Any
from ..tools.base import Tool, tool_registry
from ..speech.base import speech_registry, TranscriptionOptions, SynthesisOptions
import logging

logger = logging.getLogger("orchestrator.speech")

class SpeechTranscribeTool(Tool):
    """Tool for transcribing audio to text"""
    name = "speech.transcribe"
    description = "Transcribe audio data to text using speech recognition"

    async def run(self, audio_base64: str, provider: str = "openai", language: str | None = None, model: str | None = None) -> Dict[str, Any]:  # type: ignore[override]
        """
        Transcribe audio to text
        
        Args:
            audio_base64: Base64-encoded audio data
            provider: Speech provider to use (default: openai)
            language: Language code for transcription (optional)
            model: Model to use for transcription (optional)
        """
        try:
            # Decode audio data
            audio_data = base64.b64decode(audio_base64)
            
            # Get speech provider
            speech_provider = speech_registry.get(provider)
            
            # Create transcription options
            opts = TranscriptionOptions(language=language, model=model)
            
            # Transcribe audio
            result = await speech_provider.transcribe(audio_data, opts)
            
            logger.info("speech_transcribe", extra={"provider": provider, "text_length": len(result.text)})
            
            return {
                "text": result.text,
                "words": [{"word": w.word, "start": w.start, "end": w.end} for w in result.words] if result.words else None,
                "provider": provider
            }
        except Exception as e:
            logger.error("speech_transcribe_error", extra={"error": str(e), "provider": provider})
            raise

class SpeechSynthesizeTool(Tool):
    """Tool for synthesizing text to speech"""
    name = "speech.synthesize"
    description = "Synthesize text to speech audio"

    async def run(self, text: str, provider: str = "openai", voice: str | None = None, model: str | None = None, format: str = "mp3", speed: float = 1.0) -> Dict[str, Any]:  # type: ignore[override]
        """
        Synthesize text to speech
        
        Args:
            text: Text to synthesize
            provider: Speech provider to use (default: openai)
            voice: Voice to use for synthesis (optional)
            model: Model to use for synthesis (optional)
            format: Audio format (mp3, wav, ogg)
            speed: Speech speed (0.25-4.0)
        """
        try:
            # Get speech provider
            speech_provider = speech_registry.get(provider)
            
            # Create synthesis options
            opts = SynthesisOptions(voice=voice, model=model, format=format, speed=speed)
            
            # Synthesize speech
            audio_data = await speech_provider.synthesize(text, opts)
            
            # Encode as base64 for transport
            audio_base64 = base64.b64encode(audio_data).decode()
            
            logger.info("speech_synthesize", extra={"provider": provider, "text_length": len(text), "audio_size": len(audio_data)})
            
            return {
                "audio_base64": audio_base64,
                "format": format,
                "provider": provider,
                "size_bytes": len(audio_data)
            }
        except Exception as e:
            logger.error("speech_synthesize_error", extra={"error": str(e), "provider": provider})
            raise

# Register speech tools
tool_registry.register(SpeechTranscribeTool())
tool_registry.register(SpeechSynthesizeTool())