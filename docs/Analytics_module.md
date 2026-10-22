# System Architecture Documentation

**Module:** Analytics (v1.0.0)

**Document Status:** Production-Ready

**Last Updated:** July 2026

---

## 1. Executive Summary & Purpose

The **Analytics Module** serves as the centralized data aggregation and reporting layer for the platform. By ingesting event streams and structural data from books, notes, quizzes, and learning roadmaps, this module synthesizes raw operational data into actionable, high-level metrics and visual reports.

The primary business and user experience objective is to increase student engagement and retention through transparent progress tracking, performance benchmarking, and behavioral insights.

---

## 2. Technical Stack

The core architecture leverages a decoupled frontend/backend framework designed for fast aggregation and minimal database overhead.

* **Backend Framework:** FastAPI (Python 3.11+)
* **Database & ORM:** Supabase Ecosystem / PostgREST
* **Authentication & Security:** Supabase JWT (Bearer Token Verification via JSON Web Tokens)
* **Frontend UI Engine:** React.js, Tailwind CSS (Fully Responsive Layout Engine)
* **Data Visualization:** Recharts (SVG-based reactive chart components)
* **HTTP Client:** Axios

---

## 3. Data Architecture & Schema Dependencies

The backend persists application records in four Supabase/PostgreSQL tables. Analytics reads these tables when the dashboard endpoint is invoked; the books, notes, quiz, and roadmap modules also write to them.

```
Supabase / PostgreSQL
├── books          ── PDF metadata; file bytes live in Supabase Storage
├── notes          ── note metadata; Markdown files live in Supabase Storage
├── quiz_history   ── quiz attempt results
└── roadmaps       ── study plans and their nested weekly schedule
```

### 3.1 Application-Facing Table Schema

The following is the complete set of columns read or written by the backend in these four tables. Types below describe the values the application sends or expects; they are not a substitute for the deployed database DDL.

| Table | Column | Application-level type | Usage |
| --- | --- | --- | --- |
| `books` | `id` | Identifier (string in the API) | Read and used to select or delete a book. |
| `books` | `user_id` | User identifier (string) | Owner filter on book and analytics queries. |
| `books` | `title` | String | Original filename stem; displayed in book and activity views. |
| `books` | `filename` | String | Original uploaded PDF filename. |
| `books` | `storage_path` | String | Path to the PDF in the `books` Storage bucket. |
| `books` | `file_size` | Integer; nullable in the API response | Uploaded PDF size in bytes. |
| `books` | `current_page` | Integer | Current reading position; initialized to `1` and updated by the progress endpoint. |
| `books` | `total_pages` | Integer | PDF page count. |
| `books` | `favorite` | Boolean | Initialized to `false`; returned by the book response model. |
| `books` | `archived` | Boolean | Initialized to `false`; returned by the book response model. |
| `books` | `uploaded_at` | Timestamp | Upload time, supplied by the backend. |
| `books` | `last_opened` | Timestamp | Used for recent-book ordering and activity/streak calculations; supplied on upload. |
| `books` | `cover_image` | Optional value (read-only here) | Read by analytics for the currently-reading book; this backend does not write it. |
| `notes` | `id` | Identifier | Selected when resolving a note by owner and filename. |
| `notes` | `user_id` | User identifier (string) | Owner filter on note and analytics queries. |
| `notes` | `filename` | String | Storage filename and note lookup key. |
| `notes` | `subject` | String | Display subject; also embedded in the stored Markdown file. |
| `notes` | `subject_key` | String | Normalized subject key used for filtering. |
| `notes` | `title` | String | Note title. |
| `notes` | `tags` | Array of strings | Note tags supplied on create and update. |
| `notes` | `urls` | Array | Referenced URLs supplied on create and update. |
| `notes` | `word_count` | Integer | Word count calculated from note content. |
| `notes` | `ingested` | Boolean | Set to `false` on create/update and `true` after ingestion. |
| `notes` | `last_edited` | Timestamp | Set on update; used for analytics activity and weekly counts. |
| `quiz_history` | `user_id` | User identifier (string) | Owner filter on quiz and analytics queries. |
| `quiz_history` | `subject` | String | Quiz subject. |
| `quiz_history` | `score` | Integer | Number of correct answers. |
| `quiz_history` | `total` | Integer | Number of questions in the attempt. |
| `quiz_history` | `weak_topics` | Array of strings | Topics missed in the attempt. |
| `quiz_history` | `created_at` | Timestamp | Used to order attempts and calculate activity; quiz inserts omit it, so the database must supply it. |
| `roadmaps` | `id` | Identifier | Selected when checking for an existing roadmap. |
| `roadmaps` | `user_id` | User identifier (string) | Owner filter on roadmap and analytics queries. |
| `roadmaps` | `subject` | String | Display subject. |
| `roadmaps` | `subject_key` | String | Normalized subject key used to find a user's active roadmap. |
| `roadmaps` | `scope` | String | Generation scope, such as a subject or unit. |
| `roadmaps` | `unit_number` | Integer or null | Unit number when generation is unit-scoped. |
| `roadmaps` | `hours_per_day` | Integer | Daily study-hours input used to generate the schedule. |
| `roadmaps` | `target_date` | Date | Deadline; updated by the extend-date endpoint. |
| `roadmaps` | `created_at` | Timestamp | Creation time, supplied by the backend and used in recent activity. |
| `roadmaps` | `status` | String | Inserted as `active`; analytics also recognizes `completed`. |
| `roadmaps` | `weeks` | Array of schedule objects | Generated schedule; its nested shape is described below. |
| `roadmaps` | `weak_topics` | Array of strings | Weak topics used when generating the plan. |

**Roadmap `weeks` value:** an array of week objects containing `week` (integer), `start_date` and `end_date` (date strings), and `topics` (array). Each topic entry contains `unit` (integer), `unit_name` (string), and a nested `topic` object. The nested topic includes `name`, `hours`, `days_needed`, `status` (`not_started` or `completed` in the current code), and `completed_date` (null or a date string); the generated structure may also include `is_weak`.

The source repository contains no Supabase migration or SQL schema definition. Consequently, physical PostgreSQL types, primary/foreign-key declarations, indexes, nullability, and database defaults cannot be verified here. In particular, `quiz_history.created_at` must be populated by the deployed database because the backend insert does not supply it. `user_id` comes from the authenticated Supabase user, but an `auth.users` foreign-key constraint is not declared in this repository.

### 3.2 Other Backend Persistence

Supabase Storage has `books` and `notes` buckets: book PDFs are stored under `<user_id>/<generated_filename>`, and note Markdown files under `<user_id>/<note_filename>`. These are object-storage paths, not database tables. The backend also uses local FAISS indexes and JSON files (including `analytics/quiz_history.json`) for ingestion and a separate quiz-history endpoint; they are file-based persistence, not additional Supabase tables.

---

## 4. Backend Architecture

### 4.1 Directory Structure

The backend maintains a clean modular separation of routing layers and business logic engines:

```
analytics/
│
├── __init__.py
├── router.py       # HTTP Endpoint Definitions & Dependency Injection
└── service.py      # Business Logic, Aggregation Engines & DB Queries

```

### 4.2 API Endpoint Specifications

#### `GET /analytics/dashboard`

* **Description:** Retrieves a unified, compiled JSON payload encompassing all sub-domain statistics for the authenticated user.
* **Access Control:** Protected. Requires valid `Authorization: Bearer <JWT_TOKEN>` header.
* **Query Parameters:** None.
* **Success Response Code:** `200 OK`

##### Response Payload Schema (`application/json`)

```json
{
  "overview": {
    "total_uploaded_books": 14,
    "total_notes": 42,
    "quiz_attempts": 28,
    "average_quiz_score": 78.5,
    "best_quiz_score": 100.0,
    "latest_quiz_score": 85.0,
    "active_roadmaps": 3,
    "reading_progress_percent": 64.2,
    "study_streak_days": 0,
    "study_time_hours": 0
  },
  "study": {
    "current_book": {
      "id": "b8f9a2c1",
      "title": "Introduction to Algorithms"
    },
    "recently_opened": [
      { "id": "b8f9a2c1", "title": "Introduction to Algorithms", "last_opened": "2026-07-18T14:32:00Z" }
    ],
    "completion_percentage": 45.8
  },
  "quiz": {
    "pass_rate": 82.1,
    "average_score": 78.5,
    "best_score": 100.0,
    "latest_score": 85.0,
    "total_attempts": 28,
    "frequently_weak_topics": ["Dynamic Programming", "SQL Joins"],
    "recent_attempts": [
      { "quiz_id": "q101", "score": 85.0, "timestamp": "2026-07-19T10:15:00Z" }
    ]
  },
  "roadmap": {
    "active_roadmaps_count": 3,
    "completed_roadmaps_count": 5,
    "behind_schedule_count": 1,
    "nearest_deadline": "2026-08-01T00:00:00Z",
    "current_subject": "Data Systems",
    "statistics": {}
  },
  "activity": [
    {
      "module": "book",
      "action": "opened",
      "timestamp": "2026-07-19T16:00:00Z",
      "meta": { "title": "Designing Data-Intensive Applications" }
    }
  ],
  "weekly_progress": [
    { "day": "Monday", "books_opened": 2, "notes_edited": 4, "quiz_attempts": 1 },
    { "day": "Tuesday", "books_opened": 1, "notes_edited": 0, "quiz_attempts": 2 },
    { "day": "Wednesday", "books_opened": 3, "notes_edited": 5, "quiz_attempts": 0 },
    { "day": "Thursday", "books_opened": 0, "notes_edited": 1, "quiz_attempts": 1 },
    { "day": "Friday", "books_opened": 4, "notes_edited": 6, "quiz_attempts": 3 },
    { "day": "Saturday", "books_opened": 1, "notes_edited": 2, "quiz_attempts": 0 },
    { "day": "Sunday", "books_opened": 2, "notes_edited": 1, "quiz_attempts": 1 }
  ]
}

```

### 4.3 Service Logic Orchestration

The primary function `get_dashboard_data(user_id: str)` acts as the internal controller, handling concurrent calls or sequential fetches across internal private sub-routines.

```python
# System pseudo-execution path within service.py
def get_dashboard_data(user_id: str) -> dict:
    return {
        "overview": get_overview(user_id),
        "study": get_study(user_id),
        "quiz": get_quiz(user_id),
        "roadmap": get_roadmap(user_id),
        "activity": get_recent_activity(user_id),
        "weekly_progress": get_weekly_progress(user_id)
    }

```

---

## 5. Frontend Architecture & Interface Layout

The frontend leverages a modular tabbed/view architecture rooted in the parent `<AnalyticsDashboard/>` component.

```
AnalyticsDashboard/ (Parent Container Route)
│
├── Overview/       # Top-level KPI highlights & general layout
├── Study/          # Library engagement metrics & reading velocity
├── Quiz/           # Historical test evaluation
├── Performance/    # Focus trends & aggregated grading metrics
├── Roadmaps/       # Target milestones & track progress tracking
└── Reports/        # Extensible raw data layouts & platform outputs

```

### View Specifications

* **Overview View:** Renders Key Performance Indicator (KPI) grid cards alongside a Recharts composite line/bar graph representing weekly activity, followed by recent activity lists and a placeholder component for generative AI observations.
* **Study View:** Surface-level insights regarding document engagement, highlighting the most active reading resources, total minutes or percentages completed, and an intuitive "Recently Accessed" item reel.
* **Quiz View:** Focused dashboard capturing pass rates alongside specific subject tags flagged as "weak topics" via string aggregation.
* **Performance View:** Deep-dive historical evaluation layer mapping out score variances over multi-week bounds.
* **Roadmaps View:** Tracks completion statuses across current roadmap plans, parsing and rendering temporal deadlines.
* **Reports View:** Tabular summary structures serving as the staging ground for raw analytics readouts.

---

## 6. System Execution Lifecycle

```
[ Supabase Storage & Database Tables ]
                 │ (Raw Row-Level Reads)
                 ▼
     [ service.py Data Layer ]  ──► (Transforms & Agregates Map Arrays)
                 │ 
                 ▼
     [ router.py API Layer ]    ──► (Exposes GET /analytics/dashboard)
                 │
                 ▼
      [ React Web Application ] ──► (Axios Interceptor Ingests JWT Authenticated Data)
                 │
                 ▼
  [ UI Views via Recharts Engine ] ──► (Renders Overview, Quiz, Roadmaps Widgets)

```

---

## 7. Operational Status & Release Planning

### v1.0.0 Completed Deliverables

* [x] Core Python/FastAPI Router and Service pipeline architecture.
* [x] Targeted aggregations against Supabase `books`, `notes`, `quiz_history`, and `roadmaps`.
* [x] Secure API routing context guarded by Supabase JWT checks.
* [x] Fully dynamic React UI client rendering SVG charting instances using Recharts.

### v2.0.0 Future Development Roadmap

* [ ] **Server-Side Document Exporters:** Implementation of raw binary report downloads via standalone `.pdf`, `.csv`, and `.json` data endpoints.
* [ ] **LLM Recommendation Integration:** Deployment of an automated backend agent hook connecting verified weak study items to specialized AI learning recommendations.
* [ ] **Temporal Data Expansion:** Transition tracking from simple weekly snapshots to extended 30-day/monthly historical logs.
* [ ] **Gamification Engines:** Engine support for streaks, active daily tracking counters, and credential/badge triggers based on system actions.