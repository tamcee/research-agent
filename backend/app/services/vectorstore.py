"""Chroma vector store: persistent, embedded, cosine space.

Serves two jobs from one collection:
  * dedup near-identical claims from the *same* source
  * find corroboration: semantically-similar claims from *other* domains

Everything is scoped by run_id so a persistent on-disk DB (which survives restarts
in deployment) never leaks claims across unrelated runs.
"""
from __future__ import annotations

from app.config import settings
from app.schemas import Claim


class VectorStore:
    def __init__(self) -> None:
        import os
        import chromadb

        from app.services.embeddings import get_embedding_function

        os.makedirs(settings.chroma_dir, exist_ok=True)
        self._client = chromadb.PersistentClient(path=settings.chroma_dir)
        self._col = self._client.get_or_create_collection(
            name="claims",
            embedding_function=get_embedding_function(),
            metadata={"hnsw:space": "cosine"},
        )

    def _n(self, k: int) -> int:
        try:
            return max(1, min(k, self._col.count()))
        except Exception:
            return k

    def add_claim(self, run_id: str, claim: Claim) -> bool:
        """Add a claim unless a near-identical one from the same source exists."""
        try:
            res = self._col.query(
                query_texts=[claim.text],
                n_results=self._n(1),
                where={
                    "$and": [
                        {"run_id": run_id},
                        {"sub_question_id": claim.sub_question_id},
                        {"domain": claim.source_domain},
                    ]
                },
            )
            dists = (res.get("distances") or [[]])[0]
            if dists and (1 - dists[0]) >= settings.dedup_similarity:
                return False
        except Exception:
            pass

        self._col.upsert(
            ids=[claim.id],
            documents=[claim.text],
            metadatas=[
                {
                    "run_id": run_id,
                    "sub_question_id": claim.sub_question_id,
                    "domain": claim.source_domain,
                    "url": claim.source_url,
                }
            ],
        )
        return True

    def find_corroboration(self, run_id: str, claim: Claim, k: int = 5) -> list[tuple[str, str, float]]:
        """Return [(text, domain, similarity)] for similar claims from OTHER domains."""
        try:
            res = self._col.query(
                query_texts=[claim.text],
                n_results=self._n(k),
                where={
                    "$and": [
                        {"run_id": run_id},
                        {"sub_question_id": claim.sub_question_id},
                        {"domain": {"$ne": claim.source_domain}},
                    ]
                },
            )
        except Exception:
            return []

        docs = (res.get("documents") or [[]])[0]
        metas = (res.get("metadatas") or [[]])[0]
        dists = (res.get("distances") or [[]])[0]
        out: list[tuple[str, str, float]] = []
        for doc, meta, dist in zip(docs, metas, dists):
            sim = 1.0 - float(dist)
            if sim >= settings.corroboration_similarity:
                out.append((doc, str(meta.get("domain", "")), sim))
        return out

    def delete_subq(self, run_id: str, sub_question_id: str) -> None:
        """Drop a sub-question's claims (used before a stricter re-search)."""
        try:
            self._col.delete(
                where={"$and": [{"run_id": run_id}, {"sub_question_id": sub_question_id}]}
            )
        except Exception:
            pass
