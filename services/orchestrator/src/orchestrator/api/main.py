from __future__ import annotations
from fastapi import FastAPI, HTTPException, Request, File, UploadFile, Form
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel
from typing import List, Dict, Any
import json
import base64
from ..core.chat import chat_stream
from ..tools.base import tool_registry
from ..speech.base import speech_registry
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
    include_memory: bool = False  # Whether to include memory context

@app.post("/chat/stream")
async def chat_stream_endpoint(req: ChatRequest):
    msgs = [{"role": "user", "content": req.message}]
    
    # Add memory context if requested
    if req.include_memory:
        try:
            from ..memory.retrieval import memory_retriever
            # Search for relevant memory
            memory_results = await memory_retriever.search(req.message, top_k=3)
            if memory_results:
                # Prepare memory context
                context_items = []
                for result in memory_results:
                    if result.get('type') == 'ontology':
                        context_items.append(f"Ontology: {result.get('title', '')} - {result.get('body', '')}")
                    elif result.get('type') == 'parsing':
                        context_items.append(f"Parsed content: {result.get('content', '')}")
                    elif result.get('type') == 'vector':
                        context_items.append(f"Document: {result.get('content', '')}")
                    elif result.get('type') == 'graph':
                        context_items.append(f"Relationship: {result.get('src_id', '')} -> {result.get('relation', '')} -> {result.get('dst_id', '')}")
                
                if context_items:
                    memory_context = "Relevant context from memory:\n" + "\n".join(context_items[:5])
                    # Insert memory context as system message
                    msgs.insert(0, {"role": "system", "content": memory_context})
        except Exception as e:
            logger.warning(f"Failed to retrieve memory context: {e}")

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


# Speech API Models
class TranscribeRequest(BaseModel):
    audio_data: str  # base64-encoded audio
    provider: str = "openai"
    language: str | None = None


class SynthesizeRequest(BaseModel):
    text: str
    provider: str = "openai"
    voice: str | None = None
    format: str = "mp3"


# Speech endpoints
@app.post("/speech/transcribe")
async def transcribe_speech(
    file: UploadFile = File(None),
    request: TranscribeRequest = None,
    provider: str = Form("openai"),
    language: str = Form(None)
):
    """
    Transcribe audio to text. Accepts either multipart file upload or JSON with base64 audio data.
    """
    try:
        if file:
            # Handle multipart file upload
            audio_bytes = await file.read()
        elif request and request.audio_data:
            # Handle base64 JSON request
            audio_bytes = base64.b64decode(request.audio_data)
            provider = request.provider
            language = request.language
        else:
            raise HTTPException(status_code=400, detail="Either file upload or audio_data in JSON body required")

        # Get speech provider
        speech_provider = speech_registry.get(provider)
        
        # Perform transcription
        result = await speech_provider.transcribe(audio_bytes, language=language)
        
        return {
            "success": True,
            "provider": provider,
            "result": result
        }
        
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Speech provider not found: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


@app.post("/speech/tts")
async def synthesize_speech(request: SynthesizeRequest):
    """
    Synthesize text to speech. Returns audio data as base64 in JSON response.
    """
    try:
        # Get speech provider
        speech_provider = speech_registry.get(request.provider)
        
        # Perform synthesis
        audio_bytes = await speech_provider.synthesize(
            request.text, 
            voice=request.voice, 
            format=request.format
        )
        
        # Encode as base64 for JSON response
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        return {
            "success": True,
            "provider": request.provider,
            "audio_data": audio_base64,
            "format": request.format,
            "voice": request.voice,
            "size": len(audio_bytes)
        }
        
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Speech provider not found: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speech synthesis failed: {str(e)}")


@app.get("/speech/providers")
async def list_speech_providers():
    """List available speech providers."""
    return {"providers": speech_registry.list()}


# Memory API Models
class MemoryRetrieveRequest(BaseModel):
    query: str
    top_k: int = 5
    axes: List[str] | None = None


class MemoryStoreRequest(BaseModel):
    content: str
    source: str
    content_type: str = "general"
    generate_embedding: bool = True


# Memory endpoints
@app.post("/memory/retrieve")
async def retrieve_memory(request: MemoryRetrieveRequest):
    """
    Retrieve relevant memory based on query across multiple axes.
    """
    try:
        from ..memory.retrieval import memory_retriever
        
        # Perform memory search
        results = await memory_retriever.search(
            query=request.query,
            top_k=request.top_k,
            axes=request.axes
        )
        
        return {
            "success": True,
            "query": request.query,
            "top_k": request.top_k,
            "axes": request.axes,
            "results": results,
            "total_results": len(results)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Memory retrieval failed: {str(e)}")


@app.post("/memory/store")
async def store_memory(request: MemoryStoreRequest):
    """
    Store content in memory with optional embedding generation.
    """
    try:
        from ..memory.tools import MemoryStoreTool
        
        # Use the memory store tool
        store_tool = MemoryStoreTool()
        result = await store_tool.run(
            content=request.content,
            source=request.source,
            content_type=request.content_type,
            generate_embedding=request.generate_embedding
        )
        
        if result.get("success"):
            return result
        else:
            raise HTTPException(status_code=400, detail=result.get("error", "Storage failed"))
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Memory storage failed: {str(e)}")


@app.get("/memory/stats")
async def memory_stats():
    """Get memory database statistics."""
    try:
        from ..memory.database import get_db_session
        from ..memory.models import VectorChunk, OntologyItem, ParsingItem, GraphEdge, Message, Session
        from sqlmodel import select, func
        
        with get_db_session() as session:
            stats = {}
            
            # Count items in each table
            stats["vector_chunks"] = session.exec(select(func.count(VectorChunk.id))).first()
            stats["ontology_items"] = session.exec(select(func.count(OntologyItem.id))).first()
            stats["parsing_items"] = session.exec(select(func.count(ParsingItem.id))).first()
            stats["graph_edges"] = session.exec(select(func.count(GraphEdge.id))).first()
            stats["messages"] = session.exec(select(func.count(Message.id))).first()
            stats["sessions"] = session.exec(select(func.count(Session.id))).first()
            
            # Count chunks with embeddings
            stats["chunks_with_embeddings"] = session.exec(
                select(func.count(VectorChunk.id)).where(VectorChunk.embedding.is_not(None))
            ).first()
            
            return {
                "success": True,
                "stats": stats
            }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get memory stats: {str(e)}")
