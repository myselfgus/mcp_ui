from __future__ import annotations
import os
from pathlib import Path
from sqlmodel import SQLModel, create_engine, Session
from ..config import settings
import logging

logger = logging.getLogger("orchestrator.memory")

# Create data directory if it doesn't exist
def ensure_data_directory():
    """Ensure the data directory exists for SQLite database."""
    if settings.database_url.startswith("sqlite"):
        # Extract path from SQLite URL (e.g., "sqlite:///data/orchestrator.db" -> "data/orchestrator.db")
        db_path = settings.database_url.replace("sqlite:///", "")
        db_dir = Path(db_path).parent
        db_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Ensured database directory exists: {db_dir}")

# Create database engine
def create_db_engine():
    """Create database engine based on configuration."""
    ensure_data_directory()
    
    # SQLite specific configuration
    if settings.database_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
        engine = create_engine(settings.database_url, connect_args=connect_args)
    else:
        # PostgreSQL or other databases
        engine = create_engine(settings.database_url)
    
    logger.info(f"Created database engine for: {settings.database_url}")
    return engine

# Global engine instance
engine = create_db_engine()

def init_database():
    """Initialize database tables."""
    try:
        # Import all models to ensure they're registered
        from .models import (
            OntologyItem, ParsingItem, VectorChunk, GraphEdge, 
            Metadata, Message, Session, ToolExecution
        )
        
        # Create all tables
        SQLModel.metadata.create_all(engine)
        logger.info("Database tables created successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise


def get_db_session():
    """Get a database session."""
    return Session(engine)


# Auto-initialize on module import if enabled
if settings.enable_memory:
    init_database()