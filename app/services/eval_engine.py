import json
import requests
from app.models import TaskFeedback

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"

def evaluate_submission(submission_text: str, task_context: str = "System Design") -> TaskFeedback:
    prompt = (
        "Role: Strict Technical Interviewer. Evaluate answer. Return ONLY JSON.\n"
        "Criteria: Brutal grading. Score < 10 for irrelevant/dumb answers. Vauge = Low score.\n"
        f"Context: {task_context}. Answer: {submission_text}\n\n"
        "JSON Format:\n"
        "{\n"
        '  "rating": <0-100>,\n'
        '  "mistakes": ["list of flaws"],\n'
        '  "correct_approach": "what was actually needed",\n'
        '  "improvements": ["next steps"]\n'
        "}"
    )

    try:
        resp = requests.post(
            OLLAMA_URL,
            json={
                "model": "llama3:latest",
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.0,
                    "num_predict": 150,
                    "top_k": 20
                }
            },
            timeout=120
        )
        resp.raise_for_status()
        
        raw_response = resp.json().get("response", "").strip()
        
        # Robust JSON extraction
        if "{" in raw_response and "}" in raw_response:
            start = raw_response.find("{")
            end = raw_response.rfind("}")
            raw_response = raw_response[start:end+1]
            
        data = json.loads(raw_response)
        
        # Ensure all fields exist
        return TaskFeedback(
            rating=int(data.get("rating", 0)),
            mistakes=data.get("mistakes", []),
            correct_approach=data.get("correct_approach", "Review technical documentation."),
            improvements=data.get("improvements", [])
        )
        
    except Exception as e:
        print(f"AI Evaluation failed: {e}")
        # Fallback evaluation
        return TaskFeedback(
            rating=70,
            mistakes=["Unable to perform AI analysis at this time."],
            correct_approach="Please review standard documentation for this topic.",
            improvements=["Try providing more technical detail in your next answer."]
        )
