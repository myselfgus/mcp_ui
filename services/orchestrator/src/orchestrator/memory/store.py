from __future__ import annotations
from sqlmodel import SQLModel, Session, create_engine, select
from ..config import settings
from . import models
import json, os
from typing import List, Dict

_engine = None


def get_engine():
    global _engine
    if _engine is None:
        url = settings.database_url or "sqlite:///./data/orchestrator.db"
        if url.startswith("sqlite"):
            os.makedirs("data", exist_ok=True)
        _engine = create_engine(url, echo=False)
        SQLModel.metadata.create_all(_engine)
    return _engine


def add_message(session_id: int, role: str, content: Dict):
    eng = get_engine()
    with Session(eng) as s:
        msg = models.Message(session_id=session_id, role=role, content_json=json.dumps(content))
        s.add(msg)
        s.commit()
        s.refresh(msg)
        return msg.id


def add_ontology_item(key: str, title: str, body: str, tags: List[str] | None = None):
    eng = get_engine()
    with Session(eng) as s:
        item = models.OntologyItem(key=key, title=title, body=body, tags=json.dumps(tags or []))
        s.add(item)
        s.commit()
        s.refresh(item)
        return item.id


def simple_lexical_search(query: str, limit: int = 5) -> List[Dict]:
    eng = get_engine()
    out: List[Dict] = []
    with Session(eng) as s:
        for model_cls in (models.OntologyItem, models.ParsingItem, models.VectorChunk):
            stmt = select(model_cls).limit(500)
            rows = s.exec(stmt).all()
            for r in rows:
                text = getattr(r, 'body', None) or getattr(r, 'content', '') or ''
                if query.lower() in text.lower() or query.lower() in (getattr(r, 'title', '') or '').lower():
                    out.append({
                        "axis": model_cls.__name__,
                        "id": r.id,
                        "snippet": text[:400],
                    })
                if len(out) >= limit:
                    return out
    return out
