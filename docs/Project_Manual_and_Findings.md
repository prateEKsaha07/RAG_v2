# RAG_v2 Project Manual and Implementation Findings

This document describes the repository's implemented architecture, frontend workflows, backend modules, API endpoints, storage, and notable code/documentation gaps. It is intended as a detailed project and presentation manual.

The report is based on source inspection. It does not claim that external services or deployment configuration have been tested. Where the source and older module documentation differ, this document describes the routes and behavior found in the source.

## 1. Executive overview

RAG_v2 is a web-based AI study assistant. It is designed to help learners work with their own study materials: upload content, ask questions grounded in it, create notes, take quizzes, track progress, and plan what to study next.

The frontend is a React single-page application, and the backend is a FastAPI service. Cohere provides embeddings and language-model responses; FAISS provides local vector search; Supabase provides authentication, database records, and file storage.

The intended learning cycle is:

**Upload material → index it → ask questions or study → take a quiz → identify weak topics → follow a roadmap → review progress.**

## 2. Architecture and data flow

### High-level request flow

1. The frontend presents screens for login, the learning dashboard, uploads, Q&A, quizzes, notes, study books, roadmaps, analytics, profiles, and collaboration.
2. Supabase Auth signs users in and provides access tokens. The frontend sends those tokens to protected FastAPI endpoints.
3. FastAPI validates the token and routes requests to feature-specific modules.
4. Supabase stores user-scoped records and uploaded book/note files.
5. FAISS and Cohere support semantic retrieval and AI generation for study workflows.

### Retrieval-augmented generation (RAG)

The backend initializes its RAG resources at startup in `backend/app/core/rag.py`: Cohere embeddings, the shared upload FAISS index, and a Cohere chat model.

The ingestion module (`backend/app/modules/Ingestion/services.py`) processes Markdown files in `backend/data/uploads/`, splits them into chunks, adds subject/unit/topic metadata, and saves them to the shared FAISS index. The Q&A module (`backend/app/modules/Qa/services.py`) searches uploaded material and, when available, the signed-in user's notes index; it combines relevant content and asks the language model to answer. Its request can specify a subject and whether general knowledge is allowed.

### Main persistence locations

| Data | Persistence |
|---|---|
| User identity and sessions | Supabase Auth |
| Profile, books, notes metadata, quiz records, roadmaps, collaboration | Supabase database |
| Book PDFs and note Markdown files | Supabase Storage |
| Shared uploaded-study-material vectors | Local shared FAISS index |
| Personal note vectors | Local per-user FAISS indexes |
| Original uploaded Markdown | `backend/data/uploads/` |
| Subject tags and topic metadata | JSON files under `backend/tags/` |
| Local quiz history and sample roadmap data | JSON files under `backend/analytics/` |

These storage choices are important: not all features use the same persistence mechanism, and some user data is scoped per-user while the uploaded-content index is shared.

## 3. Technology stack

| Area | Technologies and role |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS; renders the web application and feature screens. |
| Frontend data and visualization | Axios and `fetch` for HTTP; Recharts for analytics charts; React PDF for the book reader; Framer Motion for animation. |
| Backend | Python 3.11.9, FastAPI, Pydantic; HTTP routing, request validation, and feature services. |
| AI and retrieval | LangChain, Cohere embeddings and chat model, FAISS vector indexes. |
| Authentication and persistence | Supabase Auth, PostgreSQL-backed records, and Supabase Storage. |
| Deployment configuration | A Render configuration is present in `backend/render.yaml`. |

The frontend dependency and command definitions are in `frontend/package.json`; backend dependencies are in `backend/requirements.txt`.

## 4. Folder structure

### Repository root

- `README.md` — project overview, architecture, and structure.
- `LICENSE` — project license.
- `runtime.txt` — root Python runtime declaration.
- `AI Study AssistantF.pptx` — presentation file.
- `backend/` — API, AI services, local indexes, and backend data.
- `frontend/` — React application.
- `docs/` — design, module, workflow, and implementation documentation.

### Backend

```text
backend/
├── app/
│   ├── core/
│   │   ├── auth.py                 # Bearer-token validation and current-user lookup
│   │   ├── config.py               # Configuration module
│   │   ├── deps.py                 # LLM, embeddings, and vector-store dependencies
│   │   ├── rag.py                  # RAG resources and FAISS loading
│   │   ├── supabase_client.py      # Backend Supabase client
│   │   └── text_utils.py           # Subject normalization and JSON parsing
│   ├── modules/
│   │   ├── Analytics/              # Aggregated learning dashboard
│   │   ├── Collaboration/          # Workspaces, members, messages, polls, tasks
│   │   ├── Ingestion/              # Markdown processing and vector indexing
│   │   ├── Notes/                  # Notes, tags, URL metadata, notes indexing
│   │   ├── Qa/                     # Retrieval-grounded question answering
│   │   ├── Quiz/                   # Quiz generation, scoring, recommendations
│   │   ├── QuizHistory/            # Local JSON quiz-history route
│   │   ├── Roadmap/                # Personalized study plans
│   │   ├── Subjects/               # Subject and unit discovery
│   │   ├── Uploads/                # Uploaded Markdown lookup
│   │   ├── books/                  # PDF library and reading progress
│   │   └── profile/                # Signed-in user's profile
│   ├── shared/                     # Shared module location
│   └── main.py                     # FastAPI app and router registration
├── analytics/
│   ├── quiz_history.json
│   └── roadmaps/
├── data/uploads/                   # Markdown sources
├── faiss_index/                    # Shared upload vector index
├── notes_faiss_index/              # Per-user note indexes
├── tags/                           # Subject tag/topic JSON files
├── render.yaml
├── requirements.txt
└── runtime.txt
```

### Frontend

```text
frontend/
├── public/                         # Logo, icons, favicon, avatars
└── src/
    ├── api.js                      # Legacy/general API helpers
    ├── api/                        # Feature API modules and Axios client
    ├── assets/                     # Images and bundled assets
    ├── components/
    │   ├── analytics/              # Analytics dashboard, pages, and widgets
    │   ├── auth/                   # Login and signup
    │   ├── collaboration/          # Workspace pages and forms
    │   ├── common/                 # Shared navigation/layout components
    │   ├── dashboard/              # Learning dashboard and quick actions
    │   ├── landing/                # Public landing and informational content
    │   ├── notes/                  # Notes list, editor, and viewer
    │   ├── profiles/               # Profile display and editor
    │   ├── qa/                     # Q&A interaction UI
    │   ├── quiz/                   # Quiz-taking and results
    │   ├── roadmap/                # Goal setup and roadmap view
    │   ├── study/                  # PDF library and reader
    │   └── upload/                 # Markdown upload and subject selection
    ├── context/                    # Shared React state/context
    ├── hooks/                      # Reusable hooks, including realtime
    ├── services/                   # Feature service helpers
    ├── styles/                     # Additional styles
    ├── utils/                      # Analytics and roadmap utilities
    ├── App.jsx                     # Screen state, session handling, navigation
    ├── index.css                   # Global styles
    ├── main.jsx                    # React entry point
    └── supabaseClient.js           # Frontend Supabase Auth client
```

### Documentation

The documentation includes project and workflow material in `docs/`, including `Project_module_flow.md`, `study_module.md`, `Roadmap_module.md`, `Analytics_module.md`, profile references in `docs/profiles/`, and collaboration notes in `docs/collaboration/`.

## 5. Feature modules

### Authentication and profile

Login and signup use Supabase Auth. Protected backend endpoints validate the bearer token through the shared authentication dependency. Profile operations derive the profile owner from the authenticated user and fetch or update that user's profile fields and preferences.

### Upload and subject discovery

The upload screen sends Markdown files for ingestion. Backend subject discovery reads subject tag JSON files, while unit discovery reads unit metadata from FAISS. Uploaded source files are kept under the backend uploads directory.

### Q&A

Users can ask a question with an optional subject scope and a general-knowledge setting. The backend retrieves relevant chunks from uploaded materials and the user's notes index, builds context and short chat history, and returns an answer with source metadata and a confidence indicator. The Q&A screen also offers a chat-export action.

### Notes

Users can create, list, view, edit, and delete notes. Notes have subjects, tags, optional URLs, and a 500-word content limit in the service. Markdown note files and database metadata are stored separately. Notes can be ingested into a per-user FAISS index for retrieval.

### Quizzes

Quiz generation selects material for a subject (optionally filtered by unit), asks the language model to produce multiple-choice questions, and returns up to five. Evaluation compares submitted answers, returns results and weak topics, stores quiz records in Supabase, and generates review recommendations from indexed content.

### Roadmaps

Roadmap generation uses subject units and topics from the upload index, a target date, daily study hours, and an optional unit scope. It creates a weekly schedule, tracks topic completion, and supports changing the target date. The roadmap service also attempts to incorporate weak-topic history.

### Study library

The study area supports PDF upload, listing, reading with page navigation, and saving the current page. PDF files are stored in Supabase Storage; metadata and reading progress are held in the database.

### Analytics

The analytics dashboard combines book, note, quiz, roadmap, activity, and weekly-progress data. The frontend organizes it into Overview, Performance, Study, Quiz, Roadmaps, and Reports pages, supported by cards, summaries, trends, and charts.

### Collaboration

Workspace functionality includes workspace creation/listing, invitations, membership and role management, shared notes, messages, activity updates, polls, and tasks with comments. The frontend also subscribes to workspace-message inserts through Supabase Realtime.

## 6. Backend API endpoint catalog

The application defines 66 route handlers. “Protected” means the route requires a valid bearer token; “public” means the route itself has no current-user dependency. `VITE_API_URL` is the frontend's configured backend base URL.

### Health and service checks — `backend/app/main.py`

| Method and path | Access | What it does |
|---|---|---|
| `GET /` | Public | Returns a basic server-online response. |
| `GET /health` | Public | Reports service status and whether the upload vector store is loaded. |

### Q&A — `backend/app/modules/Qa/router.py`

| Method and path | Access | What it does |
|---|---|---|
| `POST /qa/ask` | Protected | Accepts a question, optional subject, and general-knowledge flag; returns answer, sources, context count, and confidence. |

### Quizzes — `backend/app/modules/Quiz/router.py`

| Method and path | Access | What it does |
|---|---|---|
| `POST /quiz/generate-quiz` | Protected | Generates a quiz for a subject; optional `unit_number` narrows the source material. |
| `POST /quiz/evaluate` | Protected | Evaluates submitted quiz answers and returns results, weak topics, and recommendations. |

### Ingestion — `backend/app/modules/Ingestion/router.py`

| Method and path | Access | What it does |
|---|---|---|
| `POST /ingestion/ingest` | Protected | Accepts an uploaded `.md` file, processes Markdown uploads, and reloads the shared vector store. |

### Notes — `backend/app/modules/Notes/router.py`

| Method and path | Access | What it does |
|---|---|---|
| `POST /notes/generate-tags` | Public | Suggests tags for note content and a subject. |
| `POST /notes/fetch-url` | Public | Fetches a webpage title for the supplied URL. |
| `POST /notes/subject-tags` | Public | Returns the subject's available tags. |
| `POST /notes/ingest` | Protected | Ingests the current user's notes into their notes index. |
| `POST /notes` | Protected | Creates a note. Body includes subject, title, content, tags, and optional URLs. |
| `GET /notes` | Protected | Lists the current user's notes; supports optional `subject` and comma-separated `tags` query parameters. |
| `GET /notes/{filename}` | Protected | Returns the content of a named note. |
| `PUT /notes/{filename}` | Protected | Updates a note's title, content, tags, and URLs. |
| `DELETE /notes/{filename}` | Protected | Deletes a note. |

### Roadmaps — `backend/app/modules/Roadmap/router.py`

| Method and path | Access | What it does |
|---|---|---|
| `POST /roadmap` | Protected | Creates a roadmap. Body includes `subject`, `hours_per_day`, `target_date`, `scope`, and optional `unit_number`. |
| `GET /roadmap/{subject}` | Protected | Returns the user's active roadmap for a subject. |
| `DELETE /roadmap/{subject}` | Protected | Deletes the user's roadmap for a subject. |
| `PUT /roadmap/{subject}/extend` | Protected | Updates the roadmap target date using `new_target_date`. |
| `PUT /roadmap/{subject}/complete-topic` | Protected | Marks a topic complete using `week` and `topic_name`. |

### Subjects and uploads — `backend/app/modules/Subjects/router.py`, `backend/app/modules/Uploads/router.py`

| Method and path | Access | What it does |
|---|---|---|
| `GET /subjects` | Public | Lists available subjects from the tag files. |
| `GET /subjects/{subject}/units` | Public | Returns units found in the vector-store metadata for a subject. |
| `GET /uploads` | Public | Lists uploaded Markdown subjects. |
| `GET /uploads/{subject}` | Public | Returns the matching Markdown upload and file metadata. |

### Quiz history — `backend/app/modules/QuizHistory/router.py`

| Method and path | Access | What it does |
|---|---|---|
| `GET /quiz-history` | Public | Returns local JSON quiz history; optional `subject` filters the response. |

### Books — `backend/app/modules/books/router.py`

| Method and path | Access | What it does |
|---|---|---|
| `GET /books/test` | Protected | Tests authenticated access to the books module. |
| `GET /books/public` | Public | Confirms that the books router responds. |
| `POST /books/` | Protected | Uploads a PDF and records book metadata. |
| `GET /books/` | Protected | Lists the current user's books. |
| `GET /books/{book_id}` | Protected | Retrieves one of the user's books and creates a signed file URL. |
| `DELETE /books/{book_id}` | Protected | Deletes a book record and attempts to remove its stored PDF. |
| `PATCH /books/{book_id}/progress` | Protected | Updates the current reading page. |
| `PATCH /books/{book_id}/open` | Protected | Intended to update the last-opened timestamp. |

### Analytics — `backend/app/modules/Analytics/router.py`

| Method and path | Access | What it does |
|---|---|---|
| `GET /analytics/dashboard` | Protected | Returns the combined analytics dashboard payload. |
| `GET /analytics/ping` | Public | Returns a basic backend status message. |

### Profiles — `backend/app/modules/profile/router.py`

| Method and path | Access | What it does |
|---|---|---|
| `GET /profiles/test` | Protected | Tests authenticated profile-module access. |
| `GET /profiles/me` | Protected | Fetches the authenticated user's profile. |
| `PATCH /profiles/me` | Protected | Updates supplied fields on the authenticated user's profile. |

### Collaboration — `backend/app/modules/Collaboration/router.py`

All routes in this section are protected.

| Method and path | What it does |
|---|---|
| `POST /collaboration/workspaces` | Creates a workspace. |
| `GET /collaboration/workspaces` | Lists workspaces the user belongs to. |
| `POST /collaboration/workspaces/{workspace_id}/invitations` | Invites a user by email. |
| `GET /collaboration/invitations` | Lists invitations associated with the user. |
| `POST /collaboration/invitations/{invitation_id}/accept` | Accepts an invitation. |
| `POST /collaboration/invitations/{invitation_id}/reject` | Rejects an invitation. |
| `GET /collaboration/workspaces/{workspace_id}/members` | Lists workspace members. |
| `PATCH /collaboration/workspaces/{workspace_id}/members/{user_id}/role` | Changes a member's role. |
| `DELETE /collaboration/workspaces/{workspace_id}/members/{user_id}` | Removes a member. |
| `POST /collaboration/workspaces/{workspace_id}/resources/notes` | Shares a note into the workspace. |
| `GET /collaboration/workspaces/{workspace_id}/resources` | Lists workspace resources. |
| `DELETE /collaboration/workspaces/{workspace_id}/resources/{resource_id}` | Revokes a shared resource. |
| `GET /collaboration/workspaces/{workspace_id}/resources/{resource_id}/note` | Retrieves a shared note. |
| `POST /collaboration/workspaces/{workspace_id}/messages` | Sends a workspace message. |
| `GET /collaboration/workspaces/{workspace_id}/messages` | Lists messages; supports `limit` and `before` query parameters. |
| `GET /collaboration/workspaces/{workspace_id}/updates` | Lists activity updates; supports `limit` and `after`. |
| `POST /collaboration/workspaces/{workspace_id}/polls` | Creates a poll. |
| `GET /collaboration/workspaces/{workspace_id}/polls` | Lists workspace polls. |
| `GET /collaboration/polls/{poll_id}` | Gets poll details. |
| `POST /collaboration/polls/{poll_id}/vote` | Casts a vote. |
| `PATCH /collaboration/polls/{poll_id}/close` | Closes a poll. |
| `PATCH /collaboration/polls/{poll_id}/pin` | Pins or unpins a poll. |
| `POST /collaboration/workspaces/{workspace_id}/tasks` | Creates a workspace task. |
| `GET /collaboration/workspaces/{workspace_id}/tasks` | Lists workspace tasks. |
| `PATCH /collaboration/tasks/{task_id}` | Updates a task. |
| `POST /collaboration/tasks/{task_id}/comments` | Adds a task comment. |
| `GET /collaboration/tasks/{task_id}/comments` | Lists task comments. |
| `DELETE /collaboration/tasks/{task_id}` | Deletes a task. |

FastAPI's generated API documentation is normally available at `/docs`, `/redoc`, and `/openapi.json` unless disabled by runtime configuration.

## 7. Frontend screens and navigation

The application's screens are conditionally rendered from state in `frontend/src/App.jsx`, rather than being mapped to browser URLs. The app handles session restoration and sign-out, and passes navigation callbacks into feature screens.

| Screen | Purpose |
|---|---|
| Landing | Introduces the product and directs users into sign-in. |
| Login / Signup | Uses Supabase Auth. |
| Dashboard | Presents learning actions and profile-aware navigation. |
| Upload | Uploads Markdown material and selects subjects. |
| Study / Reader | Manages PDF books and reads selected books. |
| Q&A | Asks questions and displays answers and sources. |
| Quiz / Results | Takes a quiz and reviews evaluation output. |
| Notes / Editor / View | Manages personal notes. |
| Goal Setup / Roadmap | Collects roadmap options and shows the generated plan. |
| Analytics | Presents six analytics areas: overview, performance, study, quiz, roadmaps, and reports. |
| Profile / Update Profile | Displays and edits profile details. |
| Collaboration / Workspace | Manages workspaces and their members, resources, messages, polls, and tasks. |

## 8. Configuration and operational dependencies

The backend source reads `COHERE_API_KEY`, `SUPABASE_URL`, and `SUPABASE_SERVICE_KEY`. The frontend expects `VITE_API_URL`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY`. These names indicate required configuration; this document does not include environment values.

The frontend API helpers are not all used in the same way: some screens call the backend directly, while others use shared API modules. That distinction matters for the integration findings below.

## 9. Implementation findings and caveats

These are source-inspection observations, not runtime test results.

1. **Potential Q&A notes-index import mismatch.** The Q&A service imports `get_notes_faiss_path` from `app.modules.Notes.notes`, but the helper appears in `Notes/services.py`, and there is no `Notes/notes.py` in the repository's module listing. This may prevent `/qa/ask` from completing when it loads the user's notes index.

2. **Legacy frontend API paths differ from registered backend routes.** The current Q&A screen calls `/qa/ask`, and the upload screen calls `/ingestion/ingest`, which match the registered routes. Older helpers in `frontend/src/api.js` refer to `/ask` and `/ingest`. Analytics helpers also include `/analytics/{subject}`, but the backend defines `/analytics/dashboard` and `/analytics/ping`, not a subject-specific route. The analytics dashboard itself calls `/analytics/dashboard`.

3. **Quiz-history persistence is split.** Quiz evaluation writes attempts to Supabase, while `GET /quiz-history` reads `backend/analytics/quiz_history.json`. Roadmap weak-topic loading also reads that local JSON file. The database quiz history and local-file history can therefore diverge.

4. **The uploaded-material FAISS index is shared.** Notes indexes are user-specific, but uploaded Markdown files feed a shared index. This differs from a fully user-isolated content model.

5. **Some book operations appear unfinished or inconsistent.** The `update_last_opened` service is currently empty, although the route exists. Book uploads use the `books` storage bucket, while deletion appears to target `_books`; this should be verified against the deployed storage setup.

6. **Some analytics values are placeholders.** The dashboard service returns `study_time: 0` as a placeholder. It also has fallback behavior that can return zeroed overview values when aggregation fails.

7. **Frontend integration uses multiple auth-token patterns.** Some API helpers read the Supabase session, while others read `access_token` from local storage; the login screen writes that value. This means authentication behavior is not centralized in one client/helper across every feature.

8. **Current module docs can describe intended or planned functionality.** For example, feature documentation may describe a storage or endpoint behavior that differs from the current source. Use the actual router and service implementations as the source of truth for current behavior.

The repository README describes the project as actively developing, with ongoing work around data migration and multi-user support. Some module docs describe planned or aspirational behavior, so the code-level notes above are the better guide to current implementation.

## 10. Presentation-ready summary

> RAG_v2 is a modular AI study assistant built with React, FastAPI, Cohere, FAISS, and Supabase. Students can upload learning material, ask questions grounded in that content, create searchable notes, generate and evaluate quizzes, build study roadmaps, read PDF books, monitor learning analytics, and collaborate in shared workspaces. Its central learning loop is material ingestion, retrieval-assisted study, assessment, weak-topic identification, and planning. The application is feature-rich, while some persistence and API integrations remain in transition.
