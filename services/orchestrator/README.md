# Orchestrator Service

Implements chat streaming, provider abstraction (OpenAI + Gemini stub), tool registry (fs, git, terminal, patch, speech), persistence layer (sessions, messages, tool executions), and SSE endpoint `/chat/stream`.

## Endpoints
- `POST /chat/stream` (SSE): body `{message: string, session_id?: string, model?: string, provider?: string, tool_calls?: [{name, params}]}`
- `GET /tools` list registered tools.
- `GET /speech/providers` list available speech providers.
- `GET /healthz` health & allowed tools.

## Streaming Event Types
```json
{"type":"token","token":"..."}
{"type":"tool_result","tool":"fs.read","data":{...},"execution_id":"uuid"}
{"type":"tool_error","tool":"fs.read","error":"msg","execution_id":"uuid"}
{"type":"end","reason":"completed"}
{"type":"error","error":"msg"}
```

## Environment Variables (.env example)
```
OPENAI_API_KEY=sk-...
DEFAULT_MODEL=gpt-4o-mini
ALLOW_FS_BASE=/workspaces
ENABLE_TERMINAL=true
ENABLE_GIT=true

# Speech settings
ENABLE_SPEECH=true
DEFAULT_SPEECH_PROVIDER=openai
DEFAULT_TTS_VOICE=alloy
DEFAULT_TTS_MODEL=tts-1
DEFAULT_STT_MODEL=whisper-1

# Persistence settings
ENABLE_PERSISTENCE=true
DATABASE_URL=orchestrator.db

# Future providers
GEMINI_API_KEY=

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Reserved for rate limiting / auth (future)
API_KEY=
```

## Dev
```
uv sync --group dev
uv run uvicorn orchestrator.api.main:app --reload --port 8010
```

## Tests
```
uv run pytest -q
```

## Implemented Tools
- fs.read
- fs.write
- fs.apply_patch
- git.status
- terminal.exec (whitelist)
- speech.transcribe (audio -> text)
- speech.synthesize (text -> audio)

## Speech Features

The speech subsystem provides:

- **Transcription**: Convert audio to text using OpenAI Whisper
- **Synthesis**: Convert text to speech using OpenAI TTS
- **Provider abstraction**: Easy to add Google Cloud Speech, Azure, etc.
- **Tool integration**: Direct access via `speech.transcribe` and `speech.synthesize` tools

### Speech Tool Usage

**Transcribe audio:**
```json
{
  "name": "speech.transcribe",
  "params": {
    "audio_base64": "UklGRigAAABXQVZFZm10...",
    "provider": "openai",
    "language": "en",
    "model": "whisper-1"
  }
}
```

**Synthesize speech:**
```json
{
  "name": "speech.synthesize", 
  "params": {
    "text": "Hello world",
    "provider": "openai",
    "voice": "alloy",
    "format": "mp3",
    "speed": 1.0
  }
}
```

## Persistence Features

The persistence layer provides:

- **Session tracking**: Each chat session is stored with metadata
- **Message history**: All user and assistant messages are persisted
- **Tool execution logs**: Complete audit trail of tool calls and results
- **SQLite foundation**: Ready for Postgres migration

### Database Schema

- `sessions`: Chat sessions with user mapping and metadata
- `messages`: Individual messages with token counts and cost estimates  
- `tool_executions`: Tool calls with inputs, outputs, timing, and status

When `ENABLE_PERSISTENCE=true`, all chat interactions are automatically logged to the database specified by `DATABASE_URL`.

## Planned Tools / Features
- retrieval.search
- git.create_pr
- deploy.cloud_run
- rate limiting & auth
- Google Cloud Speech provider
- Postgres migration utilities

## Notes
This service builds on the MVP foundation with speech and persistence capabilities. The modular design allows features to be enabled/disabled via configuration.
