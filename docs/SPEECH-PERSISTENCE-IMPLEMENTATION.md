# Speech and Persistence Implementation

This document describes the implementation of speech and persistence modules for the orchestrator service.

## Implementation Overview

### Speech Subsystem

**Files added:**
- `src/orchestrator/speech/__init__.py` - Package initialization
- `src/orchestrator/speech/base.py` - Abstract speech provider interface and registry
- `src/orchestrator/speech/openai_provider.py` - OpenAI Whisper/TTS implementation
- `src/orchestrator/speech/tools.py` - Speech tools (transcribe/synthesize) for chat interface

**Key Features:**
- Provider abstraction pattern (similar to existing chat providers)
- OpenAI Whisper for speech-to-text with word timing support
- OpenAI TTS for text-to-speech with voice selection
- Base64 encoding for audio transport over JSON APIs
- Configurable models, voices, and formats
- Integration with existing tool registry

**Speech Tools:**
- `speech.transcribe` - Convert audio (base64) to text
- `speech.synthesize` - Convert text to audio (base64)

### Persistence Layer

**Files added:**
- `src/orchestrator/persistence/__init__.py` - Package initialization  
- `src/orchestrator/persistence/models.py` - Database models and SQLite implementation

**Key Features:**
- SQLite-based persistence with async support (aiosqlite)
- Three core models: Session, Message, ToolExecution
- Complete audit trail of chat interactions and tool usage
- Prepared for Postgres migration (JSON fields, indexes)
- Optional persistence (configurable via ENABLE_PERSISTENCE)

**Database Schema:**
- `sessions` - Chat sessions with user mapping and metadata
- `messages` - Individual messages with token counts and cost tracking
- `tool_executions` - Tool calls with full input/output logging and timing

### Configuration Updates

**Updated files:**
- `src/orchestrator/config.py` - Added speech and persistence settings
- `.env.example` - Added configuration examples
- `pyproject.toml` - Added aiosqlite dependency

**New Settings:**
- Speech: provider selection, voice/model defaults, enable/disable
- Persistence: database URL, enable/disable flag
- Tool allowlist: includes new speech tools

### Integration

**Updated files:**
- `src/orchestrator/api/main.py` - Added database initialization, speech endpoints
- `src/orchestrator/core/chat.py` - Added persistence logging and tool execution tracking
- `src/orchestrator/__init__.py` - Added conditional imports for new modules

**Key Changes:**
- Database schema initialization on startup
- Session and message persistence in chat flow
- Tool execution logging with status tracking
- New endpoints: `/speech/providers`
- Enhanced health check with feature flags

### Tests

**Test files added:**
- `tests/test_speech_provider.py` - Unit tests for OpenAI speech provider
- `tests/test_persistence.py` - Database model and operations tests
- `tests/test_speech_integration.py` - Integration tests for speech tools and API

**Test Coverage:**
- Speech provider transcription and synthesis
- Database CRUD operations for all models
- Tool registration and API endpoints
- Error handling and configuration validation

## Usage Examples

### Speech Integration

```python
# Transcribe audio
result = await speech_provider.transcribe(audio_bytes, TranscriptionOptions(language="en"))
print(result.text)  # "Hello world"

# Synthesize speech  
audio_bytes = await speech_provider.synthesize("Hello world", SynthesisOptions(voice="alloy"))
```

### Persistence Usage

```python
# Create session
session = Session(id="sess-123", created_at=datetime.now(), title="My Chat")
await db.create_session(session)

# Log message
message = Message(id="msg-456", session_id="sess-123", role="user", content="Hello")
await db.create_message(message)

# Track tool execution
execution = ToolExecution(id="exec-789", message_id="msg-456", tool_name="fs.read", input_json={"path": "/tmp/file"})
await db.create_tool_execution(execution)
```

## Migration Path

The implementation provides a clear migration path:

1. **SQLite Foundation**: Immediate functionality with local storage
2. **Postgres Ready**: Schema designed for easy migration to PostgreSQL
3. **Provider Abstraction**: Speech providers can be swapped/added without API changes
4. **Feature Toggles**: All new functionality can be disabled for incremental rollout

## Configuration

All new features are configurable and can be selectively enabled:

```bash
# Enable/disable speech
ENABLE_SPEECH=true
DEFAULT_SPEECH_PROVIDER=openai

# Enable/disable persistence  
ENABLE_PERSISTENCE=true
DATABASE_URL=orchestrator.db

# Speech provider settings
DEFAULT_TTS_VOICE=alloy
DEFAULT_STT_MODEL=whisper-1
```

This implementation follows the existing patterns in the codebase while adding comprehensive speech and persistence capabilities.