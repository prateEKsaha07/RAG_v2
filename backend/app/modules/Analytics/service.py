from typing import Dict, List
from app.core.supabase_client import supabase
from collections import defaultdict
from datetime import datetime, date, timedelta


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


def _parse_iso(value):
    """Safely parse a Supabase timestamp into a datetime."""
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "").replace("+00:00", ""))
    except (ValueError, AttributeError):
        return None


def _safe_percentage(score, total):
    if not total:
        return 0
    return round((score / total) * 100)


# ---------------------------------------------------------------------------
# Dashboard aggregator
# ---------------------------------------------------------------------------
async def get_dashboard_data(user_id: str):
    overview = await get_overview(user_id)
    study = await get_study(user_id)
    quiz = await get_quiz(user_id)
    roadmap = await get_roadmap(user_id)
    activity = await get_recent_activity(user_id)
    weekly = await get_weekly_progress(user_id)

    return {
        "overview": overview,
        "study": study,
        "quiz": quiz,
        "roadmap": roadmap,
        "activity": activity,
        "weekly_progress": weekly,
    }


# ---------------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------------
async def get_overview(user_id: str):
    try:
        books = (
            supabase.table("books")
            .select("*", count="exact")
            .eq("user_id", user_id)
            .execute()
        )
        notes = (
            supabase.table("notes")
            .select("*", count="exact")
            .eq("user_id", user_id)
            .execute()
        )
        quizzes = (
            supabase.table("quiz_history")
            .select("*", count="exact")
            .eq("user_id", user_id)
            .order("created_at")
            .execute()
        )
        roadmaps = (
            supabase.table("roadmaps")
            .select("*", count="exact")
            .eq("user_id", user_id)
            .eq("status", "active")
            .execute()
        )

        # Score calculations
        average_score = 0
        best_score = 0
        latest_score = 0

        if quizzes.data:
            percentages = [
                _safe_percentage(q["score"], q["total"])
                for q in quizzes.data
            ]
            average_score = round(sum(percentages) / len(percentages))
            best_score = max(percentages)
            latest_score = percentages[-1]

        # Reading progress from books
        reading_progress = 0
        total_pages = 0
        current_pages = 0
        for book in books.data or []:
            total_pages += book.get("total_pages") or 0
            current_pages += book.get("current_page") or 0
        if total_pages > 0:
            reading_progress = round((current_pages / total_pages) * 100)

        # Current streak (consecutive days with any activity)
        current_streak = await _compute_streak(user_id)

        return {
            "study_time": 0,  # placeholder — track if you add session timing
            "books": len(books.data or []),
            "notes": len(notes.data or []),
            "quiz_attempts": len(quizzes.data or []),
            "average_score": average_score,
            "best_score": best_score,
            "latest_score": latest_score,
            "current_streak": current_streak,
            "reading_progress": reading_progress,
            "active_roadmaps": len(roadmaps.data or []),
        }

    except Exception as e:
        print(f"Overview error: {e}")
        return {
            "study_time": 0,
            "books": 0,
            "notes": 0,
            "quiz_attempts": 0,
            "average_score": 0,
            "best_score": 0,
            "latest_score": 0,
            "current_streak": 0,
            "reading_progress": 0,
            "active_roadmaps": 0,
        }


async def _compute_streak(user_id: str) -> int:
    """Count consecutive days (ending today) with any tracked activity."""
    try:
        cutoff = (date.today() - timedelta(days=30)).isoformat()

        quizzes = (
            supabase.table("quiz_history")
            .select("created_at")
            .eq("user_id", user_id)
            .gte("created_at", cutoff)
            .execute()
        )
        notes = (
            supabase.table("notes")
            .select("last_edited")
            .eq("user_id", user_id)
            .gte("last_edited", cutoff)
            .execute()
        )
        books = (
            supabase.table("books")
            .select("last_opened")
            .eq("user_id", user_id)
            .gte("last_opened", cutoff)
            .execute()
        )

        active_days = set()
        for row in (quizzes.data or []):
            dt = _parse_iso(row.get("created_at"))
            if dt:
                active_days.add(dt.date())
        for row in (notes.data or []):
            dt = _parse_iso(row.get("last_edited"))
            if dt:
                active_days.add(dt.date())
        for row in (books.data or []):
            dt = _parse_iso(row.get("last_opened"))
            if dt:
                active_days.add(dt.date())

        streak = 0
        day = date.today()
        while day in active_days:
            streak += 1
            day -= timedelta(days=1)

        return streak

    except Exception as e:
        print(f"Streak error: {e}")
        return 0


# ---------------------------------------------------------------------------
# Study
# ---------------------------------------------------------------------------
async def get_study(user_id: str):
    books = (
        supabase.table("books")
        .select("*")
        .eq("user_id", user_id)
        .order("last_opened", desc=True)
        .execute()
    )

    if not books.data:
        return {
            "currently_reading": None,
            "recent_books": [],
            "reading_progress": 0,
        }

    currently_reading = books.data[0]

    recent_books = [
        {
            "id": book["id"],
            "title": book["title"],
            "current_page": book.get("current_page", 0),
            "total_pages": book.get("total_pages", 0),
            "last_opened": book.get("last_opened"),
        }
        for book in books.data[:5]
    ]

    total_pages = sum(b.get("total_pages") or 0 for b in books.data)
    current_pages = sum(b.get("current_page") or 0 for b in books.data)
    progress = round((current_pages / total_pages) * 100) if total_pages else 0

    return {
        "currently_reading": {
            "title": currently_reading.get("title"),
            "current_page": currently_reading.get("current_page"),
            "total_pages": currently_reading.get("total_pages"),
            "cover": currently_reading.get("cover_image"),
        },
        "recent_books": recent_books,
        "reading_progress": progress,
    }


# ---------------------------------------------------------------------------
# Quiz
# ---------------------------------------------------------------------------
async def get_quiz(user_id: str):
    history = (
        supabase.table("quiz_history")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )

    if not history.data:
        return {
            "pass_rate": 0,
            "average_score": 0,
            "latest_score": 0,
            "best_score": 0,
            "total_attempts": 0,
            "weak_topics": [],
            "recent_attempts": [],
        }

    attempts = history.data
    total_attempts = len(attempts)
    scores = [_safe_percentage(a["score"], a["total"]) for a in attempts]

    average_score = round(sum(scores) / len(scores))
    latest_score = scores[0]
    best_score = max(scores)

    passed = len([s for s in scores if s >= 60])
    pass_rate = round((passed / total_attempts) * 100)

    topic_counter = {}
    for attempt in attempts:
        for topic in attempt.get("weak_topics") or []:
            topic_counter[topic] = topic_counter.get(topic, 0) + 1

    weak_topics = sorted(
        [{"topic": t, "count": c} for t, c in topic_counter.items()],
        key=lambda x: x["count"],
        reverse=True,
    )

    recent_attempts = [
        {
            "date": a["created_at"],
            "score": a["score"],
            "total": a["total"],
            "percentage": _safe_percentage(a["score"], a["total"]),
        }
        for a in attempts[:5]
    ]

    return {
        "pass_rate": pass_rate,
        "average_score": average_score,
        "latest_score": latest_score,
        "best_score": best_score,
        "total_attempts": total_attempts,
        "weak_topics": weak_topics,
        "recent_attempts": recent_attempts,
    }


# ---------------------------------------------------------------------------
# Roadmap
# ---------------------------------------------------------------------------
async def get_roadmap(user_id: str):
    roadmaps = (
        supabase.table("roadmaps")
        .select("*")
        .eq("user_id", user_id)
        .execute()
    )

    if not roadmaps.data:
        return {
            "active": 0,
            "completed": 0,
            "behind": 0,
            "next_deadline": None,
            "nearest_subject": None,
        }

    active = 0
    completed = 0
    behind = 0
    nearest_date = None
    nearest_subject = None
    today = date.today()

    for roadmap in roadmaps.data:
        target_raw = roadmap.get("target_date")
        target = None
        if target_raw:
            try:
                target = datetime.strptime(target_raw, "%Y-%m-%d").date()
            except ValueError:
                target = None

        if roadmap.get("status") == "completed":
            completed += 1
        else:
            active += 1

        if target and target < today and roadmap.get("status") != "completed":
            behind += 1

        if (
            roadmap.get("status") != "completed"
            and target
            and (nearest_date is None or target < nearest_date)
        ):
            nearest_date = target
            nearest_subject = roadmap.get("subject")

    return {
        "active": active,
        "completed": completed,
        "behind": behind,
        "next_deadline": nearest_date.isoformat() if nearest_date else None,
        "nearest_subject": nearest_subject,
    }


# ---------------------------------------------------------------------------
# Recent activity
# ---------------------------------------------------------------------------
async def get_recent_activity(user_id: str):
    activities = []

    books = (
        supabase.table("books")
        .select("title,last_opened")
        .eq("user_id", user_id)
        .order("last_opened", desc=True)
        .limit(5)
        .execute()
    )
    for book in books.data or []:
        if book.get("last_opened"):
            activities.append({
                "type": "book",
                "title": f'Opened "{book["title"]}"',
                "time": book["last_opened"],
                "icon": "book",
            })

    notes = (
        supabase.table("notes")
        .select("title,last_edited")
        .eq("user_id", user_id)
        .order("last_edited", desc=True)
        .limit(5)
        .execute()
    )
    for note in notes.data or []:
        if note.get("last_edited"):
            activities.append({
                "type": "note",
                "title": f'Edited "{note["title"]}"',
                "time": note["last_edited"],
                "icon": "file",
            })

    quizzes = (
        supabase.table("quiz_history")
        .select("subject,score,total,created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(5)
        .execute()
    )
    for quiz in quizzes.data or []:
        percentage = _safe_percentage(quiz["score"], quiz["total"])
        activities.append({
            "type": "quiz",
            "title": f'{quiz["subject"].upper()} Quiz ({percentage}%)',
            "time": quiz["created_at"],
            "icon": "brain",
        })

    # Moved OUT of the quiz loop — was a bug before
    roadmaps = (
        supabase.table("roadmaps")
        .select("subject,created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(5)
        .execute()
    )
    for roadmap in roadmaps.data or []:
        if roadmap.get("created_at"):
            activities.append({
                "type": "roadmap",
                "title": f'Roadmap: {roadmap["subject"]}',
                "time": roadmap["created_at"],
                "icon": "map",
            })

    # Filter out entries with missing timestamps before sorting
    activities = [a for a in activities if a.get("time")]

    # Sort by parsed datetime — safe against formats
    activities.sort(
        key=lambda x: _parse_iso(x["time"]) or datetime.min,
        reverse=True,
    )

    return activities[:15]


# ---------------------------------------------------------------------------
# Weekly progress
# ---------------------------------------------------------------------------
async def get_weekly_progress(user_id: str):
    today = date.today()
    start_date = today - timedelta(days=6)
    cutoff_iso = start_date.isoformat()

    week = defaultdict(lambda: {"quiz": 0, "notes": 0, "books": 0})

    # Quizzes
    quizzes = (
        supabase.table("quiz_history")
        .select("created_at")
        .eq("user_id", user_id)
        .gte("created_at", cutoff_iso)
        .execute()
    )
    for quiz in quizzes.data or []:
        dt = _parse_iso(quiz.get("created_at"))
        if dt:
            week[dt.strftime("%a")]["quiz"] += 1

    # Notes
    notes = (
        supabase.table("notes")
        .select("last_edited")
        .eq("user_id", user_id)
        .gte("last_edited", cutoff_iso)
        .execute()
    )
    for note in notes.data or []:
        dt = _parse_iso(note.get("last_edited"))
        if dt:
            week[dt.strftime("%a")]["notes"] += 1

    # Books
    books = (
        supabase.table("books")
        .select("last_opened")
        .eq("user_id", user_id)
        .gte("last_opened", cutoff_iso)
        .execute()
    )
    for book in books.data or []:
        if not book.get("last_opened"):
            continue
        dt = _parse_iso(book.get("last_opened"))
        if dt:
            week[dt.strftime("%a")]["books"] += 1

    # Build ordered result for the last 7 days
    result = []
    for i in range(7):
        day = start_date + timedelta(days=i)
        label = day.strftime("%a")
        result.append({
            "day": label,
            "date": day.isoformat(),
            "quiz": week[label]["quiz"],
            "notes": week[label]["notes"],
            "books": week[label]["books"],
        })
    return result