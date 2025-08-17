from __future__ import annotations
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any
import json
from ..core.chat import chat_stream
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
