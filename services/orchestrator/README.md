# Orchestrator Service

Implements chat streaming, provider abstraction (OpenAI + Gemini stub), tool registry (fs, git, terminal, patch), and SSE endpoint `/chat/stream`.

## Endpoints
- `POST /chat/stream` (SSE): body `{message: string, session_id?: string, model?: string, provider?: string, tool_calls?: [{name, params}]}`
- `GET /tools` list registered tools.
- `GET /healthz` health & allowed tools.
- `POST /speech/transcribe` body `{audio_base64, provider?, language?}` -> `{text, provider}`
- `POST /speech/tts` body `{text, provider?, voice?, format?}` -> `{audio_base64, voice, format}`

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
GEMINI_API_KEY=
DEFAULT_MODEL=gpt-4o-mini
ALLOW_FS_BASE=/workspaces
ENABLE_TERMINAL=true
ENABLE_GIT=true
LOG_LEVEL=info
LOG_FORMAT=json
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
- speech.transcribe
- speech.synthesize

## Planned Tools / Features
- speech.transcribe / speech.synthesize
- retrieval.search
- git.create_pr
- deploy.cloud_run
- rate limiting & auth
 - memory.search (after persistence layer)

## Notes
This service is an evolving MVP. Persistence & memory (retrieval / embeddings / graphs) coming next.
