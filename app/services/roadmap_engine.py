"""
Roadmap engine: Generate 30-day learning roadmaps using Ollama.

Deterministic fallback if AI generation is unavailable.
"""

from __future__ import annotations

import json
import requests

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
OLLAMA_TIMEOUT = 90

# Fallback templates if Ollama fails
DAILY_TASK_TEMPLATES = {
    1: "{skill} Fundamentals",
    2: "{skill} Core Concepts & Architecture",
    3: "{skill} Hands-on Practice",
    4: "{skill} Mini Project",
    5: "{skill} Advanced Concepts",
    6: "{skill} Real-world Use Cases",
    7: "{skill} Self-assessment & Checkpoint",
}

DAILY_DESCRIPTIONS = {
    1: "Learn the fundamentals and basics of {skill}.",
    2: "Study core concepts, architecture, and key design patterns.",
    3: "Write code, follow tutorials, and get hands-on experience.",
    4: "Build a small project to solidify understanding.",
    5: "Explore advanced topics and best practices.",
    6: "Study real-world applications and case studies.",
    7: "Test your knowledge with a self-assessment and review weak areas.",
}


def generate_ai_week_plan(skill: str, role_context: str) -> list[dict]:
    """
    Generate a 7-day learning plan using Ollama.

    Falls back to deterministic template if AI generation fails.

    Args:
        skill: The skill to learn
        role_context: The role context (e.g., "Backend Developer")

    Returns:
        List of daily tasks
    """
    prompt = (
        "Return ONLY valid JSON. "
        "Generate exactly 7 objects for a 7-day learning plan. "
        "Each object must be in this format: "
        '{"day": number, "task": string, "description": string}.\n\n'
        f"Skill: {skill}\n"
        f"Role: {role_context}\n"
        "Format strictly as a JSON array. No explanation. No markdown."
    )

    try:
        resp = requests.post(
            OLLAMA_URL,
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.3,
                },
            },
            timeout=OLLAMA_TIMEOUT,
        )
        resp.raise_for_status()

        response_json = resp.json()
        raw_text = str(response_json.get("response", "")).strip()

        start = raw_text.find("[")
        end = raw_text.rfind("]")
        if start == -1 or end == -1:
            raise ValueError("No JSON array found in Ollama response")

        extracted_json = raw_text[start : end + 1]
        week_plan = json.loads(extracted_json)

        if not isinstance(week_plan, list):
            raise ValueError("Response is not a JSON array")

        if len(week_plan) < 7:
            raise ValueError(f"Expected at least 7 items, got {len(week_plan)}")

        return week_plan[:7]

    except (
        requests.RequestException,
        json.JSONDecodeError,
        KeyError,
        TypeError,
        ValueError,
    ):
        print("Ollama failed, using fallback")
        pass

    # Fallback to deterministic template
    return generate_deterministic_week_plan(skill)


def generate_deterministic_week_plan(skill: str) -> list[dict]:
    """
    Generate a deterministic 7-day learning plan (fallback).

    Args:
        skill: The skill to learn

    Returns:
        List of daily tasks
    """
    days = []
    for day_num in range(1, 8):
        task_title = DAILY_TASK_TEMPLATES[day_num].format(skill=skill)
        task_desc = DAILY_DESCRIPTIONS[day_num].format(skill=skill)

        days.append(
            {
                "day": day_num,
                "task": task_title,
                "description": task_desc,
            }
        )

    return days


def generate_roadmap(
    missing_skills: list[dict], role_context: str = "Backend Developer"
) -> dict:
    """
    Generate a 30-day learning roadmap using AI-generated weekly plans.

    Args:
        missing_skills: List of dicts with 'skill' and 'importance'
        role_context: The role context for AI generation

    Returns:
        Dict with 'roadmap' containing weekly plans
    """
    sorted_skills = sorted(
        missing_skills, key=lambda x: x.get("importance", 0), reverse=True
    )

    top_skills = sorted_skills[:4]

    roadmap = []

    for week_num, skill_dict in enumerate(top_skills, start=1):
        skill_name = skill_dict.get("skill", "Skill")
        importance = skill_dict.get("importance", 0)

        days = generate_ai_week_plan(skill_name, role_context)

        roadmap.append(
            {
                "week": week_num,
                "focus_skill": skill_name,
                "importance": importance,
                "days": days,
            }
        )

    roadmap_summary = {
        "roadmap": roadmap,
        "capstone": {
            "day": 29,
            "task": "Capstone Project",
            "description": "Build a capstone project combining all learned skills.",
        },
        "review": {
            "day": 30,
            "task": "Mock Interview & Review",
            "description": "Conduct a mock interview and review all concepts.",
        },
        "total_days": 30,
        "total_skills": len(top_skills),
    }

    return roadmap_summary
