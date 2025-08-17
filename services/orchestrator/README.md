# Orchestrator Service

Implements chat streaming, provider abstraction (OpenAI + Gemini stub), tool registry (fs, git, terminal, patch, **speech, memory**), and SSE endpoint `/chat/stream`.

## Endpoints

### Chat
- `POST /chat/stream` (SSE): body `{message: string, session_id?: string, model?: string, provider?: string, tool_calls?: [{name, params}], include_memory?: boolean}`

### Tools
- `GET /tools` list registered tools.
- `GET /healthz` health & allowed tools.

### Speech (STT/TTS)
- `POST /speech/transcribe` transcribe audio to text (multipart file or base64 JSON)
  - Multipart: `file` + optional `provider`, `language` form fields
  - JSON: `{"audio_data": "base64...", "provider": "openai", "language": "en"}`
- `POST /speech/tts` synthesize text to speech
  - JSON: `{"text": "Hello", "provider": "openai", "voice": "alloy", "format": "mp3"}`
- `GET /speech/providers` list available speech providers

### Memory/Persistence
- `POST /memory/retrieve` search memory across axes
  - JSON: `{"query": "search term", "top_k": 5, "axes": ["ontology", "vectors"]}`
- `POST /memory/store` store content in memory
  - JSON: `{"content": "text", "source": "file.txt", "content_type": "vector", "generate_embedding": true}`
- `GET /memory/stats` get database statistics

## Streaming Event Types
```json
{"type":"token","token":"..."}
{"type":"tool_result","tool":"fs.read","data":{...}}
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
SPEECH_MODEL=whisper-1
TTS_VOICE=alloy
ENABLE_SPEECH=true

# Memory/Persistence settings
DATABASE_URL=sqlite:///data/orchestrator.db
EMBEDDING_MODEL=text-embedding-3-small
ENABLE_MEMORY=true

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
- **speech.transcribe**
- **speech.synthesize**
- **memory.search**
- **memory.store**

## Speech Usage Examples

### Transcribe Audio (cURL)
```bash
# Multipart file upload
curl -X POST "http://localhost:8010/speech/transcribe" \
  -F "file=@audio.mp3" \
  -F "provider=openai" \
  -F "language=en"

# Base64 JSON
curl -X POST "http://localhost:8010/speech/transcribe" \
  -H "Content-Type: application/json" \
  -d '{"audio_data":"UklGRnoAAABXQVZF...", "provider":"openai"}'
```

### Text-to-Speech (cURL)
```bash
curl -X POST "http://localhost:8010/speech/tts" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world", "provider":"openai", "voice":"alloy", "format":"mp3"}'
```

### Using Speech Tools in Chat
```bash
curl -X POST "http://localhost:8010/chat/stream" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Please transcribe this audio",
    "tool_calls": [{
      "name": "speech.transcribe",
      "params": {"audio_data": "UklGRnoAAABXQVZF...", "provider": "openai"}
    }]
  }'
```

## Memory Usage Examples

### Store Content
```bash
curl -X POST "http://localhost:8010/memory/store" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Machine learning is a subset of artificial intelligence",
    "source": "ml_concepts.txt",
    "content_type": "vector",
    "generate_embedding": true
  }'
```

### Search Memory
```bash
curl -X POST "http://localhost:8010/memory/retrieve" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "machine learning",
    "top_k": 5,
    "axes": ["ontology", "vectors", "parsing"]
  }'
```

### Chat with Memory Context
```bash
curl -X POST "http://localhost:8010/chat/stream" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What do you know about machine learning?",
    "include_memory": true
  }'
```

## Architecture

### Speech Subsystem
- **Provider Interface**: `SpeechProvider` with `transcribe()` and `synthesize()` methods
- **OpenAI Provider**: Uses Whisper for STT and TTS API for speech synthesis
- **Google Stub**: Placeholder implementation for future Google Cloud integration
- **Tools**: `speech.transcribe` and `speech.synthesize` for chat integration

### Memory/Persistence Layer
- **Database**: SQLite (default) or PostgreSQL via `DATABASE_URL`
- **Four Axes**: Ontology items, parsing items, vector chunks, graph edges
- **Vector Search**: Naive similarity with lexical fallback
- **Embeddings**: OpenAI text-embedding-3-small (default) with Google stub
- **Tools**: `memory.search` and `memory.store` for chat integration
- **Chat Integration**: `include_memory=true` prepends relevant context to system prompt

## Planned Tools / Features
- retrieval.search ✅ (implemented as memory.search)
- speech.transcribe / speech.synthesize ✅
- git.create_pr
- deploy.cloud_run
- rate limiting & auth
- Advanced vector similarity with pgvector
- Real Google speech integration

## Notes
This service implements MVP speech and memory subsystems. The memory system uses naive vector search with lexical fallback. For production, consider upgrading to pgvector for advanced similarity search.
