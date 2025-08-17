import pytest
from unittest.mock import Mock, patch, AsyncMock
from orchestrator.speech.base import TranscriptionOptions, SynthesisOptions, TranscriptionResult, WordTiming
from orchestrator.speech.openai_provider import OpenAISpeechProvider


@pytest.fixture
def mock_openai_key():
    with patch.dict('os.environ', {'OPENAI_API_KEY': 'test-key'}):
        yield


@pytest.fixture
def speech_provider(mock_openai_key):
    return OpenAISpeechProvider()


@pytest.mark.asyncio
async def test_transcribe_basic(speech_provider):
    """Test basic transcription functionality"""
    mock_response = {
        "text": "Hello world",
        "words": [
            {"word": "Hello", "start": 0.0, "end": 0.5},
            {"word": "world", "start": 0.5, "end": 1.0}
        ]
    }
    
    with patch('httpx.AsyncClient') as mock_client:
        mock_response_obj = Mock()
        mock_response_obj.json.return_value = mock_response
        mock_response_obj.raise_for_status.return_value = None
        
        mock_client.return_value.__aenter__.return_value.post = AsyncMock(return_value=mock_response_obj)
        
        audio_data = b"fake audio data"
        opts = TranscriptionOptions(language="en")
        
        result = await speech_provider.transcribe(audio_data, opts)
        
        assert result.text == "Hello world"
        assert len(result.words) == 2
        assert result.words[0].word == "Hello"
        assert result.words[0].start == 0.0


@pytest.mark.asyncio
async def test_synthesize_basic(speech_provider):
    """Test basic synthesis functionality"""
    fake_audio = b"fake audio content"
    
    with patch('httpx.AsyncClient') as mock_client:
        mock_response_obj = Mock()
        mock_response_obj.content = fake_audio
        mock_response_obj.raise_for_status.return_value = None
        
        mock_client.return_value.__aenter__.return_value.post = AsyncMock(return_value=mock_response_obj)
        
        text = "Hello world"
        opts = SynthesisOptions(voice="alloy", format="mp3")
        
        result = await speech_provider.synthesize(text, opts)
        
        assert result == fake_audio


def test_speech_provider_requires_api_key():
    """Test that speech provider requires API key"""
    with patch.dict('os.environ', {}, clear=True):
        with patch('orchestrator.speech.openai_provider.settings') as mock_settings:
            mock_settings.openai_api_key = None
            with pytest.raises(RuntimeError, match="Missing OPENAI_API_KEY"):
                OpenAISpeechProvider()