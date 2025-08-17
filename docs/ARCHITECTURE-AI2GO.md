# AI2GO Integrated Agent Platform Architecture

This document captures the proposed unified architecture combining:
- mcp-ui (UI resource rendering & SDKs)
- fast-agent (Python MCP / agent runtime)
- ai2go (multi-service orchestration, LibreChat UI heritage)

## High-Level Goals
1. Single conversational interface (web, later desktop) with multi-provider LLM (OpenAI, Anthropic, Gemini, local) and tool-augmented agent.
2. Secure "computer-mode": file read/write, terminal commands, git operations, environment setup, deployment (Cloud Run) via explicit tool calls & guardrails.
3. Pluggable tool registry (MCP tools + internal Python/Node tools) returning standard JSON and optionally `UIResource` payloads.
4. Retrieval & context management: repository indexing + semantic search + embeddings (pgvector) feeding planner.
5. Observability: structured logs, spans (OpenTelemetry), token usage accounting.
6. Speech: STT + TTS (OpenAI Realtime, Whisper, or Google Cloud Speech + TTS) unified under a single abstraction.

## Core Components
| Layer | Responsibility | Tech Stack |
|-------|----------------|-----------|
| UI / Frontend | Chat, tool results, file tree, diff viewer, terminal, audio controls | Next.js (or existing LibreChat extension), React, Tailwind, mcp-ui client |
| API Gateway (optional) | Auth, session mgmt, SSE/WebSocket multiplex, rate limiting | Node (Express/Fastify) or Python FastAPI (decide after POC) |
| Agent Orchestrator | Tool planning, multi-step reasoning, calling LLM providers, memory | Python (fast-agent + extensions) |
| Tool Services | Git, FS, Terminal, Deploy, Retrieval, Speech, etc. | Python (shared), some Go (existing genai-toolbox) |
| Persistence | Sessions, messages, artifacts, vector embeddings | Postgres (+ pgvector), Redis (caching/locks) |
| Storage | Large artifacts, logs, model caches | GCS bucket (later) |
| Deployment | Container images & runtime | Cloud Run (multi-service) |

## Data Model (Implemented)
```
# Chat & Sessions
Session(id, title, created_at, last_activity)
Message(id, session_id, role, content_json, created_at)
ToolExecution(id, message_id, tool_name, input_json, output_json, status, started_at, finished_at)

# Memory Four Axes (Implemented)
OntologyItem(id, key, title, body, created_at, updated_at, tags)
ParsingItem(id, source, content, created_at)  
VectorChunk(id, source, content, embedding, dim, created_at)
GraphEdge(id, src_id, dst_id, relation, created_at)
Metadata(id, key, value_json, updated_at)
```

## Tool Invocation Flow (Updated)
1. User message received with optional `include_memory=true`.
2. **Memory retrieval**: If enabled, search relevant context across 4 axes (ontology, parsing, vectors, graphs).
3. **Context augmentation**: Prepend memory results to system prompt for enhanced context.
4. Planner selects tools (chain-of-thought or static mapping) -> plan graph.
5. Executor runs each tool sequentially or in parallel (bounded), collecting results.
6. Aggregated tool context appended to assistant prompt & final LLM call produced.
7. UI receives streaming tokens + structured side-channel events (tool_start, tool_end, patch, notify, ui_resource).

## Security & Guardrails
- Path allowlist for FS operations.
- Terminal sandbox (ephemeral container OR subprocess with seccomp profile) + command classification (denylist & confirmation for risky commands).
- Secrets stored only in GitHub/GCP Secret Manager; no echo in logs (redaction regex for API keys).
- Rate limiting per user+LLM provider (sliding window) at API gateway.
- Tool execution timeouts + max output size caps.

## Speech Subsystem (Implemented)
Provider interface (Python):
```python
class SpeechProvider:
  async def transcribe(audio_bytes: bytes, language?: str) -> Dict[str, Any]
  async def synthesize(text: str, voice?: str, format?: str) -> bytes
```
**Implemented providers:**
- ✅ OpenAI: Whisper (transcription) + TTS API (synthesis)
- ✅ Google Cloud: Stub implementation (placeholder for future integration)

**API endpoints:**
- `POST /speech/transcribe` (multipart file or base64 JSON)
- `POST /speech/tts` (JSON with text, voice, format options)
- `GET /speech/providers` (list available providers)

**Tools:** `speech.transcribe`, `speech.synthesize` integrated with chat system.

## Memory/Persistence Layer (Implemented)
**Four-axis architecture:**
- **Ontology**: Structured knowledge items with key, title, body, tags
- **Parsing**: Raw parsed content with source attribution  
- **Vectors**: Content chunks with embeddings for semantic search
- **Graphs**: Entity relationships with typed edges

**Database:** SQLite (default) or PostgreSQL via `DATABASE_URL`

**Vector search:** Naive cosine similarity with lexical fallback when embeddings unavailable

**Embedding providers:**
- ✅ OpenAI: text-embedding-3-small (default)
- ✅ Google: Stub implementation (placeholder)

**API endpoints:**
- `POST /memory/retrieve` (cross-axis search with query, top_k, axes filter)
- `POST /memory/store` (store content with optional embedding generation)
- `GET /memory/stats` (database statistics)

**Tools:** `memory.search`, `memory.store` integrated with chat system

**Chat integration:** `include_memory=true` automatically augments system prompt with relevant context

## MCP Integration
- Orchestrator exposes internal tools as MCP tools.
- External MCP servers (fast-agent, others) can be attached; UI renders `UIResource` using mcp-ui client.
- Adapter Python util to produce UIResource dictionaries (already started for fast-agent).

## Deployment Model
- Separate Cloud Run services: ui-gateway, orchestrator, retrieval-worker, speech-worker (optional), vector-index.
- Shared VPC & Artifact Registry; GitHub Actions builds tagged images.
- Rollout strategy: manual promote (staging -> prod) with environment-level secrets.

## Observability
- OpenTelemetry SDK in Python & Node; OTLP export -> Cloud Trace / Tempo.
- Structured JSON logs with trace_id for correlation.
- Metrics: tool latency, failure ratios, token usage, cost per session.

## Roadmap (Updated)
**Wave 1 (MVP) ✅ COMPLETED:**
- ✅ Chat UI, provider abstraction, FS/Git/Terminal tools
- ✅ Speech subsystem (OpenAI Whisper + TTS, Google stub)
- ✅ Memory/persistence layer (4-axis with naive vector search)
- ✅ Basic planner with memory context integration

**Wave 2 (In Progress):**
- [ ] Advanced vector similarity with pgvector
- [ ] PR automation tools
- [ ] Real Google Cloud Speech integration  
- [ ] Cost accounting and token tracking
- [ ] Enhanced retrieval algorithms
Wave 3: Multi-agent orchestration, advanced UI diff/patch viewer, desktop wrapper.
Wave 4: Plugin store, local model integration, advanced sandbox isolation.

## Open Questions
- Single gateway (Node) vs direct browser -> Python orchestrator? (Decide after prototype of streaming & auth.)
- Persistence backend initial: can start with SQLite + pgvector (testing) then migrate to Postgres.
- Choose TTS default voice & caching strategy.

## Next Steps (Execution)
1. Create `apps/web` skeleton with Next.js & chat layout.
2. Create `services/orchestrator` (FastAPI) with `/chat` SSE + tool registry.
3. Implement provider abstraction (OpenAI & Gemini first) in orchestrator.
4. Implement FS/Git/Terminal tool stubs + path allowlist config.
5. Add speech provider interface + OpenAI implementation stub.
6. Add GitHub Action building orchestrator & web images.
7. Add Postgres schema migrations (SQL or Alembic) for messages + sessions.

---
Document version: 0.1 (initial draft)
