FROM python:3.11-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends git curl && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml .
RUN pip install --no-cache-dir hatchling && pip install --no-cache-dir .[dev]

COPY src ./src

EXPOSE 8010
HEALTHCHECK --interval=30s --timeout=5s CMD python -c "import importlib; importlib.import_module('orchestrator')" || exit 1
CMD ["uvicorn", "orchestrator.api.main:app", "--host", "0.0.0.0", "--port", "8010"]
