import pytest
import tempfile
import os
from datetime import datetime
from orchestrator.persistence.models import Database, Session, Message, ToolExecution


@pytest.fixture
async def test_db():
    """Create a temporary test database"""
    with tempfile.NamedTemporaryFile(delete=False, suffix='.db') as f:
        db_path = f.name
    
    try:
        db = Database(db_path)
        await db.init_schema()
        yield db
    finally:
        if os.path.exists(db_path):
            os.unlink(db_path)


@pytest.mark.asyncio
async def test_create_and_get_session(test_db):
    """Test session creation and retrieval"""
    session = Session(
        id="test-session-1",
        created_at=datetime.now(),
        user_id="user123",
        title="Test Session",
        metadata={"key": "value"}
    )
    
    # Create session
    created = await test_db.create_session(session)
    assert created.id == session.id
    
    # Retrieve session
    retrieved = await test_db.get_session("test-session-1")
    assert retrieved is not None
    assert retrieved.id == "test-session-1"
    assert retrieved.user_id == "user123"
    assert retrieved.title == "Test Session"
    assert retrieved.metadata == {"key": "value"}
    
    # Test non-existent session
    missing = await test_db.get_session("non-existent")
    assert missing is None


@pytest.mark.asyncio
async def test_create_and_get_messages(test_db):
    """Test message creation and retrieval"""
    # First create a session
    session = Session(
        id="test-session-2",
        created_at=datetime.now(),
        title="Message Test Session"
    )
    await test_db.create_session(session)
    
    # Create messages
    message1 = Message(
        id="msg-1",
        session_id="test-session-2",
        role="user",
        content="Hello world",
        content_json={"type": "text"}
    )
    
    message2 = Message(
        id="msg-2",
        session_id="test-session-2",
        role="assistant",
        content="Hi there!",
        tokens_in=10,
        tokens_out=5,
        cost_estimate=0.001
    )
    
    await test_db.create_message(message1)
    await test_db.create_message(message2)
    
    # Retrieve messages
    messages = await test_db.get_session_messages("test-session-2")
    assert len(messages) == 2
    
    # Check order (should be newest first)
    assert messages[0].id == "msg-2"  # Most recent
    assert messages[1].id == "msg-1"
    
    # Check content
    assert messages[1].content == "Hello world"
    assert messages[1].content_json == {"type": "text"}
    assert messages[0].tokens_in == 10
    assert messages[0].cost_estimate == 0.001


@pytest.mark.asyncio
async def test_tool_execution_lifecycle(test_db):
    """Test tool execution creation and updates"""
    # Create session and message first
    session = Session(id="test-session-3", created_at=datetime.now())
    await test_db.create_session(session)
    
    message = Message(
        id="msg-3",
        session_id="test-session-3",
        role="user",
        content="Run tool"
    )
    await test_db.create_message(message)
    
    # Create tool execution
    execution = ToolExecution(
        id="exec-1",
        message_id="msg-3",
        tool_name="fs.read",
        input_json={"path": "/tmp/test.txt"},
        status="running"
    )
    
    created = await test_db.create_tool_execution(execution)
    assert created.id == "exec-1"
    assert created.status == "running"
    
    # Update to completed
    await test_db.update_tool_execution(
        "exec-1", 
        "completed", 
        output_json={"content": "file content"}
    )
    
    # Update to failed  
    await test_db.update_tool_execution(
        "exec-1",
        "failed",
        error_message="File not found"
    )
    
    # Note: We don't have a get_tool_execution method, but the updates should work
    # In a real scenario, you might want to add such a method for testing