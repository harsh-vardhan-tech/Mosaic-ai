"""
ChromaDB as a pure vector index: we compute embeddings ourselves (Gemini, see
embeddings.py) and just ask Chroma to store + search them. This keeps the
embedding model swappable without touching the store, and keeps every user's
vectors filterable by uid via metadata.

Runs embedded/local (PersistentClient) — no separate Chroma server needed.
NOTE: on Render's free tier the filesystem can be wiped on redeploy/restart.
For a demo this is fine; for real persistence, mount a Render disk at
CHROMA_PERSIST_DIR or move to a hosted Chroma instance later.
"""
import chromadb

from config import CHROMA_PERSIST_DIR, CHROMA_COLLECTION_NAME, EMBEDDING_DIM
from logger import get_logger

log = get_logger("vectorstore")

_client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)


def _open_collection():
    """A Chroma collection is permanently locked to the vector width of the
    first embedding written into it. If EMBEDDING_DIM changed (or an old
    collection was created by a different model), every upsert and query would
    fail with "Collection expecting embedding with dimension of N". Detect that
    at startup and rebuild the collection instead, recording the dimension in
    metadata so the check works even while the collection is still empty.
    """
    collection = _client.get_or_create_collection(
        name=CHROMA_COLLECTION_NAME,
        metadata={"embedding_dim": EMBEDDING_DIM},
    )
    existing_dim = (collection.metadata or {}).get("embedding_dim")

    if existing_dim is None and collection.count() > 0:
        # Pre-existing collection from before this check — infer its width from
        # a stored vector.
        peeked = collection.peek(limit=1).get("embeddings")
        if peeked is not None and len(peeked) > 0:
            existing_dim = len(peeked[0])

    if existing_dim is not None and int(existing_dim) != EMBEDDING_DIM:
        log.warning(
            "Chroma collection '%s' holds %s-dim vectors but EMBEDDING_DIM is %d — "
            "rebuilding it. Re-upload documents to re-index them for search.",
            CHROMA_COLLECTION_NAME,
            existing_dim,
            EMBEDDING_DIM,
        )
        _client.delete_collection(name=CHROMA_COLLECTION_NAME)
        collection = _client.get_or_create_collection(
            name=CHROMA_COLLECTION_NAME,
            metadata={"embedding_dim": EMBEDDING_DIM},
        )

    return collection


_collection = _open_collection()


def add_item(item_id: str, embedding: list[float], document_text: str, metadata: dict) -> None:
    """metadata should include at least {"uid": ...} so search can be scoped
    per user. Chroma metadata values must be str/int/float/bool (no lists) —
    join list fields like skills/tags into a single string before passing them.
    """
    _collection.upsert(
        ids=[item_id],
        embeddings=[embedding],
        documents=[document_text],
        metadatas=[metadata],
    )


def delete_item(item_id: str) -> None:
    _collection.delete(ids=[item_id])


def query(embedding: list[float], uid: str, top_k: int = 10) -> list[dict]:
    """Returns [{id, distance, document, metadata}, ...] scoped to one user,
    best matches first.
    """
    result = _collection.query(
        query_embeddings=[embedding],
        n_results=top_k,
        where={"uid": uid},
    )
    if not result["ids"] or not result["ids"][0]:
        return []

    out = []
    for i, item_id in enumerate(result["ids"][0]):
        out.append(
            {
                "id": item_id,
                "distance": result["distances"][0][i],
                "document": result["documents"][0][i],
                "metadata": result["metadatas"][0][i],
            }
        )
    return out
