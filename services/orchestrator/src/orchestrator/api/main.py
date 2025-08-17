from __future__ import annotations
from fastapi import FastAPI, HTTPException, Request, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any
import base64
import json
from ..core.chat import chat_stream
from ..speech.base import speech_registry  # ensure providers imported
from ..speech import openai_speech  # noqa: F401 - register provider
from ..tools.base import tool_registry
import time
import logging

logger = logging.getLogger("orchestrator")
logging.basicConfig(level=logging.INFO)
from ..config import settings

app = FastAPI(title="Orchestrator Service")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = None
    try:
        response = await call_next(request)
        return response
    finally:
        duration = (time.time() - start) * 1000
        logger.info(
            "request",
            extra={
                "path": request.url.path,
                "method": request.method,
                "status": getattr(response, 'status_code', 'NA'),
                "ms": round(duration, 2),
            },
        )

class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    model: str | None = None
    provider: str | None = None
    tool_calls: List[Dict[str, Any]] | None = None  # [{name: str, params: {...}}]

@app.post("/chat/stream")
async def chat_stream_endpoint(req: ChatRequest):
    msgs = [{"role": "user", "content": req.message}]

    async def event_source():
        try:
            async for evt in chat_stream(msgs, model=req.model, provider=req.provider or "openai", tool_calls=req.tool_calls):
                yield f"data: {json.dumps(evt)}\n\n"
        except Exception as e:  # noqa: BLE001
            err = {"type": "error", "error": str(e)}
            yield f"data: {json.dumps(err)}\n\n"

    return StreamingResponse(event_source(), media_type="text/event-stream")

@app.get("/healthz")
async def healthz():
    return {"status": "ok", "allowed_tools": settings.allowed_tools}

@app.get("/tools")
async def list_tools():
    return {"tools": tool_registry.list()}


class TranscribeBody(BaseModel):
    audio_base64: str
    provider: str | None = None
    language: str | None = None


@app.post("/speech/transcribe")
async def transcribe_audio(body: TranscribeBody):
    if not settings.enable_speech:
        raise HTTPException(status_code=400, detail="Speech disabled")
    audio_bytes = base64.b64decode(body.audio_base64)
    prov = speech_registry.get(body.provider or "openai")
    return await prov.transcribe(audio_bytes, language=body.language)


class SynthesizeBody(BaseModel):
    text: str
    provider: str | None = None
    voice: str | None = None
    format: str | None = None


@app.post("/speech/tts")
async def synthesize_text(body: SynthesizeBody):
    if not settings.enable_speech:
        raise HTTPException(status_code=400, detail="Speech disabled")
    prov = speech_registry.get(body.provider or "openai")
    return await prov.synthesize(body.text, voice=body.voice, format=body.format or "mp3")
