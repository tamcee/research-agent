"""Central configuration. All tunable knobs live here.

Reads from environment / backend/.env. The domain-tier trust list lives in
`app/services/source_scoring.py` (it is data, not a scalar setting).
"""
from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/  (this file is backend/app/config.py)
BASE_DIR = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    # --- Providers ---
    groq_api_key: str = ""
    groq_model: str = "qwen/qwen3.8-27b"
    tavily_api_key: str = ""

    # Stub Groq + Tavily (Chroma + embeddings still run for real).
    fake_mode: bool = False

    # --- Embeddings / vector store ---
    embedding_model: str = "all-MiniLM-L6-v2"
    chroma_dir: str = str(BASE_DIR / "data" / "chroma")

    # --- API ---
    allowed_origins: str = "http://localhost:5173"

    # --- Pipeline knobs ---
    min_sub_questions: int = 3
    max_sub_questions: int = 6
    candidates_per_subq: int = 8          # Tavily results requested per sub-question
    extract_top_k: int = 3                # full-text extraction, top N ranked citable sources
    max_research_rounds: int = 2          # initial pass + up to (n-1) stricter re-searches
    min_verified_claims_per_subq: int = 1 # below this -> trigger a stricter re-search
    max_claims_per_source: int = 8

    # Cosine-similarity thresholds (Chroma collection uses cosine space)
    corroboration_similarity: float = 0.80  # candidate "same claim" match across sources
    dedup_similarity: float = 0.94           # near-identical within a source -> drop

    request_timeout_s: float = 20.0
    llm_temperature: float = 0.2

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    def missing_keys(self) -> list[str]:
        """Which live-mode keys are absent (ignored in fake mode)."""
        if self.fake_mode:
            return []
        missing = []
        if not self.groq_api_key:
            missing.append("GROQ_API_KEY")
        if not self.tavily_api_key:
            missing.append("TAVILY_API_KEY")
        return missing


settings = Settings()
