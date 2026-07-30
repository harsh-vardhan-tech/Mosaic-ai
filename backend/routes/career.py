"""Career intelligence — the AI layer on top of everything the user uploaded.

Three endpoints, all grounded ONLY in the user's own extracted items:
  - POST /career/analysis  -> skill gap + learning roadmap for a target role
  - POST /career/interview -> interview prep grounded in the user's real projects
  - POST /career/strength  -> profile strength score + radar breakdown

They reuse the same provider fallback chain (Gemini -> Gemini backup -> Groq)
and the same items-to-text serialization as the resume/bio generators.
"""
from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user
from providers import generate
from routes.generate import _get_all_items_text, _safe_json
from schemas import CareerAnalysis, CareerRequest, InterviewPrep, ProfileStrength
from logger import get_logger

log = get_logger("routes.career")
router = APIRouter(prefix="/career", tags=["career"])


def _items_or_400(uid: str) -> str:
    items_text = _get_all_items_text(uid)
    if not items_text:
        raise HTTPException(status_code=400, detail="Upload some documents first")
    return items_text


@router.post("/analysis")
async def career_analysis(body: CareerRequest, user: dict = Depends(get_current_user)):
    """Skill gap + learning roadmap for a target role, based on real uploads."""
    items_text = _items_or_400(user["uid"])
    role = body.target_role.strip() or "a role that best fits this profile"

    prompt = (
        f"You are a pragmatic career coach for students. The target role is: {role}. "
        "Based ONLY on the achievements listed below, produce:\n"
        "- readiness_score: 0-100 honest fit for the target role\n"
        "- readiness_summary: 2 sentences, specific and encouraging but honest\n"
        "- strengths: 3-5 strengths grounded in the actual items\n"
        "- skill_gaps: 4-7 skills relevant to the role, each with status 'have', "
        "'partial', or 'missing' (judged from the items) and a one-line note\n"
        "- roadmap: 4-6 ordered steps to close the gaps, each with a concrete "
        "resource (a named course, certification, or project idea)\n"
        "- suggested_roles: 3 alternative roles this profile already fits well\n"
        "Never invent achievements the user doesn't have."
    )
    try:
        raw = await generate(prompt, text=items_text, schema=CareerAnalysis)
    except Exception as e:
        log.error("Career analysis failed: %s", e)
        raise HTTPException(status_code=503, detail="AI providers are unavailable right now")

    return _safe_json(
        raw,
        {
            "readiness_score": 0,
            "readiness_summary": "",
            "strengths": [],
            "skill_gaps": [],
            "roadmap": [],
            "suggested_roles": [],
        },
    )


@router.post("/interview")
async def interview_prep(body: CareerRequest, user: dict = Depends(get_current_user)):
    """Interview questions the user should expect, grounded in their own docs."""
    items_text = _items_or_400(user["uid"])
    role = body.target_role.strip() or "a role that best fits this profile"

    prompt = (
        f"You are an interviewer preparing a student for interviews for: {role}. "
        "Based ONLY on the achievements listed below, write 8-10 interview questions "
        "they should expect. Mix categories: 'technical' (on their actual skills), "
        "'project' (digging into their specific projects/internships by name), and "
        "'behavioral'. For each question add a hint: what a strong answer should "
        "mention, referencing their real items. Also give 3-5 short overall tips."
    )
    try:
        raw = await generate(prompt, text=items_text, schema=InterviewPrep)
    except Exception as e:
        log.error("Interview prep failed: %s", e)
        raise HTTPException(status_code=503, detail="AI providers are unavailable right now")

    return _safe_json(raw, {"questions": [], "tips": []})


@router.post("/strength")
async def profile_strength(user: dict = Depends(get_current_user)):
    """Profile strength score with a radar breakdown + quick wins."""
    items_text = _items_or_400(user["uid"])

    prompt = (
        "You are auditing a student's career profile. Based ONLY on the achievements "
        "listed below, produce:\n"
        "- overall: 0-100 profile strength (be honest — few items means a low score)\n"
        "- summary: 2 sentences on the profile's current shape\n"
        "- radar: exactly these 6 axes, each scored 0-100 from the evidence: "
        "'Projects', 'Certifications', 'Internships', 'Achievements', "
        "'Skill breadth', 'Recency'\n"
        "- quick_wins: 3-5 specific, small actions that would most improve the "
        "profile (e.g. a missing document type to upload, a cert to finish)."
    )
    try:
        raw = await generate(prompt, text=items_text, schema=ProfileStrength)
    except Exception as e:
        log.error("Profile strength failed: %s", e)
        raise HTTPException(status_code=503, detail="AI providers are unavailable right now")

    return _safe_json(raw, {"overall": 0, "summary": "", "radar": [], "quick_wins": []})
