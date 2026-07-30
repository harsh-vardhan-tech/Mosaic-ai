from collections import Counter

from fastapi import APIRouter, Depends

from auth import get_current_user
from firebase_init import db

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary")
async def analytics_summary(user: dict = Depends(get_current_user)):
    docs = list(db.collection("items").where("uid", "==", user["uid"]).stream())
    data = [d.to_dict() for d in docs]

    category_counts = Counter(d.get("category", "Unknown") for d in data)

    skill_counter = Counter()
    for d in data:
        skill_counter.update(d.get("skills", []))

    year_counts = Counter()
    for d in data:
        date = d.get("date") or ""
        year = date[:4] if len(date) >= 4 and date[:4].isdigit() else "Unknown"
        year_counts[year] += 1

    return {
        "total_items": len(data),
        "by_category": dict(category_counts),
        # top_skills is a truncated leaderboard, so the true distinct count has
        # to be sent separately — the frontend can't derive it from the slice.
        "unique_skills": len(skill_counter),
        "top_skills": skill_counter.most_common(10),
        "by_year": dict(sorted(year_counts.items())),
    }
