import json

from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user
from firebase_init import db
from providers import generate
from schemas import ResumeData, PortfolioData
from logger import get_logger

log = get_logger("routes.generate")
router = APIRouter(prefix="/generate", tags=["generate"])


def _get_all_items_text(uid: str) -> str:
    docs = db.collection("items").where("uid", "==", uid).stream()
    lines = []
    for d in docs:
        data = d.to_dict()
        lines.append(
            f"- [{data.get('category')}] {data.get('title')} "
            f"({data.get('organization') or 'n/a'}, {data.get('date') or 'no date'}): "
            f"{data.get('description')} Skills: {', '.join(data.get('skills', []))}"
        )
    return "\n".join(lines)


def _safe_json(raw: str, fallback: dict) -> dict:
    cleaned = (raw or "").strip().replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        log.warning("Generator returned non-JSON, using fallback. Raw (truncated): %s", cleaned[:300])
        return fallback


@router.post("/bio")
async def generate_bio(user: dict = Depends(get_current_user)):
    """AI Summary — a short professional bio synthesized from everything the
    user has uploaded so far."""
    items_text = _get_all_items_text(user["uid"])
    if not items_text:
        raise HTTPException(status_code=400, detail="Upload some documents first")

    prompt = (
        "Write a warm, specific, first-person 3-4 sentence professional bio for a "
        "student, based only on the achievements listed below. Don't invent anything "
        "not implied by the list."
    )
    try:
        bio = await generate(prompt, text=items_text)
    except Exception as e:
        log.error("Bio generation failed: %s", e)
        raise HTTPException(status_code=503, detail="AI providers are unavailable right now")
    return {"bio": bio}


@router.post("/resume")
async def generate_resume(user: dict = Depends(get_current_user)):
    """Resume Generator — structured resume built from all uploaded items."""
    items_text = _get_all_items_text(user["uid"])
    if not items_text:
        raise HTTPException(status_code=400, detail="Upload some documents first")

    prompt = (
        "Build a resume from the achievements listed below. Group related items into "
        "sensible sections (e.g. Education, Skills, Projects, Internships, Certifications, "
        "Achievements) and write concise resume-style bullet points — action verb first, "
        "specific and factual, nothing invented. Also write a 2-sentence summary."
    )
    try:
        raw = await generate(prompt, text=items_text, schema=ResumeData)
    except Exception as e:
        log.error("Resume generation failed: %s", e)
        raise HTTPException(status_code=503, detail="AI providers are unavailable right now")

    return _safe_json(raw, {"full_summary": "", "sections": []})


@router.post("/portfolio")
async def generate_portfolio(user: dict = Depends(get_current_user)):
    """Portfolio Generator — a narrative, shareable summary of the student's
    journey, grouped into a few themed sections."""
    items_text = _get_all_items_text(user["uid"])
    if not items_text:
        raise HTTPException(status_code=400, detail="Upload some documents first")

    prompt = (
        "Write a shareable portfolio page from the achievements listed below: a short "
        "punchy title, a one-line tagline, and 3-5 sections (e.g. 'Journey So Far', "
        "'Technical Skills', 'Featured Projects', 'What's Next') each with a short "
        "paragraph of content. Be specific, factual, and engaging — nothing invented."
    )
    try:
        raw = await generate(prompt, text=items_text, schema=PortfolioData)
    except Exception as e:
        log.error("Portfolio generation failed: %s", e)
        raise HTTPException(status_code=503, detail="AI providers are unavailable right now")

    return _safe_json(raw, {"title": "", "tagline": "", "sections": []})
