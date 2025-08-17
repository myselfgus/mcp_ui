from __future__ import annotations
from .base import Tool, tool_registry
from ..memory.store import simple_lexical_search


class MemorySearchTool(Tool):
    name = "memory.search"
    description = "Search memory (ontology/parsing/vector fallback) for a query string"

    async def run(self, query: str, limit: int = 5):  # type: ignore[override]
        results = simple_lexical_search(query, limit=limit)
        return {"query": query, "results": results}


tool_registry.register(MemorySearchTool())
