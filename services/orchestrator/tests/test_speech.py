import pytest
from unittest.mock import AsyncMock, patch
from orchestrator.speech.base import speech_registry
from orchestrator.speech.openai_provider import OpenAISpeechProvider
from orchestrator.speech.google_stub import GoogleSpeechProvider


@pytest.mark.asyncio
async def test_speech_registry():
    """Test speech provider registry."""
    providers = speech_registry.list()
    assert 'openai' in providers
    assert 'google' in providers
    
    openai_provider = speech_registry.get('openai')
    assert isinstance(openai_provider, OpenAISpeechProvider)
    
    google_provider = speech_registry.get('google')
    assert isinstance(google_provider, GoogleSpeechProvider)


@pytest.mark.asyncio
async def test_google_speech_provider_placeholder():
    """Test Google speech provider placeholder functionality."""
    provider = GoogleSpeechProvider()
    
    # Test transcription placeholder
    result = await provider.transcribe(b"test_audio_data", "en")
    assert "text" in result
    assert "placeholder" in result["text"].lower()
    
    # Test synthesis placeholder
    audio_bytes = await provider.synthesize("Hello world", voice="test")
    assert isinstance(audio_bytes, bytes)
    assert len(audio_bytes) > 0


@pytest.mark.asyncio
async def test_openai_speech_provider_mock():
    """Test OpenAI speech provider with mocked API calls."""
    
    with patch('orchestrator.speech.openai_provider.httpx.AsyncClient') as mock_client:
        # Mock transcription response
        mock_response = AsyncMock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {"text": "Hello world"}
        
        mock_client.return_value.__aenter__.return_value.post = AsyncMock(return_value=mock_response)
        
        provider = OpenAISpeechProvider()
        
        # Mock API key
        with patch.dict('os.environ', {'OPENAI_API_KEY': 'test_key'}):
            result = await provider.transcribe(b"test_audio_data", "en")
            assert result["text"] == "Hello world"


@pytest.mark.asyncio 
async def test_openai_speech_synthesis_mock():
    """Test OpenAI speech synthesis with mocked API calls."""
    
    with patch('orchestrator.speech.openai_provider.httpx.AsyncClient') as mock_client:
        # Mock synthesis response
        mock_response = AsyncMock()
        mock_response.raise_for_status.return_value = None
        mock_response.content = b"fake_audio_data"
        
        mock_client.return_value.__aenter__.return_value.post = AsyncMock(return_value=mock_response)
        
        provider = OpenAISpeechProvider()
        
        # Mock API key
        with patch.dict('os.environ', {'OPENAI_API_KEY': 'test_key'}):
            result = await provider.synthesize("Hello world", voice="alloy")
            assert result == b"fake_audio_data"


@pytest.mark.asyncio
async def test_speech_tools():
    """Test speech tools integration."""
    from orchestrator.tools.base import tool_registry
    
    # Check that speech tools are registered
    tools = tool_registry.list()
    assert 'speech.transcribe' in tools
    assert 'speech.synthesize' in tools
    
    # Get the tools
    transcribe_tool = tool_registry.get('speech.transcribe')
    synthesize_tool = tool_registry.get('speech.synthesize')
    
    assert transcribe_tool.name == 'speech.transcribe'
    assert synthesize_tool.name == 'speech.synthesize'