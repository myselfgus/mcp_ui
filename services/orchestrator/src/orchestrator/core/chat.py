from __future__ import annotations
from typing import AsyncIterator, Any, List, Dict
from ..providers.base import provider_registry
import logging
from ..config import settings
from ..tools.base import tool_registry
from ..persistence.models import db, Session, Message, ToolExecution
import uuid
from datetime import datetime

logger = logging.getLogger("orchestrator.tools")

async def run_tools(tool_calls: List[Dict[str, Any]], message_id: str | None = None):
    for call in tool_calls:
        name = call["name"]
        params = call.get("params", {})
        
        # Create tool execution record if persistence is enabled
        execution_id = str(uuid.uuid4())
        if settings.enable_persistence and message_id:
            execution = ToolExecution(
                id=execution_id,
                message_id=message_id,
                tool_name=name,
                input_json=params,
                status="running"
            )
            await db.create_tool_execution(execution)
        
        try:
            tool = tool_registry.get(name)
            result = await tool.run(**params)
            
            # Update execution record on success
            if settings.enable_persistence and message_id:
                await db.update_tool_execution(execution_id, "completed", output_json=result)
                
            logger.info("tool_run", extra={"tool": name, "execution_id": execution_id})
            yield {"type": "tool_result", "tool": name, "data": result, "execution_id": execution_id}
            
        except Exception as e:
            # Update execution record on failure
            if settings.enable_persistence and message_id:
                await db.update_tool_execution(execution_id, "failed", error_message=str(e))
                
            logger.error("tool_run_error", extra={"tool": name, "error": str(e), "execution_id": execution_id})
            yield {"type": "tool_error", "tool": name, "error": str(e), "execution_id": execution_id}

async def chat_stream(messages: List[Dict[str, str]], model: str | None = None, provider: str = "openai", tool_calls: List[Dict[str, Any]] | None = None, session_id: str | None = None) -> AsyncIterator[Dict[str, Any]]:
    # Create session if needed and persistence is enabled
    if settings.enable_persistence and session_id:
        existing_session = await db.get_session(session_id)
        if not existing_session:
            session = Session(
                id=session_id,
                created_at=datetime.now(),
                title=f"Chat {session_id[:8]}"
            )
            await db.create_session(session)
    
    # Store user message if persistence is enabled
    message_id = None
    if settings.enable_persistence and session_id and messages:
        user_message = messages[-1]  # Assume last message is from user
        message_id = str(uuid.uuid4())
        message = Message(
            id=message_id,
            session_id=session_id,
            role=user_message["role"],
            content=user_message["content"]
        )
        await db.create_message(message)
    
    # Run tools if provided
    if tool_calls:
        async for tr in run_tools(tool_calls, message_id):
            yield tr
    
    # Stream chat response
    assistant_message_id = str(uuid.uuid4()) if settings.enable_persistence and session_id else None
    assistant_content = ""
    
    prov = provider_registry.get(provider)
    async for chunk in prov.stream_chat(messages, model=model or settings.default_model):
        if chunk.get("type") == "token":
            assistant_content += chunk.get("token", "")
        yield chunk
    
    # Store assistant message if persistence is enabled
    if settings.enable_persistence and session_id and assistant_message_id:
        assistant_message = Message(
            id=assistant_message_id,
            session_id=session_id,
            role="assistant",
            content=assistant_content
        )
        await db.create_message(assistant_message)
    
    yield {"type": "end", "reason": "completed"}
