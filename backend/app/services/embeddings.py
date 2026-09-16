"""Local sentence-transformers embedding function for Chroma (free, no account)."""
from __future__ import annotations

from app.config import settings

_ef = None


def get_embedding_function():
    """Cached Chroma-compatible embedding function. First call downloads the model."""
    global _ef
    if _ef is None:
        from chromadb.utils import embedding_functions

        _ef = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name=settings.embedding_model
        )
    return _ef
