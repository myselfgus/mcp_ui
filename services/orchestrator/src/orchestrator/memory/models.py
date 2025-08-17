from __future__ import annotations
from sqlmodel import SQLModel, Field, Column, JSON
from sqlalchemy import Text
from datetime import datetime
from typing import Dict, Any, List, Optional
import json


class OntologyItem(SQLModel, table=True):
    """Ontology items for knowledge representation."""
    __tablename__ = "ontology_items"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    key: str = Field(index=True)
    title: str
    body: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    tags: Optional[str] = Field(default=None, sa_column=Column(Text))  # Store as JSON string
    
    def set_tags(self, tags_dict: Dict[str, Any]):
        """Set tags as JSON string."""
        self.tags = json.dumps(tags_dict) if tags_dict else None
    
    def get_tags(self) -> Dict[str, Any] | None:
        """Get tags from JSON string."""
        if self.tags:
            return json.loads(self.tags)
        return None


class ParsingItem(SQLModel, table=True):
    """Parsed content items."""
    __tablename__ = "parsing_items"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    source: str
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class VectorChunk(SQLModel, table=True):
    """Vector embeddings for content chunks."""
    __tablename__ = "vector_chunks"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    source: str
    content: str
    embedding: Optional[str] = Field(default=None)  # JSON-encoded list of floats
    dim: Optional[int] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    def set_embedding(self, embedding_vector: List[float]):
        """Set embedding vector as JSON string."""
        self.embedding = json.dumps(embedding_vector)
        self.dim = len(embedding_vector)
    
    def get_embedding(self) -> List[float] | None:
        """Get embedding vector from JSON string."""
        if self.embedding:
            return json.loads(self.embedding)
        return None


class GraphEdge(SQLModel, table=True):
    """Graph relationships between entities."""
    __tablename__ = "graph_edges"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    src_id: str
    dst_id: str
    relation: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Metadata(SQLModel, table=True):
    """Key-value metadata storage."""
    __tablename__ = "metadata"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    key: str = Field(index=True, unique=True)
    value_json: str
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    def set_value(self, value: Any):
        """Set value as JSON string."""
        self.value_json = json.dumps(value)
    
    def get_value(self) -> Any:
        """Get value from JSON string."""
        return json.loads(self.value_json)


class Message(SQLModel, table=True):
    """Chat messages."""
    __tablename__ = "messages"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: str = Field(index=True)
    role: str  # 'user', 'assistant', 'system'
    content_json: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    def set_content(self, content: Any):
        """Set content as JSON string."""
        self.content_json = json.dumps(content)
    
    def get_content(self) -> Any:
        """Get content from JSON string."""
        return json.loads(self.content_json)


class Session(SQLModel, table=True):
    """Chat sessions."""
    __tablename__ = "sessions"
    
    id: Optional[str] = Field(default=None, primary_key=True)
    title: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity: datetime = Field(default_factory=datetime.utcnow)


class ToolExecution(SQLModel, table=True):
    """Tool execution records."""
    __tablename__ = "tool_executions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    message_id: Optional[int] = Field(default=None, foreign_key="messages.id")
    tool_name: str
    input_json: str
    output_json: Optional[str] = Field(default=None)
    status: str  # 'started', 'completed', 'failed'
    started_at: datetime = Field(default_factory=datetime.utcnow)
    finished_at: Optional[datetime] = Field(default=None)
    
    def set_input(self, input_data: Any):
        """Set input as JSON string."""
        self.input_json = json.dumps(input_data)
    
    def get_input(self) -> Any:
        """Get input from JSON string."""
        return json.loads(self.input_json)
    
    def set_output(self, output_data: Any):
        """Set output as JSON string."""
        self.output_json = json.dumps(output_data)
    
    def get_output(self) -> Any:
        """Get output from JSON string."""
        if self.output_json:
            return json.loads(self.output_json)
        return None