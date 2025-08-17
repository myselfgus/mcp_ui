import pytest
import base64
from unittest.mock import Mock, patch, AsyncMock
from fastapi.testclient import TestClient
from orchestrator.api.main import app
from orchestrator.speech.tools import SpeechTranscribeTool, SpeechSynthesizeTool


def test_speech_endpoints_in_tools():
    """Test that speech tools are registered"""
    client = TestClient(app)
    resp = client.get('/tools')
    assert resp.status_code == 200
    data = resp.json()
    assert 'tools' in data
    tools = data['tools']
    assert 'speech.transcribe' in tools
    assert 'speech.synthesize' in tools


def test_speech_providers_endpoint():
    """Test speech providers endpoint"""
    client = TestClient(app)
    resp = client.get('/speech/providers')
    assert resp.status_code == 200
    data = resp.json()
    assert 'providers' in data
    assert 'openai' in data['providers']


@pytest.mark.asyncio 
async def test_speech_transcribe_tool():
    """Test speech transcribe tool"""
    tool = SpeechTranscribeTool()
    
    # Mock the speech provider
    mock_result = Mock()
    mock_result.text = "Hello world"
    mock_result.words = None
    
    with patch('orchestrator.speech.tools.speech_registry') as mock_registry:
        mock_provider = Mock()
        mock_provider.transcribe = AsyncMock(return_value=mock_result)
        mock_registry.get.return_value = mock_provider
        
        # Test audio (fake base64)
        audio_data = b"fake audio"
        audio_base64 = base64.b64encode(audio_data).decode()
        
        result = await tool.run(audio_base64=audio_base64, provider="openai")
        
        assert result["text"] == "Hello world"
        assert result["provider"] == "openai"
        assert result["words"] is None


@pytest.mark.asyncio
async def test_speech_synthesize_tool():
    """Test speech synthesize tool"""
    tool = SpeechSynthesizeTool()
    
    # Mock the speech provider
    fake_audio = b"fake audio content"
    
    with patch('orchestrator.speech.tools.speech_registry') as mock_registry:
        mock_provider = Mock()
        mock_provider.synthesize = AsyncMock(return_value=fake_audio)
        mock_registry.get.return_value = mock_provider
        
        result = await tool.run(text="Hello world", provider="openai")
        
        assert result["provider"] == "openai"
        assert result["format"] == "mp3"
        assert result["size_bytes"] == len(fake_audio)
        
        # Verify audio can be decoded
        decoded_audio = base64.b64decode(result["audio_base64"])
        assert decoded_audio == fake_audio


def test_healthz_includes_speech_status():
    """Test that healthz endpoint includes speech status"""
    client = TestClient(app)
    resp = client.get('/healthz')
    assert resp.status_code == 200
    data = resp.json()
    assert 'speech_enabled' in data
    assert 'persistence_enabled' in data