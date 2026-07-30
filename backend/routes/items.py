import asyncio
import os
from datetime import datetime, timezone

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.concurrency import run_in_threadpool

from auth import get_current_user
from config import CATEGORIES
from extraction import extract_document
from embeddings import embed_text
import vectorstore
import storage_utils
from firebase_init import db
from logger import get_logger

log = get_logger("routes.items")
router = APIRouter(prefix="/items", tags=["items"])

MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "image/jpeg",
    "image/png",
    "image/webp",
}

# Browsers and OSes lie about MIME types. Windows without Office installed sends
# .docx as "application/octet-stream"; some Android pickers send "*/*". Rejecting
# on content_type alone would bounce perfectly valid resumes, so when the browser
# gives us a useless type we fall back to the filename extension.
EXTENSION_MIME_MAP = {
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".txt": "text/plain",
    ".md": "text/plain",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
}

# Types a browser sends when it genuinely does not know what the file is.
_UNRELIABLE_MIME_TYPES = {"application/octet-stream", "*/*", "", "binary/octet-stream"}


def _resolve_mime_type(content_type: str | None, filename: str | None) -> str:
    """Pick the most trustworthy MIME type available for an upload.

    Trust the browser when it sends something we recognise; otherwise derive the
    type from the file extension. Keeps the same 415 behaviour for genuinely
    unsupported files (e.g. .exe, .zip) while letting real documents through.
    """
    declared = (content_type or "").split(";")[0].strip().lower()
    if declared in ALLOWED_MIME_TYPES:
        return declared

    ext = os.path.splitext(filename or "")[1].lower()
    mapped = EXTENSION_MIME_MAP.get(ext)
    if mapped:
        if declared and declared not in _UNRELIABLE_MIME_TYPES:
            log.info("Browser sent %s for %s; using %s from extension", declared, filename, mapped)
        return mapped

    return declared or "application/octet-stream"


def _doc_to_out(doc_id: str, data: dict) -> dict:
    # Cloudinary delivery URLs are permanent, so the URL saved at upload time
    # is served as-is — no per-read signing step like Firebase Storage needed.
    file_url = data.get("file_url")

    created_at = data.get("created_at")
    return {
        "id": doc_id,
        "original_filename": data.get("original_filename"),
        "original_mime_type": data.get("original_mime_type"),
        "category": data.get("category"),
        "title": data.get("title"),
        "organization": data.get("organization"),
        "date": data.get("date"),
        "description": data.get("description"),
        "skills": data.get("skills", []),
        "tags": data.get("tags", []),
        "entities": data.get("entities", []),
        "file_url": file_url,
        "created_at": created_at.isoformat() if hasattr(created_at, "isoformat") else created_at,
    }


# NOTE: order matters below — "/categories" and "/timeline" must be declared
# before "/{item_id}" or FastAPI will treat "categories"/"timeline" as an id.

@router.get("/categories")
async def get_categories():
    return CATEGORIES


@router.post("/upload")
async def upload_document(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    """Module 1 (Ingestion) + Module 2 (Categorization)."""
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail=f"File too large — max {MAX_FILE_SIZE // (1024 * 1024)}MB")

    mime_type = _resolve_mime_type(file.content_type, file.filename)
    if mime_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {mime_type}. Allowed: PDF, DOCX, TXT, JPG, PNG, WEBP",
        )

    # Create the Firestore doc first so we have an id to key Cloudinary + Chroma with.
    doc_ref = db.collection("items").document()
    item_id = doc_ref.id

    # AI extraction (Gemini/Groq) and the Cloudinary upload are independent — both
    # only need the raw bytes — so run them concurrently instead of one after the
    # other. This roughly halves the perceived upload time for a document.
    extract_task = asyncio.ensure_future(extract_document(file_bytes, mime_type))
    upload_task = asyncio.ensure_future(
        run_in_threadpool(
            storage_utils.upload_file,
            user["uid"], item_id, file.filename or "upload", file_bytes, mime_type,
        )
    )

    results = await asyncio.gather(extract_task, upload_task, return_exceptions=True)
    extracted, uploaded = results

    # A failed Cloudinary upload is fatal (no file to show), so surface it as a 502.
    # A failed extraction is not — fall back to a safe default so the file still saves.
    if isinstance(uploaded, Exception):
        log.error("Cloudinary upload failed for %s: %s", item_id, uploaded)
        raise HTTPException(status_code=502, detail="Could not upload file to storage")
    if isinstance(extracted, Exception):
        log.error("Extraction failed for %s: %s", item_id, extracted)
        from extraction import FALLBACK_RESULT

        extracted = dict(FALLBACK_RESULT)

    embedding_text = f"{extracted['title']} {extracted['description']} {' '.join(extracted.get('skills', []))}"
    try:
        embedding = await embed_text(embedding_text)
    except Exception as e:
        log.error("Embedding failed for %s: %s", item_id, e)
        embedding = None  # item still gets saved, just won't show up in semantic search

    created_at = datetime.now(timezone.utc)
    data = {
        "uid": user["uid"],
        "original_filename": file.filename,
        "original_mime_type": mime_type,
        "cloudinary_public_id": uploaded["public_id"],
        "cloudinary_resource_type": uploaded["resource_type"],
        "file_url": uploaded["url"],
        "category": extracted["category"],
        "title": extracted["title"],
        "organization": extracted.get("organization"),
        "date": extracted.get("date"),
        "description": extracted["description"],
        "skills": extracted.get("skills", []),
        "tags": extracted.get("tags", []),
        "entities": extracted.get("entities", []),
        "created_at": created_at,
    }
    doc_ref.set(data)

    # Indexing is a search optimisation, not part of the document itself. The
    # file is already in Cloudinary and the item in Firestore by this point, so
    # a Chroma failure must not turn a successful upload into a 500 and leave
    # the user staring at an error next to a document that actually saved.
    if embedding:
        try:
            vectorstore.add_item(
                item_id=item_id,
                embedding=embedding,
                document_text=embedding_text,
                metadata={"uid": user["uid"], "category": data["category"], "title": data["title"]},
            )
        except Exception as e:
            log.error("Vector indexing failed for %s (item still saved): %s", item_id, e)

    log.info("Uploaded item %s uid=%s category=%s", item_id, user["uid"], data["category"])
    return _doc_to_out(item_id, data)


@router.get("")
async def list_items(category: str | None = None, user: dict = Depends(get_current_user)):
    """Category views for the frontend (Projects / Skills / Certifications / ...)."""
    query = db.collection("items").where("uid", "==", user["uid"])
    if category:
        query = query.where("category", "==", category)
    docs = query.stream()
    return [_doc_to_out(d.id, d.to_dict()) for d in docs]


@router.get("/timeline")
async def get_timeline(user: dict = Depends(get_current_user)):
    """Module 4 ��� year-wise growth view."""
    docs = db.collection("items").where("uid", "==", user["uid"]).stream()
    items = [_doc_to_out(d.id, d.to_dict()) for d in docs]
    items.sort(key=lambda i: i.get("date") or "9999")
    return items


@router.get("/{item_id}")
async def get_item(item_id: str, user: dict = Depends(get_current_user)):
    doc = db.collection("items").document(item_id).get()
    if not doc.exists or doc.to_dict().get("uid") != user["uid"]:
        raise HTTPException(status_code=404, detail="Item not found")
    return _doc_to_out(doc.id, doc.to_dict())


@router.delete("/{item_id}")
async def delete_item(item_id: str, user: dict = Depends(get_current_user)):
    doc_ref = db.collection("items").document(item_id)
    doc = doc_ref.get()
    if not doc.exists or doc.to_dict().get("uid") != user["uid"]:
        raise HTTPException(status_code=404, detail="Item not found")

    data = doc.to_dict()
    if data.get("cloudinary_public_id"):
        try:
            await run_in_threadpool(
                storage_utils.delete_file,
                data["cloudinary_public_id"],
                data.get("cloudinary_resource_type", "raw"),
            )
        except Exception as e:
            log.warning("Could not delete Cloudinary file for %s: %s", item_id, e)

    try:
        vectorstore.delete_item(item_id)
    except Exception as e:
        log.warning("Could not delete vector for %s: %s", item_id, e)

    doc_ref.delete()
    return {"deleted": item_id}


@router.get("/{item_id}/relationships")
async def get_relationships(item_id: str, user: dict = Depends(get_current_user)):
    """Module 3 — Relationship engine (MVP): two items are related if they
    share at least one extracted skill (Certification -> Skill -> Project ->
    Internship -> Career, per the brief).
    """
    doc = db.collection("items").document(item_id).get()
    if not doc.exists or doc.to_dict().get("uid") != user["uid"]:
        raise HTTPException(status_code=404, detail="Item not found")

    target_skills = set(doc.to_dict().get("skills", []))
    if not target_skills:
        return []

    docs = db.collection("items").where("uid", "==", user["uid"]).stream()
    related = []
    for d in docs:
        if d.id == item_id:
            continue
        d_data = d.to_dict()
        shared = target_skills & set(d_data.get("skills", []))
        if shared:
            out = _doc_to_out(d.id, d_data)
            out["shared_skills"] = sorted(shared)
            related.append(out)
    return related
