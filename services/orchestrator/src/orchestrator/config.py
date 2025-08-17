from __future__ import annotations
from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List

class Settings(BaseSettings):
    # LLM Provider settings
    openai_api_key: str | None = Field(default=None, alias="OPENAI_API_KEY")
    default_model: str = Field(default="gpt-4o-mini", alias="DEFAULT_MODEL")
    
    # File system settings
    allow_fs_base: str = Field(default="/workspaces", alias="ALLOW_FS_BASE")
    
    # Tool settings
    enable_terminal: bool = Field(default=True, alias="ENABLE_TERMINAL")
    enable_git: bool = Field(default=True, alias="ENABLE_GIT")
    enable_speech: bool = Field(default=True, alias="ENABLE_SPEECH")
    allowed_tools: List[str] = Field(
        default_factory=lambda: ["fs.read", "fs.write", "git.status", "terminal.exec", "speech.transcribe", "speech.synthesize"], 
        alias="ALLOWED_TOOLS"
    )
    
    # Speech settings
    default_speech_provider: str = Field(default="openai", alias="DEFAULT_SPEECH_PROVIDER")
    default_tts_voice: str = Field(default="alloy", alias="DEFAULT_TTS_VOICE")
    default_tts_model: str = Field(default="tts-1", alias="DEFAULT_TTS_MODEL")
    default_stt_model: str = Field(default="whisper-1", alias="DEFAULT_STT_MODEL")
    
    # Database settings
    database_url: str = Field(default="orchestrator.db", alias="DATABASE_URL")
    enable_persistence: bool = Field(default=True, alias="ENABLE_PERSISTENCE")

    class Config:
        case_sensitive = False
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()  # singleton pattern for now
