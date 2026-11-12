## 0. Summary Table

| # | Area | Severity | Effort | Status |
|---:|---|---|---|---|
| 1 | `_rpc_error` missing 11 patterns | 🔴 | 30 min | ✅ done |
| 2 | `update_workspace_member_role` wrong status (404→403) | 🔴 | 5 min | ✅ done (folded into #1) |
| 3 | `get_workspace_updates` pagination direction | 🔴 | Verify + 15 min | ⏳ pending |
| 4 | `get_workspace_updates` `has_more` full count | 🟡 | 10 min | ⏳ pending |
| 5 | Consolidate per-function error handlers into `_rpc_error` | 🟠 | 1–2 h | ⏳ pending (partially handled by #1) |
| 6 | `share_workspace_note` race on partial unique index | 🟠 | 20 min (SQL) | ⏳ pending |
| 7 | `get_workspace_messages` route validation | 🟠 | 5 min | ⏳ pending |
| 8 | Member RPC lock ordering (deadlock) | 🟠 | 20 min (SQL) | ⏳ pending |
| 9 | `respond_to_workspace_invitation` inconsistent response shape | 🟠 | 15 min (SQL) | ⏳ pending |
| 10 | `get_workspace_poll_details` N+1 subqueries | 🟡 | 30 min (SQL) | ⏳ pending |
| 11 | Unpaginated task/poll/comment lists | 🟡 | 1 h (SQL) | ⏳ pending |
| 12 | `update_workspace_task` cannot clear `description`/`due_date` | 🟠 | Design + 30 min | ⏳ pending |
| 13 | `_rpc_error` regex fragile + leaks traceback | 🔴 | 30 min | ✅ done (tolerant extraction + 409 detail masked) |
| 14 | `get_shared_note` filename / size / decode | 🟠 | 20 min | ⏳ pending |
| 15 | `list_workspace_members` full scan + dead branch | 🟡 | 15 min | ⏳ pending |
| 16 | Narrow `select("*")` in list queries | 🔵 | 20 min | ⏳ pending |
| 17 | Missing `response_model` declarations | 🔵 | 1 h | ⏳ pending |
| 18 | Unused imports / duplicate imports | 🔵 | 5 min | ⏳ pending |
| 19 | Missing type annotations on service `payload` params | 🔵 | 15 min | ⏳ pending |
| 20 | `print()` in `get_shared_note` → logger | 🔵 | 5 min | ⏳ pending |


## 2026-11-12 — Collaboration module

### Backend
- Fixed `_rpc_error` mapping: added 11 missing RPC error patterns (7 to correct 4xx statuses); 7/7 unit tests passing.  
  Covers items **#1, #2, #13** above.
- Added multi-format resource sharing: PDF / DOCX / TXT / Markdown / images.  
  - New `workspace_resources` bucket (private, 25 MB cap, MIME whitelist).  
  - `share_workspace_file` (upload + DB insert with rollback).  
  - `get_shared_resource` (unified notes + files, signed URL, 1 hr TTL).  
  - Sharer attribution in `list_workspace_resources` via `profiles` lookup.
- Created missing `__init__.py` for `Notes` and `Qa` packages (fixes intermittent `ModuleNotFoundError`).
- Fixed stale import in `Qa/services.py` after `Notes` module refactor (`Notes.notes` → `Notes.services`).

### Frontend — Collaboration
- New `ResourceViewer.jsx` — inline rendering for images, PDF, DOCX, Markdown, TXT.
- `WorkspaceResources.jsx`: file upload button + owner/admin/sharer-gated delete, sharer name display, MIME + size hint.
- `WorkspaceTasks.jsx`: owner-only edit/delete, status dropdown corrected to backend valid set (`todo`, `in_progress`, `on_hold`, `completed`); removed non-existent `blocked`.
- `WorkspacePolls.jsx`: pin button restricted to admin/owner; close button restricted to creator/admin/owner (matches RPC rules).
- `WorkspaceChat.jsx`: reliable scroll restoration after loading older messages (via `useLayoutEffect`); optimistic send using returned row instead of full refetch.
- `SharedNoteViewer.jsx`: Markdown now renders via `react-markdown` with YAML frontmatter stripped.

### Frontend — Cross-app
- Subject selection persists across refreshes via `localStorage` (`hero:selected-subject:{userId}`) in `Dashboard`, `HeroSection`, `UploadScreen`, `NotesScreen`, `GoalSetupScreen`.
- `RoadmapScreen.jsx`: "No Roadmap Found" state now redirects to setup instead of showing a card.

### Cleanup
- `.gitignore`: removed stray backtick in `*.py.class` pattern; added `venv/`, `__pycache__/`, IDE files, `.env.*` variants.