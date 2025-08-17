from __future__ import annotations
import os
import aiofiles
from .base import Tool, tool_registry
from ..config import settings
import difflib
from typing import List

class FSReadTool(Tool):
    name = "fs.read"
    description = "Read a text file from allowed base path"

    async def run(self, path: str):  # type: ignore[override]
        full_path = os.path.abspath(path)
        if not full_path.startswith(settings.allow_fs_base):
            raise PermissionError("Path outside allowlist")
        async with aiofiles.open(full_path, "r") as f:
            return {"path": path, "content": await f.read()}

class FSWriteTool(Tool):
    name = "fs.write"
    description = "Write text content to file inside allowed base path"

    async def run(self, path: str, content: str):  # type: ignore[override]
        full_path = os.path.abspath(path)
        if not full_path.startswith(settings.allow_fs_base):
            raise PermissionError("Path outside allowlist")
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        async with aiofiles.open(full_path, "w") as f:
            await f.write(content)
        return {"path": path, "bytes": len(content)}

tool_registry.register(FSReadTool())
tool_registry.register(FSWriteTool())

class FSApplyPatchTool(Tool):
    name = "fs.apply_patch"
    description = "Apply a unified diff patch to a file (text)."

    async def run(self, path: str, patch: str):  # type: ignore[override]
        full_path = os.path.abspath(path)
        if not full_path.startswith(settings.allow_fs_base):
            raise PermissionError("Path outside allowlist")
        # Read original
        async with aiofiles.open(full_path, "r") as f:
            original_lines = await f.readlines()
        # Parse unified diff
        patched = self._apply_unified_diff(original_lines, patch)
        async with aiofiles.open(full_path, "w") as f:
            await f.writelines(patched)
        return {"path": path, "lines": len(patched)}

    def _apply_unified_diff(self, original: List[str], patch_text: str) -> List[str]:
        # Use difflib to apply; patch_text expected to contain unified diff with ---/+++ headers
        diff_lines = patch_text.splitlines(keepends=True)
        # difflib.restore requires a delta from ndiff; we have unified diff, so fallback manual patch
        # Simplistic approach: use patch-like rebuild via Differ is non-trivial; instead attempt to apply using patch API logic.
        # For robustness in MVP, if parsing fails, raise.
        try:
            # Reconstruct target using difflib.patch-like algorithm (not built-in). We'll manually apply hunks.
            return self._apply_manual_unified(original, diff_lines)
        except Exception as e:  # noqa: BLE001
            raise ValueError(f"Failed to apply patch: {e}")

    def _apply_manual_unified(self, original: List[str], diff_lines: List[str]) -> List[str]:
        out = original[:]
        i = 0
        # Very minimal parser: supports single-file patch with @@ -a,b +c,d @@ hunks
        for idx, line in enumerate(diff_lines):
            if line.startswith('@@'):
                # Extract line numbers
                # Format: @@ -l,s +l2,s2 @@
                header = line.split('@@')[1].strip()
                parts = header.split(' ')
                old_part = parts[0]  # like -12,5
                new_part = parts[1]  # like +12,6
                old_start = int(old_part.split(',')[0][1:])
                # Build hunk content until next @@ or end
                hunk: List[str] = []
                for h in diff_lines[idx+1:]:
                    if h.startswith('@@'):
                        break
                    if h.startswith('---') or h.startswith('+++'):
                        continue
                    hunk.append(h)
                # Apply hunk: rebuild section
                o_index = old_start - 1
                # Collect new lines
                new_lines: List[str] = []
                remove_count = 0
                for hline in hunk:
                    if hline.startswith('+'):
                        new_lines.append(hline[1:])
                    elif hline.startswith('-'):
                        remove_count += 1
                    elif hline.startswith(' '):
                        new_lines.append(hline[1:])
                # Replace slice
                out[o_index:o_index+remove_count] = new_lines
        return out

tool_registry.register(FSApplyPatchTool())
