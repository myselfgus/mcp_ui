from __future__ import annotations
import os
import git
from .base import Tool, tool_registry
from ..config import settings

class GitStatusTool(Tool):
    name = "git.status"
    description = "Get git status for repository containing path"

    async def run(self, repo_path: str):  # type: ignore[override]
        full = os.path.abspath(repo_path)
        if not full.startswith(settings.allow_fs_base):
            raise PermissionError("Path outside allowlist")
        repo = git.Repo(full, search_parent_directories=True)
        return {
            "active_branch": repo.active_branch.name if not repo.head.is_detached else None,
            "is_dirty": repo.is_dirty(),
            "untracked": repo.untracked_files,
            "diff": [str(d) for d in repo.index.diff(None)],
        }

tool_registry.register(GitStatusTool())
