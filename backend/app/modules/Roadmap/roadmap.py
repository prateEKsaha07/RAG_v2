import json
import os
import math
import re
from datetime import datetime, timedelta

ANALYTICS_DIR = "analytics/"


def normalize_subject_key(subject: str) -> str:
    """
    Canonical form for subject matching.
    'Computer-Graphics', 'Computer Graphics', 'computer_graphics'
      -> 'computergraphics'
    """
    return re.sub(r"[\s\-_]+", "", subject).lower()


# ---------------------------------------------------------------------------
# Unit loading — pulls directly from FAISS metadata
# ---------------------------------------------------------------------------
def load_subject_units_from_faiss(subject, vectorStoreDB):
    """
    Extract unique units + topics for a subject from FAISS metadata.
    Matches by canonical subject_key to tolerate naming variations.
    Returns:
      [{"unit": 1, "name": "Fundamentals of...", "topics": [{"name": "..."}, ...]}]
    """
    needle = normalize_subject_key(subject)
    all_docs = list(vectorStoreDB.docstore._dict.values())
    units = {}

    for doc in all_docs:
        meta = doc.metadata

        # Match on canonical key (preferred), fall back to normalized subject
        haystack = meta.get("subject_key") or normalize_subject_key(meta.get("subject", ""))
        if haystack != needle:
            continue

        unit_num = meta.get("unit_number")
        if unit_num is None:
            continue

        if unit_num not in units:
            units[unit_num] = {
                "unit": unit_num,
                "name": meta.get("unit_name") or f"Unit {unit_num}",
                "topics": set(),
            }

        topic = meta.get("topic") or meta.get("chapter")
        if topic:
            units[unit_num]["topics"].add(topic)

    return [
        {
            "unit": u["unit"],
            "name": u["name"],
            "topics": [{"name": t} for t in sorted(u["topics"])]
        }
        for u in sorted(units.values(), key=lambda x: x["unit"])
    ]


# ---------------------------------------------------------------------------
# Weak topics from quiz history
# ---------------------------------------------------------------------------
def load_weak_topics(subject):
    history_file = os.path.join(ANALYTICS_DIR, "quiz_history.json")
    if not os.path.exists(history_file):
        return []

    with open(history_file, "r") as f:
        history = json.load(f)

    needle = normalize_subject_key(subject)
    subject_history = [
        h for h in history
        if normalize_subject_key(h.get("subject", "")) == needle
    ]
    if not subject_history:
        return []

    topic_count = {}
    for attempt in subject_history:
        for topic in attempt.get("weak_topics", []):
            topic_count[topic] = topic_count.get(topic, 0) + 1

    sorted_topics = sorted(topic_count.items(), key=lambda x: x[1], reverse=True)
    return [topic for topic, _ in sorted_topics]


# ---------------------------------------------------------------------------
# LLM roadmap structure
# ---------------------------------------------------------------------------
def get_roadmap_structure(units, weak_topics, llm):
    prompt = f"""You are a study planner.
Given these subject units and topics, estimate study hours per topic.

Rules:
- Weak topics need MORE time (add 1-2 extra hours)
- Order topics within each unit: beginner first
- Hours per topic: minimum 1, maximum 4
- Preserve the exact unit numbers and topic names given below
- Return ONLY a JSON array matching the input structure

Weak topics that need priority: {weak_topics}

Units and topics:
{json.dumps(units, indent=2)}

Return format:
[
  {{
    "unit": <same unit number as input>,
    "name": "<same name as input>",
    "topics": [
      {{"name": "<same topic name>", "hours": 2, "is_weak": false}}
    ]
  }}
]"""

    response = llm.invoke(prompt)
    from app.modules.Quiz.quiz import parse_json_response
    return parse_json_response(response.content)


def validate_roadmap_structure(structure, original_units):
    if not isinstance(structure, list) or not structure:
        return False

    for unit in structure:
        if not isinstance(unit, dict):
            return False
        if "unit" not in unit or "topics" not in unit:
            return False
        if not isinstance(unit["topics"], list):
            return False
        for topic in unit["topics"]:
            if "name" not in topic or "hours" not in topic:
                return False

    input_units = {u["unit"] for u in original_units}
    output_units = {u["unit"] for u in structure}
    if not input_units.issubset(output_units):
        return False

    return True


# ---------------------------------------------------------------------------
# Weekly schedule builder
# ---------------------------------------------------------------------------
def build_weekly_schedule(roadmap_structure, hours_per_day, start_date):
    weeks = []
    current_week = 1
    current_day = 0
    week_topics = []

    start = datetime.strptime(start_date, "%Y-%m-%d")

    for unit in roadmap_structure:
        for topic in unit["topics"]:
            days_needed = math.ceil(topic["hours"] / hours_per_day)

            topic["days_needed"] = days_needed
            topic["status"] = "not_started"
            topic["completed_date"] = None

            week_topics.append({
                "unit": unit["unit"],
                "unit_name": unit["name"],
                "topic": topic
            })

            current_day += days_needed

            # Flush all completed weeks
            while current_day >= 7 * current_week:
                week_start = start + timedelta(days=(current_week - 1) * 7)
                week_end = week_start + timedelta(days=6)

                weeks.append({
                    "week": current_week,
                    "start_date": week_start.strftime("%Y-%m-%d"),
                    "end_date": week_end.strftime("%Y-%m-%d"),
                    "topics": week_topics.copy()
                })
                week_topics = []
                current_week += 1

    # Remaining topics
    if week_topics:
        week_start = start + timedelta(days=(current_week - 1) * 7)
        week_end = week_start + timedelta(days=6)
        weeks.append({
            "week": current_week,
            "start_date": week_start.strftime("%Y-%m-%d"),
            "end_date": week_end.strftime("%Y-%m-%d"),
            "topics": week_topics
        })

    return weeks


# ---------------------------------------------------------------------------
# Roadmap generation
# ---------------------------------------------------------------------------
def generate_roadmap(subject, hours_per_day, target_date, scope,
                     unit_number=None, llm=None, user_id=None,
                     vectorStoreDB=None):
    from app.core.supabase_client import supabase

    if vectorStoreDB is None:
        return {"error": "Vector store not ready"}

    units = load_subject_units_from_faiss(subject, vectorStoreDB)
    if not units:
        return {"error": f"No units found for {subject}"}

    if scope == "unit" and unit_number:
        units = [u for u in units if u["unit"] == unit_number]
        if not units:
            return {"error": f"Unit {unit_number} not found"}

    weak_topics = load_weak_topics(subject)
    roadmap_structure = get_roadmap_structure(units, weak_topics, llm)

    if not validate_roadmap_structure(roadmap_structure, units):
        return {"error": "LLM returned invalid roadmap structure. Please try again."}

    start_date = datetime.now().strftime("%Y-%m-%d")
    weeks = build_weekly_schedule(roadmap_structure, hours_per_day, start_date)

    response = supabase.table("roadmaps").insert({
        "subject": subject,
        "subject_key": normalize_subject_key(subject),   # canonical
        "scope": scope,
        "unit_number": unit_number,
        "hours_per_day": hours_per_day,
        "target_date": target_date,
        "created_at": datetime.now().isoformat(),
        "status": "active",
        "weeks": weeks,
        "weak_topics": weak_topics,
        "user_id": user_id,
    }).execute()

    return response.data[0] if response.data else {"error": "Failed to create roadmap"}


# ---------------------------------------------------------------------------
# Supabase loaders
# ---------------------------------------------------------------------------
def load_roadmap(subject, user_id=None):
    from app.core.supabase_client import supabase
    needle = normalize_subject_key(subject)

    results = (
        supabase.table("roadmaps")
        .select("*")
        .eq("subject_key", needle)
        .eq("user_id", user_id)
        .eq("status", "active")
        .execute()
    )

    return results.data[0] if results.data else None


def check_existing_roadmap(subject, user_id=None):
    from app.core.supabase_client import supabase
    needle = normalize_subject_key(subject)

    results = (
        supabase.table("roadmaps")
        .select("id")
        .eq("subject_key", needle)
        .eq("user_id", user_id)
        .eq("status", "active")
        .execute()
    )

    return len(results.data) > 0