from __future__ import annotations
import base64
from typing import Any, Dict
from ..tools.base import Tool, tool_registry
from ..speech.base import speech_registry
import logging

logger = logging.getLogger("orchestrator.speech.tools")


class SpeechTranscribeTool(Tool):
    """Tool for speech-to-text transcription."""
    name = "speech.transcribe"
    description = "Transcribe audio to text using speech recognition"

    async def run(self, audio_data: str, provider: str = "openai", language: str | None = None) -> Dict[str, Any]:
        """
        Transcribe audio to text.
        
        Args:
            audio_data: Base64-encoded audio data
            provider: Speech provider to use ('openai', 'google')
            language: Optional language hint (e.g., 'en', 'es')
            
        Returns:
            Transcription result with text and metadata
        """
        try:
            # Decode base64 audio data
            audio_bytes = base64.b64decode(audio_data)
            
            # Get speech provider
            speech_provider = speech_registry.get(provider)
            
            # Perform transcription
            result = await speech_provider.transcribe(audio_bytes, language=language)
            
            logger.info("speech_transcription", extra={
                "provider": provider,
                "language": language,
                "text_length": len(result.get("text", ""))
            })
            
            return {
                "success": True,
                "provider": provider,
                "result": result
            }
            
        except Exception as e:
            logger.error("speech_transcription_error", extra={
                "provider": provider,
                "error": str(e)
            })
            return {
                "success": False,
                "error": str(e),
                "provider": provider
            }


class SpeechSynthesizeTool(Tool):
    """Tool for text-to-speech synthesis."""
    name = "speech.synthesize"
    description = "Synthesize speech from text using text-to-speech"

    async def run(self, text: str, provider: str = "openai", voice: str | None = None, format: str = "mp3") -> Dict[str, Any]:
        """
        Synthesize speech from text.
        
        Args:
            text: Text to synthesize
            provider: Speech provider to use ('openai', 'google')
            voice: Optional voice identifier
            format: Audio format ('mp3', 'wav', 'ogg')
            
        Returns:
            Synthesis result with base64-encoded audio data
        """
        try:
            # Get speech provider
            speech_provider = speech_registry.get(provider)
            
            # Perform synthesis
            audio_bytes = await speech_provider.synthesize(text, voice=voice, format=format)
            
            # Encode audio as base64 for transport
            audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
            
            logger.info("speech_synthesis", extra={
                "provider": provider,
                "voice": voice,
                "format": format,
                "text_length": len(text),
                "audio_size": len(audio_bytes)
            })
            
            return {
                "success": True,
                "provider": provider,
                "audio_data": audio_base64,
                "format": format,
                "voice": voice,
                "size": len(audio_bytes)
            }
            
        except Exception as e:
            logger.error("speech_synthesis_error", extra={
                "provider": provider,
                "error": str(e)
            })
            return {
                "success": False,
                "error": str(e),
                "provider": provider
            }


# Register speech tools
tool_registry.register(SpeechTranscribeTool())
tool_registry.register(SpeechSynthesizeTool())