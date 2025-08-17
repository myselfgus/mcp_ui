from __future__ import annotations
from typing import Any, Dict, List, Optional
from ..tools.base import Tool, tool_registry
from .retrieval import memory_retriever
import logging

logger = logging.getLogger("orchestrator.memory.tools")


class MemorySearchTool(Tool):
    """Tool for searching memory across multiple axes."""
    name = "memory.search"
    description = "Search memory across ontology, parsing, vectors, and graph axes"

    async def run(self, query: str, top_k: int = 5, axes: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Search memory using the retrieval system.
        
        Args:
            query: Search query
            top_k: Number of results to return (default: 5)
            axes: List of axes to search (default: all)
            
        Returns:
            Search results with metadata
        """
        try:
            if axes is None:
                axes = ['ontology', 'parsing', 'vectors', 'graphs']
            
            # Validate axes
            valid_axes = {'ontology', 'parsing', 'vectors', 'graphs'}
            invalid_axes = set(axes) - valid_axes
            if invalid_axes:
                return {
                    "success": False,
                    "error": f"Invalid axes: {invalid_axes}. Valid axes are: {valid_axes}"
                }
            
            # Perform search
            results = await memory_retriever.search(query, top_k=top_k, axes=axes)
            
            logger.info("memory_search", extra={
                "query": query,
                "top_k": top_k,
                "axes": axes,
                "num_results": len(results)
            })
            
            return {
                "success": True,
                "query": query,
                "top_k": top_k,
                "axes": axes,
                "results": results,
                "total_results": len(results)
            }
            
        except Exception as e:
            logger.error("memory_search_error", extra={
                "query": query,
                "error": str(e)
            })
            return {
                "success": False,
                "error": str(e),
                "query": query
            }


class MemoryStoreTool(Tool):
    """Tool for storing content in memory."""
    name = "memory.store"
    description = "Store content in memory with optional embedding generation"

    async def run(self, content: str, source: str, content_type: str = "general", generate_embedding: bool = True) -> Dict[str, Any]:
        """
        Store content in memory.
        
        Args:
            content: Content to store
            source: Source identifier
            content_type: Type of content ('ontology', 'parsing', 'vector', 'general')
            generate_embedding: Whether to generate embedding for vector search
            
        Returns:
            Storage result with metadata
        """
        try:
            from .database import get_db_session
            from .models import VectorChunk, ParsingItem, OntologyItem
            from .embeddings import embedding_registry
            
            with get_db_session() as session:
                if content_type == "vector" or (content_type == "general" and generate_embedding):
                    # Store as vector chunk with embedding
                    chunk = VectorChunk(source=source, content=content)
                    
                    if generate_embedding:
                        try:
                            embedding_provider = embedding_registry.get("openai")
                            embedding = await embedding_provider.embed_text(content)
                            chunk.set_embedding(embedding)
                        except Exception as e:
                            logger.warning(f"Failed to generate embedding: {e}")
                    
                    session.add(chunk)
                    session.commit()
                    session.refresh(chunk)
                    
                    logger.info("memory_store_vector", extra={
                        "source": source,
                        "content_length": len(content),
                        "has_embedding": chunk.embedding is not None,
                        "chunk_id": chunk.id
                    })
                    
                    return {
                        "success": True,
                        "type": "vector",
                        "id": chunk.id,
                        "source": source,
                        "has_embedding": chunk.embedding is not None,
                        "embedding_dim": chunk.dim
                    }
                
                elif content_type == "parsing":
                    # Store as parsing item
                    item = ParsingItem(source=source, content=content)
                    session.add(item)
                    session.commit()
                    session.refresh(item)
                    
                    logger.info("memory_store_parsing", extra={
                        "source": source,
                        "content_length": len(content),
                        "item_id": item.id
                    })
                    
                    return {
                        "success": True,
                        "type": "parsing",
                        "id": item.id,
                        "source": source
                    }
                
                elif content_type == "ontology":
                    # Store as ontology item (requires key and title)
                    # For simplicity, use source as key and first line as title
                    lines = content.split('\n', 1)
                    title = lines[0][:100] if lines else source
                    body = lines[1] if len(lines) > 1 else content
                    
                    item = OntologyItem(key=source, title=title, body=body)
                    session.add(item)
                    session.commit()
                    session.refresh(item)
                    
                    logger.info("memory_store_ontology", extra={
                        "source": source,
                        "key": item.key,
                        "title": title,
                        "item_id": item.id
                    })
                    
                    return {
                        "success": True,
                        "type": "ontology",
                        "id": item.id,
                        "key": item.key,
                        "title": title
                    }
                
                else:
                    return {
                        "success": False,
                        "error": f"Unknown content_type: {content_type}. Use 'vector', 'parsing', 'ontology', or 'general'"
                    }
            
        except Exception as e:
            logger.error("memory_store_error", extra={
                "source": source,
                "content_type": content_type,
                "error": str(e)
            })
            return {
                "success": False,
                "error": str(e),
                "source": source,
                "content_type": content_type
            }


# Register memory tools
tool_registry.register(MemorySearchTool())
tool_registry.register(MemoryStoreTool())