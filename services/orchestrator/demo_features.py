#!/usr/bin/env python3
"""
Example script demonstrating the new speech and persistence features.

This script shows how to use the speech and persistence modules
without running the full FastAPI server.
"""

import asyncio
import os
import sys
from datetime import datetime

# Add src to path for imports
sys.path.insert(0, 'src')

async def demo_persistence():
    """Demonstrate persistence functionality"""
    print("=== Persistence Demo ===")
    
    # Import after path setup
    from orchestrator.persistence.models import Database, Session, Message, ToolExecution
    
    # Create in-memory database for demo
    db = Database(':memory:')
    await db.init_schema()
    print("✓ Database schema initialized")
    
    # Create a session
    session = Session(
        id="demo-session-123",
        created_at=datetime.now(),
        user_id="demo-user",
        title="Demo Chat Session",
        metadata={"demo": True, "version": "1.0"}
    )
    
    await db.create_session(session)
    print(f"✓ Created session: {session.id}")
    
    # Add some messages
    user_msg = Message(
        id="msg-1",
        session_id=session.id,
        role="user",
        content="Hello, can you read a file for me?",
        content_json={"type": "text", "source": "user"}
    )
    
    assistant_msg = Message(
        id="msg-2", 
        session_id=session.id,
        role="assistant",
        content="I'll help you read the file.",
        tokens_in=15,
        tokens_out=8,
        cost_estimate=0.0001
    )
    
    await db.create_message(user_msg)
    await db.create_message(assistant_msg)
    print(f"✓ Created {2} messages")
    
    # Log a tool execution
    tool_exec = ToolExecution(
        id="exec-1",
        message_id=assistant_msg.id,
        tool_name="fs.read",
        input_json={"path": "/tmp/example.txt"},
        status="running"
    )
    
    await db.create_tool_execution(tool_exec)
    print(f"✓ Created tool execution: {tool_exec.tool_name}")
    
    # Update tool execution with results
    await db.update_tool_execution(
        tool_exec.id,
        "completed",
        output_json={"content": "Hello from file!", "size": 16}
    )
    print("✓ Updated tool execution to completed")
    
    # Retrieve session messages
    messages = await db.get_session_messages(session.id)
    print(f"✓ Retrieved {len(messages)} messages from session")
    
    for msg in messages:
        print(f"  - {msg.role}: {msg.content[:50]}...")
    
    return db

def demo_speech_models():
    """Demonstrate speech model classes without requiring API keys"""
    print("\n=== Speech Models Demo ===")
    
    from orchestrator.speech.base import (
        TranscriptionOptions, SynthesisOptions, 
        TranscriptionResult, WordTiming, speech_registry
    )
    
    # Create transcription options
    transcribe_opts = TranscriptionOptions(
        language="en",
        model="whisper-1"
    )
    print(f"✓ Created transcription options: {transcribe_opts}")
    
    # Create synthesis options
    synthesis_opts = SynthesisOptions(
        voice="alloy",
        model="tts-1", 
        format="mp3",
        speed=1.2
    )
    print(f"✓ Created synthesis options: {synthesis_opts}")
    
    # Create a sample transcription result
    word_timings = [
        WordTiming("Hello", 0.0, 0.5),
        WordTiming("world", 0.5, 1.0)
    ]
    
    result = TranscriptionResult(
        text="Hello world",
        words=word_timings
    )
    print(f"✓ Created transcription result: '{result.text}' with {len(result.words)} word timings")
    
    # Show registry (will be empty without provider registration)
    providers = speech_registry.list()
    print(f"✓ Speech registry has {len(providers)} providers: {providers}")
    
    return result

def demo_configuration():
    """Demonstrate configuration loading"""
    print("\n=== Configuration Demo ===")
    
    from orchestrator.config import settings
    
    print(f"✓ Speech enabled: {settings.enable_speech}")
    print(f"✓ Persistence enabled: {settings.enable_persistence}")
    print(f"✓ Default speech provider: {settings.default_speech_provider}")
    print(f"✓ Default TTS voice: {settings.default_tts_voice}")
    print(f"✓ Database URL: {settings.database_url}")
    print(f"✓ Allowed tools: {len(settings.allowed_tools)} tools")
    
    # Show new speech tools in allowed list
    speech_tools = [tool for tool in settings.allowed_tools if tool.startswith('speech.')]
    print(f"✓ Speech tools enabled: {speech_tools}")
    
    return settings

async def main():
    """Run all demos"""
    print("🚀 Speech and Persistence Feature Demo")
    print("=" * 50)
    
    try:
        # Demo basic models and configuration
        demo_speech_models()
        demo_configuration()
        
        # Demo persistence (requires no external dependencies)
        await demo_persistence()
        
        print("\n" + "=" * 50)
        print("✅ All demos completed successfully!")
        print("\nTo run the full orchestrator with these features:")
        print("1. Install dependencies: pip install -e .")
        print("2. Set OPENAI_API_KEY for speech functionality")
        print("3. Run: uvicorn orchestrator.api.main:app --reload")
        print("4. Test speech tools via /chat/stream endpoint")
        
    except Exception as e:
        print(f"\n❌ Demo failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())