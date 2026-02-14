"""
Role analysis engine using market skill data.

Loads skill frequencies from app/data/market_skills.json at startup.
"""

import json
from pathlib import Path

MARKET_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "market_skills.json"


def _load_market_data() -> dict:
    if not MARKET_DATA_PATH.exists():
        return {}
    with open(MARKET_DATA_PATH) as f:
        return json.load(f)


MARKET_DATA = _load_market_data()


def analyze_role(user_skills: list[str], selected_role: str) -> dict:
    if selected_role not in MARKET_DATA:
        return {
            "alignment_score": 0.0,
            "missing_skills": [],
        }

    role_skills = MARKET_DATA[selected_role]
    user_skills_normalized = [s.lower().strip() for s in user_skills]

    total_weight = 0
    earned_weight = 0
    missing_skills = []

    for skill, frequency in role_skills.items():
        importance_weight = round(frequency * 10)
        total_weight += importance_weight

        if skill.lower() in user_skills_normalized:
            earned_weight += importance_weight
        else:
            missing_skills.append(
                {
                    "skill": skill,
                    "importance": importance_weight,
                }
            )

    alignment_score = (
        round((earned_weight / total_weight) * 100, 2)
        if total_weight > 0
        else 0.0
    )

    missing_skills.sort(key=lambda x: x["importance"], reverse=True)

    return {
        "alignment_score": alignment_score,
        "missing_skills": missing_skills,
    }
