from __future__ import annotations
from abc import ABC, abstractmethod
from typing import List, Dict, Any
import os
import httpx
from ..config import settings
import logging

logger = logging.getLogger("orchestrator.memory.embeddings")


class EmbeddingProvider(ABC):
    """Abstract base class for embedding providers."""
    name: str

    @abstractmethod
    async def embed_text(self, text: str, model: str | None = None) -> List[float]:
        """
        Generate embedding for text.
        
        Args:
            text: Text to embed
            model: Optional model identifier
            
        Returns:
            Embedding vector as list of floats
        """
        ...

    @abstractmethod
    async def embed_batch(self, texts: List[str], model: str | None = None) -> List[List[float]]:
        """
        Generate embeddings for multiple texts.
        
        Args:
            texts: List of texts to embed
            model: Optional model identifier
            
        Returns:
            List of embedding vectors
        """
        ...


class OpenAIEmbeddingProvider(EmbeddingProvider):
    """OpenAI embedding provider using text-embedding models."""
    name = "openai"

    async def embed_text(self, text: str, model: str | None = None) -> List[float]:
        """Generate embedding using OpenAI API."""
        embeddings = await self.embed_batch([text], model)
        return embeddings[0]

    async def embed_batch(self, texts: List[str], model: str | None = None) -> List[List[float]]:
        """Generate embeddings for multiple texts using OpenAI API."""
        api_key = settings.openai_api_key or os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("Missing OPENAI_API_KEY")

        model_name = model or settings.embedding_model
        
        payload = {
            "model": model_name,
            "input": texts,
            "encoding_format": "float"
        }
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        api_base = os.environ.get("OPENAI_API_BASE", "https://api.openai.com/v1")
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{api_base}/embeddings",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            result = response.json()
            
            embeddings = [item["embedding"] for item in result["data"]]
            
            logger.info("openai_embeddings_generated", extra={
                "model": model_name,
                "num_texts": len(texts),
                "embedding_dim": len(embeddings[0]) if embeddings else 0
            })
            
            return embeddings


class GoogleEmbeddingProvider(EmbeddingProvider):
    """Google embedding provider stub - placeholder implementation."""
    name = "google"

    async def embed_text(self, text: str, model: str | None = None) -> List[float]:
        """Placeholder embedding using Google/Gemini."""
        logger.warning("Google embedding provider not implemented, returning placeholder")
        # Return a placeholder embedding vector (384 dimensions)
        return [0.0] * 384

    async def embed_batch(self, texts: List[str], model: str | None = None) -> List[List[float]]:
        """Placeholder batch embedding using Google/Gemini."""
        logger.warning("Google embedding provider not implemented, returning placeholder")
        # Return placeholder embedding vectors
        return [[0.0] * 384 for _ in texts]


class EmbeddingRegistry:
    def __init__(self):
        self._providers: Dict[str, EmbeddingProvider] = {}

    def register(self, provider: EmbeddingProvider):
        self._providers[provider.name] = provider

    def get(self, name: str) -> EmbeddingProvider:
        if name not in self._providers:
            raise KeyError(f"Embedding provider '{name}' not registered")
        return self._providers[name]

    def list(self) -> List[str]:
        return list(self._providers.keys())


# Global registry
embedding_registry = EmbeddingRegistry()

# Register providers
embedding_registry.register(OpenAIEmbeddingProvider())
embedding_registry.register(GoogleEmbeddingProvider())