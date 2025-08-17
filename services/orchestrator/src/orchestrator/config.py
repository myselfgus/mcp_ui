from __future__ import annotations
from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List

class Settings(BaseSettings):
    openai_api_key: str | None = Field(default=None, alias="OPENAI_API_KEY")
    default_model: str = Field(default="gpt-4o-mini", alias="DEFAULT_MODEL")
    allow_fs_base: str = Field(default="/workspaces", alias="ALLOW_FS_BASE")
    enable_terminal: bool = Field(default=True, alias="ENABLE_TERMINAL")
    enable_git: bool = Field(default=True, alias="ENABLE_GIT")
    allowed_tools: List[str] = Field(default_factory=lambda: ["fs.read", "fs.write", "git.status", "terminal.exec"], alias="ALLOWED_TOOLS")

    class Config:
        case_sensitive = False
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()  # singleton pattern for now
