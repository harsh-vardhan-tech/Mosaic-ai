from pydantic import BaseModel
from typing import List, Optional


# ---------------------------------------------------------------------------
# Per-document extraction (Modules 1 + 2 + entity/skill extraction)
# ---------------------------------------------------------------------------
class Entity(BaseModel):
    type: str  # "person" | "organization" | "date" | "location" | "other"
    value: str


class ExtractedData(BaseModel):
    """Shape we force Gemini/Groq into for every uploaded document, via
    response_schema (Gemini) or a JSON-mode prompt (Groq)."""
    category: str
    title: str
    organization: Optional[str] = None
    date: Optional[str] = None  # best-guess date, "YYYY-MM-DD" or just "YYYY"
    description: str
    skills: List[str] = []
    tags: List[str] = []
    entities: List[Entity] = []


class ItemOut(BaseModel):
    id: str
    original_filename: str
    original_mime_type: str
    category: str
    title: str
    organization: Optional[str] = None
    date: Optional[str] = None
    description: str
    skills: List[str] = []
    tags: List[str] = []
    entities: List[Entity] = []
    file_url: str
    created_at: str


# ---------------------------------------------------------------------------
# Generators (resume / portfolio / bio)
# ---------------------------------------------------------------------------
class ResumeSection(BaseModel):
    heading: str
    bullets: List[str] = []


class ResumeData(BaseModel):
    full_summary: str
    sections: List[ResumeSection] = []


class PortfolioSection(BaseModel):
    heading: str
    content: str


class PortfolioData(BaseModel):
    title: str
    tagline: str
    sections: List[PortfolioSection] = []


# ---------------------------------------------------------------------------
# Career intelligence (skill gap / roadmap / interview prep / profile strength)
# ---------------------------------------------------------------------------
class SkillGapItem(BaseModel):
    skill: str
    status: str  # "have" | "partial" | "missing"
    note: str


class RoadmapStep(BaseModel):
    order: int
    title: str
    description: str
    resource: str  # a concrete course / certification / project suggestion


class CareerAnalysis(BaseModel):
    readiness_score: int  # 0-100 fit for the target role
    readiness_summary: str
    strengths: List[str] = []
    skill_gaps: List[SkillGapItem] = []
    roadmap: List[RoadmapStep] = []
    suggested_roles: List[str] = []


class InterviewQuestion(BaseModel):
    question: str
    category: str  # "technical" | "behavioral" | "project"
    hint: str  # what a strong answer should mention, grounded in the user's docs


class InterviewPrep(BaseModel):
    questions: List[InterviewQuestion] = []
    tips: List[str] = []


class RadarAxis(BaseModel):
    axis: str  # e.g. "Projects", "Certifications", "Breadth of skills"
    score: int  # 0-100


class ProfileStrength(BaseModel):
    overall: int  # 0-100
    summary: str
    radar: List[RadarAxis] = []
    quick_wins: List[str] = []


class CareerRequest(BaseModel):
    target_role: str = ""


# ---------------------------------------------------------------------------
# Chat (RAG)
# ---------------------------------------------------------------------------
class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    question: str
    history: List[ChatMessage] = []
