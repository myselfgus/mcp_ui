from __future__ import annotations
from typing import List, Dict, Any, Optional
from sqlmodel import select, func
from .database import get_db_session
from .models import VectorChunk, OntologyItem, ParsingItem, GraphEdge
from .embeddings import embedding_registry
import numpy as np
import logging
import json

logger = logging.getLogger("orchestrator.memory.retrieval")


class MemoryRetriever:
    """Memory retrieval system with naive vector search and lexical fallback."""
    
    def __init__(self, embedding_provider: str = "openai"):
        self.embedding_provider = embedding_provider
    
    async def search(self, query: str, top_k: int = 5, axes: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """
        Search memory across multiple axes.
        
        Args:
            query: Search query
            top_k: Number of results to return
            axes: List of axes to search ('ontology', 'parsing', 'vectors', 'graphs')
            
        Returns:
            List of search results with metadata
        """
        if axes is None:
            axes = ['ontology', 'parsing', 'vectors', 'graphs']
        
        results = []
        
        with get_db_session() as session:
            # Search ontology items
            if 'ontology' in axes:
                ontology_results = await self._search_ontology(session, query, top_k)
                results.extend(ontology_results)
            
            # Search parsing items
            if 'parsing' in axes:
                parsing_results = await self._search_parsing(session, query, top_k)
                results.extend(parsing_results)
            
            # Search vector chunks
            if 'vectors' in axes:
                vector_results = await self._search_vectors(session, query, top_k)
                results.extend(vector_results)
            
            # Search graph edges
            if 'graphs' in axes:
                graph_results = await self._search_graphs(session, query, top_k)
                results.extend(graph_results)
        
        # Sort by score and limit results
        results.sort(key=lambda x: x.get('score', 0), reverse=True)
        return results[:top_k]
    
    async def _search_ontology(self, session, query: str, top_k: int) -> List[Dict[str, Any]]:
        """Search ontology items using lexical matching."""
        # Simple lexical search in title and body
        statement = select(OntologyItem).where(
            (OntologyItem.title.contains(query)) |
            (OntologyItem.body.contains(query))
        ).limit(top_k)
        
        items = session.exec(statement).all()
        
        results = []
        for item in items:
            # Simple scoring based on query term frequency
            title_matches = item.title.lower().count(query.lower())
            body_matches = item.body.lower().count(query.lower())
            score = title_matches * 2 + body_matches  # Weight title matches higher
            
            results.append({
                'type': 'ontology',
                'id': item.id,
                'key': item.key,
                'title': item.title,
                'body': item.body[:200] + '...' if len(item.body) > 200 else item.body,
                'score': score,
                'created_at': item.created_at.isoformat(),
                'tags': item.tags
            })
        
        return results
    
    async def _search_parsing(self, session, query: str, top_k: int) -> List[Dict[str, Any]]:
        """Search parsing items using lexical matching."""
        statement = select(ParsingItem).where(
            ParsingItem.content.contains(query)
        ).limit(top_k)
        
        items = session.exec(statement).all()
        
        results = []
        for item in items:
            # Simple scoring based on query term frequency
            content_matches = item.content.lower().count(query.lower())
            score = content_matches
            
            results.append({
                'type': 'parsing',
                'id': item.id,
                'source': item.source,
                'content': item.content[:200] + '...' if len(item.content) > 200 else item.content,
                'score': score,
                'created_at': item.created_at.isoformat()
            })
        
        return results
    
    async def _search_vectors(self, session, query: str, top_k: int) -> List[Dict[str, Any]]:
        """Search vector chunks using naive vector similarity or lexical fallback."""
        try:
            # Try vector search if embeddings are available
            return await self._vector_similarity_search(session, query, top_k)
        except Exception as e:
            logger.warning(f"Vector search failed, falling back to lexical: {e}")
            return await self._vector_lexical_fallback(session, query, top_k)
    
    async def _vector_similarity_search(self, session, query: str, top_k: int) -> List[Dict[str, Any]]:
        """Perform vector similarity search."""
        # Generate query embedding
        embedding_provider = embedding_registry.get(self.embedding_provider)
        query_embedding = await embedding_provider.embed_text(query)
        
        # Get all vector chunks with embeddings
        statement = select(VectorChunk).where(VectorChunk.embedding.is_not(None))
        chunks = session.exec(statement).all()
        
        if not chunks:
            return []
        
        results = []
        for chunk in chunks:
            chunk_embedding = chunk.get_embedding()
            if chunk_embedding and len(chunk_embedding) == len(query_embedding):
                # Calculate cosine similarity
                similarity = self._cosine_similarity(query_embedding, chunk_embedding)
                
                results.append({
                    'type': 'vector',
                    'id': chunk.id,
                    'source': chunk.source,
                    'content': chunk.content[:200] + '...' if len(chunk.content) > 200 else chunk.content,
                    'score': similarity,
                    'created_at': chunk.created_at.isoformat(),
                    'embedding_dim': chunk.dim
                })
        
        # Sort by similarity and return top results
        results.sort(key=lambda x: x['score'], reverse=True)
        return results[:top_k]
    
    async def _vector_lexical_fallback(self, session, query: str, top_k: int) -> List[Dict[str, Any]]:
        """Lexical search fallback for vector chunks."""
        statement = select(VectorChunk).where(
            VectorChunk.content.contains(query)
        ).limit(top_k)
        
        chunks = session.exec(statement).all()
        
        results = []
        for chunk in chunks:
            content_matches = chunk.content.lower().count(query.lower())
            score = content_matches
            
            results.append({
                'type': 'vector',
                'id': chunk.id,
                'source': chunk.source,
                'content': chunk.content[:200] + '...' if len(chunk.content) > 200 else chunk.content,
                'score': score,
                'created_at': chunk.created_at.isoformat(),
                'search_method': 'lexical_fallback'
            })
        
        return results
    
    async def _search_graphs(self, session, query: str, top_k: int) -> List[Dict[str, Any]]:
        """Search graph edges using lexical matching."""
        statement = select(GraphEdge).where(
            (GraphEdge.src_id.contains(query)) |
            (GraphEdge.dst_id.contains(query)) |
            (GraphEdge.relation.contains(query))
        ).limit(top_k)
        
        edges = session.exec(statement).all()
        
        results = []
        for edge in edges:
            # Simple scoring based on query term frequency
            src_matches = edge.src_id.lower().count(query.lower())
            dst_matches = edge.dst_id.lower().count(query.lower())
            rel_matches = edge.relation.lower().count(query.lower())
            score = src_matches + dst_matches + rel_matches * 2  # Weight relation matches higher
            
            results.append({
                'type': 'graph',
                'id': edge.id,
                'src_id': edge.src_id,
                'dst_id': edge.dst_id,
                'relation': edge.relation,
                'score': score,
                'created_at': edge.created_at.isoformat()
            })
        
        return results
    
    def _cosine_similarity(self, a: List[float], b: List[float]) -> float:
        """Calculate cosine similarity between two vectors."""
        a_np = np.array(a)
        b_np = np.array(b)
        
        dot_product = np.dot(a_np, b_np)
        norm_a = np.linalg.norm(a_np)
        norm_b = np.linalg.norm(b_np)
        
        if norm_a == 0 or norm_b == 0:
            return 0.0
        
        return float(dot_product / (norm_a * norm_b))


# Create global retriever instance
memory_retriever = MemoryRetriever()