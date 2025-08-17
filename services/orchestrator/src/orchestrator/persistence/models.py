from __future__ import annotations
import sqlite3
import json
import aiosqlite
from datetime import datetime
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict
from pathlib import Path
import logging

logger = logging.getLogger("orchestrator.persistence")

@dataclass
class Session:
    """Chat session model"""
    id: str
    created_at: datetime
    user_id: Optional[str] = None
    title: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

@dataclass
class Message:
    """Chat message model"""
    id: str
    session_id: str
    role: str  # user, assistant, system
    content: str
    content_json: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    tokens_in: Optional[int] = None
    tokens_out: Optional[int] = None
    cost_estimate: Optional[float] = None

@dataclass
class ToolExecution:
    """Tool execution record"""
    id: str
    message_id: str
    tool_name: str
    input_json: Dict[str, Any]
    output_json: Optional[Dict[str, Any]] = None
    status: str = "pending"  # pending, running, completed, failed
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    error_message: Optional[str] = None

class Database:
    """SQLite database manager with async support"""
    
    def __init__(self, db_path: str = "orchestrator.db"):
        self.db_path = Path(db_path)
        
    async def init_schema(self):
        """Initialize database schema"""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    id TEXT PRIMARY KEY,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    user_id TEXT,
                    title TEXT,
                    metadata TEXT
                )
            """)
            
            await db.execute("""
                CREATE TABLE IF NOT EXISTS messages (
                    id TEXT PRIMARY KEY,
                    session_id TEXT NOT NULL,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    content_json TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    tokens_in INTEGER,
                    tokens_out INTEGER,
                    cost_estimate REAL,
                    FOREIGN KEY (session_id) REFERENCES sessions (id)
                )
            """)
            
            await db.execute("""
                CREATE TABLE IF NOT EXISTS tool_executions (
                    id TEXT PRIMARY KEY,
                    message_id TEXT NOT NULL,
                    tool_name TEXT NOT NULL,
                    input_json TEXT NOT NULL,
                    output_json TEXT,
                    status TEXT DEFAULT 'pending',
                    started_at TIMESTAMP,
                    finished_at TIMESTAMP,
                    error_message TEXT,
                    FOREIGN KEY (message_id) REFERENCES messages (id)
                )
            """)
            
            # Create indexes for better query performance
            await db.execute("CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages (session_id)")
            await db.execute("CREATE INDEX IF NOT EXISTS idx_tool_executions_message_id ON tool_executions (message_id)")
            await db.execute("CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id)")
            
            await db.commit()
            logger.info("database_schema_initialized", extra={"db_path": str(self.db_path)})
    
    async def create_session(self, session: Session) -> Session:
        """Create a new session"""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                INSERT INTO sessions (id, created_at, user_id, title, metadata)
                VALUES (?, ?, ?, ?, ?)
            """, (
                session.id,
                session.created_at.isoformat(),
                session.user_id,
                session.title,
                json.dumps(session.metadata) if session.metadata else None
            ))
            await db.commit()
            return session
    
    async def get_session(self, session_id: str) -> Optional[Session]:
        """Get session by ID"""
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute("SELECT * FROM sessions WHERE id = ?", (session_id,)) as cursor:
                row = await cursor.fetchone()
                if row:
                    return Session(
                        id=row[0],
                        created_at=datetime.fromisoformat(row[1]),
                        user_id=row[2],
                        title=row[3],
                        metadata=json.loads(row[4]) if row[4] else None
                    )
                return None
    
    async def create_message(self, message: Message) -> Message:
        """Create a new message"""
        if not message.created_at:
            message.created_at = datetime.now()
            
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                INSERT INTO messages (id, session_id, role, content, content_json, created_at, tokens_in, tokens_out, cost_estimate)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                message.id,
                message.session_id,
                message.role,
                message.content,
                json.dumps(message.content_json) if message.content_json else None,
                message.created_at.isoformat(),
                message.tokens_in,
                message.tokens_out,
                message.cost_estimate
            ))
            await db.commit()
            return message
    
    async def get_session_messages(self, session_id: str, limit: int = 100) -> List[Message]:
        """Get messages for a session"""
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute("""
                SELECT * FROM messages WHERE session_id = ? 
                ORDER BY created_at DESC LIMIT ?
            """, (session_id, limit)) as cursor:
                rows = await cursor.fetchall()
                return [
                    Message(
                        id=row[0],
                        session_id=row[1],
                        role=row[2],
                        content=row[3],
                        content_json=json.loads(row[4]) if row[4] else None,
                        created_at=datetime.fromisoformat(row[5]) if row[5] else None,
                        tokens_in=row[6],
                        tokens_out=row[7],
                        cost_estimate=row[8]
                    )
                    for row in rows
                ]
    
    async def create_tool_execution(self, execution: ToolExecution) -> ToolExecution:
        """Create a new tool execution record"""
        if not execution.started_at:
            execution.started_at = datetime.now()
            
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                INSERT INTO tool_executions (id, message_id, tool_name, input_json, output_json, status, started_at, finished_at, error_message)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                execution.id,
                execution.message_id,
                execution.tool_name,
                json.dumps(execution.input_json),
                json.dumps(execution.output_json) if execution.output_json else None,
                execution.status,
                execution.started_at.isoformat() if execution.started_at else None,
                execution.finished_at.isoformat() if execution.finished_at else None,
                execution.error_message
            ))
            await db.commit()
            return execution
    
    async def update_tool_execution(self, execution_id: str, status: str, output_json: Optional[Dict[str, Any]] = None, error_message: Optional[str] = None) -> None:
        """Update tool execution status and output"""
        finished_at = datetime.now() if status in ["completed", "failed"] else None
        
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                UPDATE tool_executions 
                SET status = ?, output_json = ?, error_message = ?, finished_at = ?
                WHERE id = ?
            """, (
                status,
                json.dumps(output_json) if output_json else None,
                error_message,
                finished_at.isoformat() if finished_at else None,
                execution_id
            ))
            await db.commit()

# Global database instance
db = Database()