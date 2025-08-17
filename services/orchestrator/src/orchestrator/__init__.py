# Orchestrator service package

# Import speech providers and tools to register them
from .speech import openai_provider, google_stub, tools as speech_tools

# Import memory components to initialize them
from .memory import database, embeddings, tools as memory_tools

# Import existing tool modules to register them
from .tools import fs_tools, git_tools, terminal_tool
