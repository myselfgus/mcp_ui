# Orchestrator service package

# Import providers to register them
try:
    from .providers import openai_provider, gemini_stub
except ImportError:
    pass  # Dependencies not installed

# Import speech providers and tools to register them
try:
    from . import speech
    if speech:  # Ensure speech module is loaded
        from .speech import openai_provider as speech_openai
        from .speech import tools as speech_tools
except ImportError:
    pass  # Speech dependencies not available

# Import tools to register them  
try:
    from .tools import fs_tools, git_tools, terminal_tool
except ImportError:
    pass  # Tool dependencies not available
