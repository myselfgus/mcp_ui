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
    enable_memory: bool = Field(default=True, alias="ENABLE_MEMORY")
    enable_speech: bool = Field(default=True, alias="ENABLE_SPEECH")
    database_url: str | None = Field(default=None, alias="DATABASE_URL")
    speech_model: str = Field(default="whisper-1", alias="SPEECH_MODEL")
    tts_voice: str = Field(default="alloy", alias="TTS_VOICE")
    embedding_model: str = Field(default="text-embedding-3-small", alias="EMBEDDING_MODEL")
    allowed_tools: List[str] = Field(
        default_factory=lambda: [
            "fs.read",
            "fs.write",
            "fs.apply_patch",
            "git.status",
            "terminal.exec",
            "speech.transcribe",
            "speech.synthesize",
            "memory.search",
        ],
        alias="ALLOWED_TOOLS",
    )

    class Config:
        case_sensitive = False
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()  # singleton pattern for now
