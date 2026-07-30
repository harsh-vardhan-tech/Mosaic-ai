"""
Embeddings for semantic search. Gemini-only — Groq isn't used as an
embeddings provider — so the fallback here is just primary key -> backup key.
ChromaDB (see vectorstore.py) is the vector *store*; this module only turns
text into vectors.
"""
import math

from google import genai
from google.genai import types

from config import (
    EMBEDDING_DIM,
    GEMINI_API_KEY,
    GEMINI_API_KEY_BACKUP,
    GEMINI_EMBEDDING_MODEL,
)
from logger import get_logger

log = get_logger("embeddings")

_clients = [genai.Client(api_key=GEMINI_API_KEY)]
if GEMINI_API_KEY_BACKUP:
    _clients.append(genai.Client(api_key=GEMINI_API_KEY_BACKUP))


def _normalize(vector: list[float]) -> list[float]:
    """Only the full-size 3072-dim output comes back pre-normalized. Truncated
    outputs (1536/768) do not, and cosine/L2 similarity in Chroma assumes unit
    length — so we normalize here.
    """
    norm = math.sqrt(sum(v * v for v in vector))
    if norm == 0:
        return vector
    return [v / norm for v in vector]


async def embed_text(text: str, *, is_query: bool = False) -> list[float]:
    """Embed one piece of text into an EMBEDDING_DIM-length unit vector.

    Set is_query=True when embedding a user's search phrase; documents being
    indexed use the default. Gemini encodes queries and documents slightly
    differently, and matching the task type improves retrieval accuracy.
    """
    config = types.EmbedContentConfig(
        output_dimensionality=EMBEDDING_DIM,
        task_type="RETRIEVAL_QUERY" if is_query else "RETRIEVAL_DOCUMENT",
    )

    errors = []
    for i, client in enumerate(_clients):
        try:
            result = await client.aio.models.embed_content(
                model=GEMINI_EMBEDDING_MODEL,
                contents=text,
                config=config,
            )
            values = result.embeddings[0].values
            if len(values) != EMBEDDING_DIM:
                # Guard rather than silently writing a wrong-width vector into
                # Chroma, which would only blow up later at query time.
                raise RuntimeError(
                    f"expected {EMBEDDING_DIM} dims from {GEMINI_EMBEDDING_MODEL}, got {len(values)}"
                )
            return _normalize(values)
        except Exception as e:  # noqa: BLE001
            log.warning("Embedding via Gemini key #%d failed: %s", i, e)
            errors.append(str(e))
    raise RuntimeError("Embedding failed on all Gemini keys:\n" + "\n".join(errors))
