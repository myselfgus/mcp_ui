import pytest
import tempfile
import os
from orchestrator.memory.database import create_db_engine, init_database, get_db_session
from orchestrator.memory.models import VectorChunk, OntologyItem, ParsingItem
from orchestrator.memory.retrieval import MemoryRetriever
from orchestrator.memory.embeddings import embedding_registry, GoogleEmbeddingProvider
from orchestrator.tools.base import tool_registry


@pytest.fixture
def temp_db():
    """Create a temporary database for testing."""
    with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp:
        db_path = tmp.name
    
    # Set up temporary database
    db_url = f"sqlite:///{db_path}"
    
    # Patch the settings for testing
    with pytest.MonkeyPatch().context() as m:
        m.setattr('orchestrator.memory.database.settings.database_url', db_url)
        m.setattr('orchestrator.memory.database.settings.enable_memory', True)
        
        # Create new engine for test database
        from sqlmodel import SQLModel, create_engine
        engine = create_engine(db_url, connect_args={"check_same_thread": False})
        
        # Create tables
        from orchestrator.memory.models import (
            OntologyItem, ParsingItem, VectorChunk, GraphEdge, 
            Metadata, Message, Session, ToolExecution
        )
        SQLModel.metadata.create_all(engine)
        
        yield engine
    
    # Cleanup
    try:
        os.unlink(db_path)
    except FileNotFoundError:
        pass


@pytest.mark.asyncio
async def test_memory_models():
    """Test memory database models."""
    # Test OntologyItem
    item = OntologyItem(
        key="test_key",
        title="Test Title", 
        body="Test body content"
    )
    
    # Test tags functionality
    tags_dict = {"category": "test", "priority": "high"}
    item.set_tags(tags_dict)
    retrieved_tags = item.get_tags()
    assert retrieved_tags == tags_dict
    
    # Test VectorChunk
    chunk = VectorChunk(
        source="test_source",
        content="Test content for vector"
    )
    
    # Test embedding functionality
    embedding_vector = [0.1, 0.2, 0.3, 0.4]
    chunk.set_embedding(embedding_vector)
    retrieved_embedding = chunk.get_embedding()
    assert retrieved_embedding == embedding_vector
    assert chunk.dim == 4


@pytest.mark.asyncio
async def test_embedding_providers():
    """Test embedding provider functionality."""
    # Test registry
    providers = embedding_registry.list()
    assert 'openai' in providers
    assert 'google' in providers
    
    # Test Google stub provider
    google_provider = embedding_registry.get('google')
    embedding = await google_provider.embed_text("test text")
    assert isinstance(embedding, list)
    assert len(embedding) == 384  # Placeholder dimension
    assert all(isinstance(x, float) for x in embedding)
    
    # Test batch embedding
    embeddings = await google_provider.embed_batch(["text1", "text2"])
    assert len(embeddings) == 2
    assert all(len(emb) == 384 for emb in embeddings)


@pytest.mark.asyncio 
async def test_memory_retrieval_lexical():
    """Test memory retrieval with lexical search fallback."""
    retriever = MemoryRetriever(embedding_provider="google")  # Use stub
    
    # Test with empty database - should return empty results
    results = await retriever.search("test query", top_k=5)
    assert isinstance(results, list)
    assert len(results) == 0


@pytest.mark.asyncio
async def test_memory_tools():
    """Test memory tools integration."""
    # Check that memory tools are registered
    tools = tool_registry.list()
    assert 'memory.search' in tools
    assert 'memory.store' in tools
    
    # Get the tools
    search_tool = tool_registry.get('memory.search')
    store_tool = tool_registry.get('memory.store')
    
    assert search_tool.name == 'memory.search'
    assert store_tool.name == 'memory.store'
    
    # Test search tool with basic parameters
    result = await search_tool.run(query="test query", top_k=3)
    assert result['success'] is True
    assert 'results' in result
    assert 'query' in result


@pytest.mark.asyncio
async def test_memory_store_tool():
    """Test memory store tool functionality."""
    store_tool = tool_registry.get('memory.store')
    
    # Test validation of content types
    result = await store_tool.run(
        content="Test content",
        source="test_source",
        content_type="invalid_type"
    )
    assert result['success'] is False
    assert 'error' in result
    
    # Test with valid content type but no database (should handle gracefully)
    result = await store_tool.run(
        content="Test content",
        source="test_source", 
        content_type="general",
        generate_embedding=False
    )
    # Result may succeed or fail depending on database state, 
    # but should not crash
    assert 'success' in result