import io
import json

from pypdf import PdfReader
from docx import Document as DocxDocument

from config import CATEGORIES
from providers import generate
from schemas import ExtractedData
from logger import get_logger

log = get_logger("extraction")

EXTRACTION_PROMPT = f"""You are an information-extraction engine for a student's Digital Identity System.

Read the document (certificate, resume, project report, internship letter, or
similar academic/professional document, given to you either as the raw file or
as its extracted text) and extract structured information about it.

Classify it into EXACTLY one of these categories: {", ".join(CATEGORIES)}.

Fill in every field as best you can:
- category: one of {CATEGORIES}
- title: short human-readable title (e.g. "AWS Cloud Practitioner Certificate", "Internship at XYZ Pvt Ltd")
- organization: issuing organization / company / institute (null if not present)
- date: the single most relevant date in the document as YYYY-MM-DD, or just YYYY if that's
  all that's available (null if you truly can't find one)
- description: 1-2 sentence plain-English summary of what this document represents
- skills: specific skills, tools, or technologies this document demonstrates (e.g. ["Python", "React", "Public Speaking"])
- tags: 3-6 short keywords useful for search
- entities: notable named entities mentioned — people, organizations, dates, locations —
  as a list of {{"type": "person|organization|date|location|other", "value": "..."}}

Be specific and factual. Do not invent information that isn't in the document.
"""

FALLBACK_RESULT = {
    "category": "Achievements",
    "title": "Untitled document",
    "organization": None,
    "date": None,
    "description": "Could not fully parse this document automatically.",
    "skills": [],
    "tags": [],
    "entities": [],
}

DOCX_MIME_TYPES = {
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


def _pdf_to_text(file_bytes: bytes) -> str | None:
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        text = "\n".join((page.extract_text() or "") for page in reader.pages)
        return text.strip() or None
    except Exception as e:
        log.warning("PDF text extraction failed: %s", e)
        return None


def _docx_to_text(file_bytes: bytes) -> str | None:
    try:
        doc = DocxDocument(io.BytesIO(file_bytes))
        text = "\n".join(p.text for p in doc.paragraphs)
        return text.strip() or None
    except Exception as e:
        log.warning("DOCX text extraction failed: %s", e)
        return None


def _extract_plain_text(file_bytes: bytes, mime_type: str) -> str | None:
    """Best-effort plain text, used to route to the (cheaper, 3-tier) text
    path instead of the (Gemini-only) multimodal path. Returns None when we
    can't get usable text — e.g. scanned/image-only PDFs, plain images.
    """
    if mime_type == "application/pdf":
        return _pdf_to_text(file_bytes)
    if mime_type in DOCX_MIME_TYPES:
        return _docx_to_text(file_bytes)
    if mime_type == "text/plain":
        try:
            return file_bytes.decode("utf-8", errors="ignore").strip() or None
        except Exception:
            return None
    return None


def _parse_json_response(raw: str | None) -> dict:
    raw = (raw or "").strip().replace("```json", "").replace("```", "").strip()
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        log.warning("Model returned non-JSON, using fallback result. Raw (truncated): %s", raw[:300])
        return dict(FALLBACK_RESULT)

    if data.get("category") not in CATEGORIES:
        data["category"] = "Achievements"
    data.setdefault("skills", [])
    data.setdefault("tags", [])
    data.setdefault("entities", [])
    return data


async def extract_document(file_bytes: bytes, mime_type: str) -> dict:
    """Ingestion + categorization (Modules 1 + 2), plus skills/entity extraction.

    Routing:
      - text-extractable (PDF-with-text, DOCX, .txt) -> text path:
        Gemini primary -> Gemini backup -> Groq   (all 3 tiers can help)
      - everything else (images, scanned/image-only PDFs) -> multimodal path:
        Gemini primary -> Gemini backup only (Groq can't see images)
    """
    plain_text = _extract_plain_text(file_bytes, mime_type)

    try:
        if plain_text:
            raw = await generate(EXTRACTION_PROMPT, text=plain_text, schema=ExtractedData)
        else:
            raw = await generate(EXTRACTION_PROMPT, file_bytes=file_bytes, mime_type=mime_type, schema=ExtractedData)
    except Exception as e:
        log.error("Extraction failed on every provider: %s", e)
        return dict(FALLBACK_RESULT)

    return _parse_json_response(raw)
