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

# Changelog — 2026-11-13

## Collaboration Module — Reference-in-Chat Feature

### Backend (SQL)
- Added `metadata jsonb NOT NULL DEFAULT '{}'` column to `workspace_messages`
- Added partial index `idx_workspace_messages_referenced` for lookups by `metadata->>'referenced_id'`
- Replaced `send_workspace_message` RPC (dropped old 3-arg, created new 5-arg) — accepts optional `p_referenced_type` and `p_referenced_id`, validates entity exists in the same workspace, stores reference in `metadata`
- Updated `get_workspace_messages` RPC to return `metadata` on each message
- Validation supports four entity types: `task`, `poll`, `note`, `material`

### Backend (Python)
- `schemas.py` — extended `WorkspaceMessageCreate` with `referenced_type: Optional[Literal[...]]` and `referenced_id: Optional[UUID]`; extended `WorkspaceMessageResponse` with `metadata: dict`
- `router.py` — `send_workspace_message_endpoint` now forwards `payload.referenced_type` and `payload.referenced_id` to the service (this was the final missing piece)
- `service.py` — `send_workspace_message` extended with two optional kwargs; RPC call now includes `p_referenced_type` and `p_referenced_id`; added four new error patterns for reference validation → 400 `Invalid reference on message.`
- Fixed stale import in `Qa/services.py` (`Notes.notes` → `Notes.services`) after Notes refactor
- Created `__init__.py` in `Notes/` and `Qa/` packages (fixes intermittent `ModuleNotFoundError`)

### Frontend
- New `ReferenceChip.jsx` — renders `[📋 Task: title]` / `[📊 Poll: question]` / `[📄 Note: title]` / `[📁 File: filename]` above messages; clickable when entity exists, muted `[⚠ ... deleted]` when it doesn't; resolves titles lazily per type
- `WorkspaceChat.jsx` — accepts `pendingReference`, `onClearPendingReference`, `onOpenReference` props; renders a "Replying about: …" chip above the composer when attaching; sends reference in `sendWorkspaceMessage`; renders message chips; clears reference after successful send
- `WorkspaceTasks.jsx` — `onAskInChat` prop + "Ask in chat" button per task card
- `WorkspacePolls.jsx` — `onAskInChat` prop + "Ask in chat" button per poll card
- `WorkspaceResources.jsx` — `onAskInChat` prop + "Ask in chat" button per resource card, with type dispatch (`note` vs `material`)
- `WorkspaceOverview.jsx` — new `pendingChatReference` state; `openChatWithReference` sets reference and navigates to Messages; `handleOpenReference` navigates back to the correct section when a chip is clicked; wired to all four child components
- `collaborationApi.js` — `sendWorkspaceMessage` extended to accept `referencedType` and `referencedId` (previously 2-arg, silently dropped references)

### Behaviour
- Any workspace member can click "Ask in chat" on a task, poll, note, or material
- Land on Messages with a pre-attached reference chip above the composer
- Type a question → send → message stores `metadata.referenced_type` + `metadata.referenced_id`
- Chip renders above the sent message; clicking it navigates back to the referenced entity's section
- Deleted references render as muted chips, message text preserved
- Plain messages (no reference) behave identically to before — no regression

### Testing verified
- SQL direct calls: plain message stores `{}`, referenced message stores the metadata correctly, cross-workspace reference rejected with 400
- Postman: message with task reference returns 201 with populated metadata
- Frontend end-to-end: click from all four entity types → chip appears → send → chip renders → click navigates back

### Known follow-ups (not blocking)
- Deleted entity chips currently show "…deleted" but the exact-title-before-deletion isn't preserved — could be added by storing a `title_snapshot` in metadata at send time
- No mention of references in the activity feed yet — the trigger's payload could include `referenced_type`/`referenced_id` for richer activity entries
- Reference lookup in `ReferenceChip` fetches per chip; a shared title cache would reduce calls if usage grows
- `@mentions` (second half of the original feature request) not started — same `metadata` column can host `mentioned_user_ids`

### Session effort
- 3 diagnostics that surfaced real bugs (missing RPC replacement, dropped fields in router/service, stale API client signature)
- ~200 lines net change across 8 files (2 SQL RPCs, 3 Python files, 6 JSX files, 1 API client)