from __future__ import annotations
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class OntologyItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    key: str = Field(index=True)
    title: str
    body: str
    tags: str | None = None  # JSON string
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ParsingItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    source: str = Field(index=True)
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class VectorChunk(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    source: str = Field(index=True)
    content: str
    embedding: str | None = None  # JSON list
    dim: int | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class GraphEdge(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    src_id: int
    dst_id: int
    relation: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Session(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity: datetime = Field(default_factory=datetime.utcnow)


class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(index=True)
    role: str
    content_json: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ToolExecution(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    message_id: int | None = Field(default=None, index=True)
    tool_name: str
    input_json: str
    output_json: str | None = None
    status: str = Field(default="completed")
    started_at: datetime = Field(default_factory=datetime.utcnow)
    finished_at: datetime | None = None
