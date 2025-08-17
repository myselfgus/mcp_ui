import pytest
from fastapi.testclient import TestClient
from orchestrator.api.main import app

client = TestClient(app)


def test_healthz_endpoint():
    """Test health check endpoint."""
    response = client.get("/healthz")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "ok"


def test_tools_endpoint():
    """Test tools listing endpoint."""
    response = client.get("/tools")
    assert response.status_code == 200
    data = response.json()
    assert "tools" in data
    tools = data["tools"]
    
    # Check that our new tools are listed
    assert "speech.transcribe" in tools
    assert "speech.synthesize" in tools
    assert "memory.search" in tools
    assert "memory.store" in tools


def test_speech_providers_endpoint():
    """Test speech providers listing endpoint."""
    response = client.get("/speech/providers")
    assert response.status_code == 200
    data = response.json()
    assert "providers" in data
    providers = data["providers"]
    assert "openai" in providers
    assert "google" in providers


def test_memory_stats_endpoint():
    """Test memory stats endpoint."""
    response = client.get("/memory/stats")
    assert response.status_code == 200
    data = response.json()
    assert "success" in data
    assert data["success"] is True
    assert "stats" in data


def test_memory_retrieve_endpoint():
    """Test memory retrieve endpoint."""
    response = client.post("/memory/retrieve", json={
        "query": "test query",
        "top_k": 3,
        "axes": ["ontology", "vectors"]
    })
    assert response.status_code == 200
    data = response.json()
    assert "success" in data
    assert data["success"] is True
    assert "results" in data
    assert "query" in data
    assert data["query"] == "test query"


def test_speech_tts_endpoint_no_api_key():
    """Test TTS endpoint without API key (should fail gracefully)."""
    response = client.post("/speech/tts", json={
        "text": "Hello world",
        "provider": "openai"
    })
    # Should return 500 because no API key is configured
    assert response.status_code == 500
    data = response.json()
    assert "detail" in data
    assert "Missing OPENAI_API_KEY" in data["detail"]