from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Any, Dict

class Tool(ABC):
    name: str
    description: str

    @abstractmethod
    async def run(self, **kwargs) -> Any:  # noqa: ANN401
        ...

class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, Tool] = {}

    def register(self, tool: Tool):
        self._tools[tool.name] = tool

    def get(self, name: str) -> Tool:
        return self._tools[name]

    def list(self):
        return list(self._tools.keys())

tool_registry = ToolRegistry()
