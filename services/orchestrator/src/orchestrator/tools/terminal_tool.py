from __future__ import annotations
import asyncio
import shlex
from .base import Tool, tool_registry
from ..config import settings

SAFE_PREFIXES = ["echo", "ls", "pwd", "cat", "grep", "head", "tail"]

class TerminalExecTool(Tool):
    name = "terminal.exec"
    description = "Execute a safe shell command (restricted)"

    async def run(self, command: str):  # type: ignore[override]
        if not settings.enable_terminal:
            raise PermissionError("Terminal tool disabled")
        first = shlex.split(command)[0]
        if first not in SAFE_PREFIXES:
            raise PermissionError("Command not allowed")
        proc = await asyncio.create_subprocess_shell(
            command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await proc.communicate()
        return {
            "command": command,
            "code": proc.returncode,
            "stdout": stdout.decode(),
            "stderr": stderr.decode(),
        }

tool_registry.register(TerminalExecTool())
