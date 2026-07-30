from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user
from embeddings import embed_text
import vectorstore
from firebase_init import db
from providers import generate
from schemas import ChatRequest
from logger import get_logger

log = get_logger("routes.search")
router = APIRouter(tags=["search"])


def _hydrate(item_id: str) -> dict | None:
    doc = db.collection("items").document(item_id).get()
    if not doc.exists:
        return None
    data = doc.to_dict()
    return {
        "id": item_id,
        "title": data.get("title"),
        "category": data.get("category"),
        "description": data.get("description"),
        "organization": data.get("organization"),
        "date": data.get("date"),
        "skills": data.get("skills", []),
    }


@router.get("/search")
async def search(q: str, top_k: int = 10, user: dict = Depends(get_current_user)):
    """Module 5 — natural-language semantic search, e.g. 'show my AI projects'.
    Backed by ChromaDB; original files stay reachable via each item's file_url.
    """
    if not q.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    try:
        query_vec = await embed_text(q, is_query=True)
        hits = vectorstore.query(query_vec, uid=user["uid"], top_k=top_k)
    except Exception as e:
        log.error("Semantic search failed for %r: %s", q, e)
        raise HTTPException(
            status_code=503,
            detail="Search is temporarily unavailable — try again in a moment.",
        )

    results = []
    for hit in hits:
        item = _hydrate(hit["id"])
        if item:
            item["relevance"] = round(max(0.0, 1 - hit["distance"]), 4)
            results.append(item)
    return results


@router.post("/chat")
async def chat_with_documents(payload: ChatRequest, user: dict = Depends(get_current_user)):
    """Chat with Documents (RAG) / AI Memory Search — retrieves the most
    relevant items via Chroma, grounds the answer in them, and reports which
    documents were used so the answer is checkable.
    """
    if not payload.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    try:
        query_vec = await embed_text(payload.question, is_query=True)
        hits = vectorstore.query(query_vec, uid=user["uid"], top_k=6)
    except Exception as e:
        log.error("Chat retrieval failed for %r: %s", payload.question, e)
        raise HTTPException(
            status_code=503,
            detail="Document search is temporarily unavailable — try again in a moment.",
        )
    context_items = [item for item in (_hydrate(h["id"]) for h in hits) if item]

    if not context_items:
        return {
            "answer": "I don't have any uploaded documents to answer that from yet — "
            "upload some certificates, projects, or resume sections first.",
            "sources": [],
        }

    context_text = "\n\n".join(
        f"[{i + 1}] {c['title']} ({c['category']}, {c.get('date') or 'no date'}): {c['description']}"
        for i, c in enumerate(context_items)
    )
    history_text = "\n".join(f"{m.role}: {m.content}" for m in payload.history[-6:])

    prompt = (
        "You are a helpful assistant answering questions about ONE student's uploaded "
        "documents (certificates, projects, resume, internships). Use only the numbered "
        "context items below — if the answer isn't in them, say so honestly instead of "
        "guessing. Reference item numbers like [1] when you use them.\n\n"
        f"Context:\n{context_text}\n\n"
        + (f"Conversation so far:\n{history_text}\n\n" if history_text else "")
    )

    try:
        answer = await generate(prompt, text=payload.question)
    except Exception as e:
        log.error("Chat generation failed on every provider: %s", e)
        raise HTTPException(status_code=503, detail="AI providers are unavailable right now — try again shortly")

    return {
        "answer": answer,
        "sources": [{"id": c["id"], "title": c["title"], "category": c["category"]} for c in context_items],
    }
