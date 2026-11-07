# Collaboration Module Documentation

## 1. Overview

The Collaboration module provides workspace-based collaboration for the AI Study Assistant application. It enables users to create shared workspaces, invite members, share study notes, exchange messages, coordinate tasks, conduct polls, and track workspace activity.

Stack: FastAPI (backend), Supabase / PostgreSQL with Row Level Security (data layer), React (frontend), Supabase Realtime (live messaging).

## 2. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         React Frontend                           │
│  CollaborationHub │ WorkspaceOverview │ Workspace* components    │
└───────────────────────────────┬──────────────────────────────────┘
                                │ HTTPS (JSON)
┌───────────────────────────────▼──────────────────────────────────┐
│                       FastAPI Router                             │
│              /collaboration  (all endpoints)                     │
└───────────────────────────────┬──────────────────────────────────┘
                                │ function calls
┌───────────────────────────────▼──────────────────────────────────┐
│                      Service Layer                               │
│   Validation · Error mapping (_rpc_error) · Response shaping     │
└───────────────────────────────┬──────────────────────────────────┘
                                │ supabase-py
┌───────────────────────────────▼──────────────────────────────────┐
│                    Supabase (PostgreSQL)                         │
│  Tables · RLS policies · SECURITY DEFINER RPCs · Triggers        │
│  Storage bucket "notes" · Realtime publication                   │
└──────────────────────────────────────────────────────────────────┘
```

### 2.1 Component Responsibility Matrix

| Layer | Component | File | Responsibility |
|---|---|---|---|
| API | Router | `router.py` | 30 HTTP endpoints under `/collaboration` |
| API | Schemas | `schemas.py` | 20 Pydantic request/response models |
| Domain | Service | `service.py` | Business logic, RPC invocation, error mapping |
| UI | CollaborationHub | `CollaborationHub.jsx` | Workspace list, invitations, creation |
| UI | WorkspaceOverview | `WorkspaceOverview.jsx` | Shell, dashboard, navigation, previews |
| UI | WorkspaceMembers | `WorkspaceMembers.jsx` | Member list, roles, invitations |
| UI | WorkspaceResources | `WorkspaceResources.jsx` | Note sharing and revocation |
| UI | WorkspaceTasks | `WorkspaceTasks.jsx` | Task CRUD and comments |
| UI | WorkspacePolls | `WorkspacePolls.jsx` | Poll lifecycle and voting |
| UI | WorkspaceChat | `WorkspaceChat.jsx` | Real-time messaging |
| UI | WorkspaceActivity | `WorkspaceActivity.jsx` | Paginated activity feed |
| UI | CreateWorkspaceForm | `CreateWorkspaceForm.jsx` | Standalone creation form |

## 3. Endpoint Distribution

The router exposes 30 endpoints across 6 functional groups.

| Group | Endpoint Count | Share |
|---|---:|---:|
| Polls | 7 | 23.3% |
| Tasks | 7 | 23.3% |
| Members | 3 | 10.0% |
| Invitations | 4 | 13.3% |
| Resources | 4 | 13.3% |
| Workspaces | 2 | 6.7% |
| Messages / Updates | 3 | 10.0% |
| **Total** | **30** | **100%** |

| Group | POST | GET | PATCH | DELETE |
|---|---:|---:|---:|---:|
| Workspaces | 1 | 1 | 0 | 0 |
| Invitations | 3 | 1 | 0 | 0 |
| Members | 0 | 1 | 1 | 1 |
| Resources | 1 | 2 | 0 | 1 |
| Messages | 1 | 1 | 0 | 0 |
| Updates | 0 | 1 | 0 | 0 |
| Polls | 2 | 2 | 3 | 0 |
| Tasks | 2 | 2 | 1 | 1 |
| **Total** | **10** | **11** | **5** | **3** |

Reading the matrix: the module is read-heavy for polls and tasks (7 each), and write-heavy in invitations (3 POSTs, no other verbs) because invitation creation, acceptance, and rejection are all action-style POSTs.

## 4. HTTP Status Code Coverage

Status codes produced by the module (explicit `status_code=` declarations plus `_rpc_error` mappings):

| Status | Meaning | Declared on endpoints | Produced by error mapping | Total surfaces |
|---|---:|---:|---:|---:|
| 201 | Created | 6 | 0 | 6 |
| 200 | OK (implicit) | 24 | 0 | 24 |
| 400 | Validation error | 0 | 12 patterns | 12 |
| 403 | Forbidden | 0 | 5 patterns | 5 |
| 404 | Not found | 0 | 2 patterns | 2 |
| 409 | Conflict | 0 | 5 patterns | 5 |
| 500 | Server error | 0 | fallback | all failures |

Created (201) is declared on: create workspace, create invitation, share note, send message, create poll, create task, add task comment — seven declarations appear in the router, of which six are grouped under distinct resource families (task comment is counted with tasks).

## 5. Data Model

### 5.1 Entity Relationship Diagram

```
auth.users
   │
   ├──< workspaces (owner_id)
   │       │
   │       ├──< workspace_members (workspace_id, user_id, role)
   │       ├──< workspace_invitations (workspace_id, invited_by, invited_user_id)
   │       ├──< workspace_resources (workspace_id, resource_owner_id, shared_by)
   │       ├──< workspace_messages (workspace_id, sender_id)
   │       ├──< workspace_activity (workspace_id, actor_id)
   │       ├──< workspace_polls (workspace_id, created_by, resource_id?)
   │       │       │
   │       │       ├──< workspace_poll_options (poll_id)
   │       │       │
   │       │       └──< workspace_poll_votes (poll_id, option_id → options, user_id)
   │       │
   │       └──< workspace_tasks (workspace_id, created_by)   [via RPC layer]
   │               │
   │               └──< workspace_task_comments (task_id, commenter_id)  [via RPC layer]
   │
   └──< notes (user_id) ──referenced by── workspace_resources (resource_id, type=note)
```

Nine tables are explicitly defined in the SQL script: `workspaces`, `workspace_members`, `workspace_invitations`, `workspace_resources`, `workspace_messages`, `workspace_activity`, `workspace_polls`, `workspace_poll_options`, `workspace_poll_votes`. Task tables are managed through RPCs (`create_workspace_task`, `get_workspace_tasks`, etc.) and are not part of the supplied DDL.

### 5.2 Table Summary

| Table | Primary Key | Foreign Keys | Constraints | Indexes |
|---|---|---:|---:|---:|
| workspaces | id | 1 | 0 | 1 |
| workspace_members | (workspace_id, user_id) | 2 | 1 (role check) | 1 |
| workspace_invitations | id | 3 | 3 (status, expiry, pending-unique) | 3 |
| workspace_resources | id | 3 | 2 (type, revoked_at) | 3 |
| workspace_messages | id | 2 | 1 (length) | 1 |
| workspace_activity | id | 2 | 0 | 3 |
| workspace_polls | id | 3 | 3 (question, status, FK) | 1 |
| workspace_poll_options | id | 1 | 2 (length, unique) | 1 |
| workspace_poll_votes | id | 3 | 2 (one-vote, composite FK) | 1 |

Index density (indexes per table):

| Table | Indexes | Notes |
|---|---:|---|
| workspace_activity | 3 | timeline, actor, event-type composite |
| workspace_invitations | 3 | email, workspace, pending-unique partial |
| workspace_resources | 3 | workspace, owner, active-unique partial |
| workspace_polls | 1 | workspace + created_at |
| workspace_messages | 1 | history (workspace, created_at DESC) |
| workspace_poll_options | 1 | poll_id |
| workspace_poll_votes | 1 | poll_id |
| workspace_members | 1 | user_id |
| workspaces | 1 | owner_id |

Total: 16 indexes across 9 tables. The two partial unique indexes (`idx_workspace_invitations_pending`, `idx_workspace_resource_active`) are the concurrency-safety backbone of invitation and resource sharing.

### 5.3 Column Inventory

| Table | Columns | Nullable | Defaulted |
|---|---:|---:|---:|
| workspaces | 6 | 0 | 4 |
| workspace_members | 4 | 0 | 2 |
| workspace_invitations | 10 | 3 | 4 |
| workspace_resources | 10 | 1 | 3 |
| workspace_messages | 5 | 0 | 2 |
| workspace_activity | 8 | 2 | 3 |
| workspace_polls | 11 | 4 | 3 |
| workspace_poll_options | 4 | 0 | 2 |
| workspace_poll_votes | 5 | 0 | 2 |

## 6. Role Permission Matrix

| Action | owner | admin | member |
|---|:---:|:---:|:---:|
| View workspace | ✓ | ✓ | ✓ |
| Invite members | ✓ | ✓ | ✗ |
| Change member role | ✓ | ✗ | ✗ |
| Remove members | ✓ | ✓ (not other admins) | ✗ |
| Remove owner | ✗ | ✗ | ✗ |
| Share own note | ✓ | ✓ | ✓ |
| Revoke any resource | ✓ | ✓ | ✗ |
| Revoke own shared resource | ✓ | ✓ | ✓ |
| Send message | ✓ | ✓ | ✓ |
| Create poll / vote / pin / close | ✓ | ✓ | ✓ |
| Create task | ✓ | ✓ | ✓ |
| Delete task | owner only | owner only | owner only |
| Read activity | ✓ | ✓ | ✓ |

Permission count per role:

| Role | Allowed (of 13) | Denied | Denial share |
|---|---:|---:|---:|
| owner | 12 | 1 | 7.7% |
| admin | 10 | 3 | 23.1% |
| member | 8 | 5 | 38.5% |

The single owner denial is intentional: the owner cannot be removed and their role cannot be changed, which is a self-protection invariant enforced in `remove_workspace_member` and `update_workspace_member_role`.

## 7. RPC Function Catalogue

24 functions are defined, all `SECURITY DEFINER` with `SET search_path = ''`. 23 grant execution to `service_role` only; `is_workspace_member` grants to `authenticated`.

| Function | Returns | Grants To | Domain |
|---|---|---|---|
| create_workspace_with_owner | JSONB | service_role | Workspace |
| invite_registered_user | JSONB | service_role | Invitation |
| respond_to_workspace_invitation | JSONB | service_role | Invitation |
| update_workspace_member_role | JSONB | service_role | Member |
| remove_workspace_member | JSONB | service_role | Member |
| share_workspace_note | JSONB | service_role | Resource |
| revoke_workspace_resource | JSONB | service_role | Resource |
| send_workspace_message | JSONB | service_role | Message |
| get_workspace_messages | JSONB | service_role | Message |
| get_workspace_updates | JSONB | service_role | Activity |
| is_workspace_member | BOOLEAN | authenticated | Security helper |
| create_workspace_poll | JSONB | service_role | Poll |
| get_workspace_polls | JSONB | service_role | Poll |
| get_workspace_poll_details | JSONB | service_role | Poll |
| cast_workspace_poll_vote | JSONB | service_role | Poll |
| close_workspace_poll | JSONB | service_role | Poll |
| set_workspace_poll_pin | JSONB | service_role | Poll |
| create_workspace_task | JSONB | service_role | Task |
| get_workspace_tasks | JSONB | service_role | Task |
| update_workspace_task | JSONB | service_role | Task |
| add_workspace_task_comment | JSONB | service_role | Task |
| get_workspace_task_comments | JSONB | service_role | Task |
| delete_workspace_task | JSONB | service_role | Task |

Functions per domain:

| Domain | Functions | Share |
|---|---:|---:|
| Poll | 6 | 25.0% |
| Task | 6 | 25.0% |
| Message | 2 | 8.3% |
| Resource | 2 | 8.3% |
| Member | 2 | 8.3% |
| Invitation | 2 | 8.3% |
| Workspace | 1 | 4.2% |
| Activity | 1 | 4.2% |
| Security | 2 | 8.3% |
| **Total** | **24** | **100%** |

## 8. Validation Rules

Numeric field bounds across the module:

| Field | Min | Max | Unit | Enforced In |
|---|---:|---:|---|---|
| Workspace name | 1 | 100 | chars | Schema + RPC |
| Workspace description | 0 | 2000 | chars | Schema + RPC |
| Message content | 1 | 4000 | chars | Schema + RPC + table CHECK |
| Poll question | 1 | 300 | chars | Schema + RPC + table CHECK |
| Poll option text | 1 | 200 | chars | RPC + table CHECK |
| Poll option count | 2 | 10 | items | Schema + RPC |
| Task title | 1 | 150 | chars | Schema |
| Task comment | 1 | 2000 | chars | Schema |
| Message page size | 1 | 100 | messages | Router Query + RPC |
| Updates page size | 1 | 100 | updates | Router Query |
| Invitation lifetime | — | 7 | days | Table DEFAULT |

Field-length limits shown as relative scale:

```
workspace name  ██                       100
workspace desc  ████████████████████████ 2000
message content ████████████████████████ 4000
poll question   ██                       300
poll option     █                       200
task title      █                       150
task comment    █████████████           2000
```

## 9. Error Handling

`_rpc_error` parses the raw exception text, extracts the `'message': '...'` fragment with a regex, lowercases it, and matches ordered categories.

| Priority | Category | Patterns | HTTP |
|---:|---|---|---:|
| 1 | Authorization | not authorized · not the task owner · only the task owner · permission denied · not a member of this workspace | 403 |
| 2 | Not found | not found · no registered user found | 404 |
| 3 | Validation | invalid invitation action · poll is closed · poll has expired · no longer accepts votes · option does not belong to poll · invalid poll options · question must · options must · poll expiration · title must · invalid task status · blocker reason · content must | 400 |
| 4 | Conflict | already exists · already a workspace member · cannot invite yourself · pending invitation already exists · invitation is no longer pending | 409 |
| 5 | Fallback | any unmatched | 500 |

Pattern distribution:

| Category | Distinct patterns | Share of 24 |
|---|---:|---:|
| Validation | 12 | 50.0% |
| Authorization | 5 | 20.8% |
| Conflict | 5 | 20.8% |
| Not found | 2 | 8.4% |

Error mapping is priority-ordered, which matters where phrases overlap. For example, "invitation is no longer pending" contains "pending" but is checked in the Conflict group, while "invalid invitation action" is validated as a 400 before any conflict pattern is examined.

Per-endpoint supplementary mappings exist beyond `_rpc_error`: role update adds "owner role cannot be changed" → 400 and "invalid role" → 400; member removal adds "owner cannot be removed" → 400 and "cannot remove other admins" → 403; note sharing adds "note not found or not owned" → 404 and "already shared" → 409; message send adds "message must contain" → 400.

## 10. Database Activity Triggers

| Source Table | Trigger | Events |
|---|---|---|
| workspace_invitations | trg_workspace_invitation_activity | INSERT, UPDATE |
| workspace_members | trg_workspace_member_activity | INSERT, DELETE, UPDATE |
| workspace_messages | trg_workspace_message_activity | INSERT |
| workspace_resources | trg_workspace_resource_activity | INSERT, UPDATE |

Trigger coverage by event:

| Event | Triggers |
|---|---:|
| INSERT | 4 |
| UPDATE | 3 |
| DELETE | 1 |

Activity feed event types consumed by the frontend:

| Event type | Icon | Category |
|---|---|---|
| member_joined | 👤 | Membership |
| message_sent | 💬 | Communication |
| task_created | + | Task |
| task_updated | ↻ | Task |
| task_deleted | − | Task |
| task_comment_added | ✎ | Task |
| resource_shared | — | Resource |
| resource_removed | — | Resource |
| invitation_sent | — | Invitation |
| invitation_accepted | — | Invitation |

## 11. Poll Lifecycle

```
  create_poll
      │
      ▼
   ┌────────┐   cast_vote (any member, one vote each, changes allowed)
   │ active │◄───────────────────────────────────────────────┐
   └───┬────┘                                                │
       │ close_poll                expires_at reached         │
       ▼                           (no writes accepted)      │
   ┌────────┐                                                │
   │ closed │                                                │
   └────────┘                                                │
      ▲  │                                                   │
      └──┴─── pin / unpin (allowed in any state) ────────────┘
```

Poll state validation enforced by `create_workspace_poll`, `cast_workspace_poll_vote`, and `close_workspace_poll`:

| Check | Rejection condition |
|---|---|
| Membership | Caller not in `workspace_members` |
| Question length | Outside 1–300 |
| Option count | Outside 2–10 |
| Option length | Outside 1–200 (each) |
| Expiration | `p_expires_at <= now()` |
| Resource link | Not an active resource in the same workspace |
| Vote: poll state | `status = 'closed'` or expired → "poll is closed" / "poll has expired" / "no longer accepts votes" |
| Vote: option ownership | Option not belonging to poll → 400 |

Vote arithmetic: one row per (poll, user) enforced by `UNIQUE (poll_id, user_id)`; composite FK `(poll_id, option_id) → workspace_poll_options(poll_id, id)` guarantees an option can only be voted on if it belongs to the same poll. Percentages are computed server-side and clamped client-side to 0–100 before bar rendering.

## 12. Pagination Strategy

| Data | Page size | Cursor | Direction | Max |
|---|---:|---|---|---:|
| Messages | 50 | `before` (ISO timestamp, strictly older) | Ascending output | 100 |
| Activity updates | 20 (client) / 50 (default) | `after` (ISO timestamp) | Descending output | 100 |

```text
Timeline ────────────────────────────────────────────────────────►
                            [ newest ]
Messages:        ◄── p_before ── [ page of 50 ] ◄── p_before ── ...
Updates:         [ newest page ] ── p_after ──► [ older page ] ...
```

Behavioral notes:

- Chat paginates backwards from the newest message; on older-page load the client preserves scroll position using `scrollHeight` delta in `requestAnimationFrame`.
- Activity paginates using the oldest currently loaded `created_at` as the next cursor and prepends deduplicated pages.
- Messages: `has_more` is inferred client-side as `length === 50`; updates: `has_more` is returned server-side.

## 13. Frontend Data Flow

### 13.1 Dashboard Loading (WorkspaceOverview)

Six requests are issued concurrently via `Promise.allSettled`:

| # | Endpoint | Feeds |
|---:|---|---|
| 1 | GET members | Members card, summary count, member preview |
| 2 | GET resources | Summary count, resources preview |
| 3 | GET tasks | Open-task count, recent tasks preview |
| 4 | GET polls | Active-poll count, right-rail poll preview |
| 5 | GET updates (limit 5) | Recent activity preview |
| 6 | GET messages (limit 5) | Right-rail message preview |

Failure isolation: each result is independent. Any rejected promise sets a non-blocking banner (`some workspace information could not be loaded`) while populated sections still render; `getList` normalizes array vs. `{key: []}` response shapes.

Derived counts:

- Open tasks = tasks where `status ∉ {completed, cancelled}`
- Active polls = polls where `status = active`

Reload trigger: the effect depends on `[workspace.id, activeSection]`, so navigating sections refreshes dashboard previews.

### 13.2 Chat Real-time Path

```
send_workspace_message (POST) ──► DB INSERT ──► trigger: activity row
                                          │
                                          └─► Realtime publication
                                                   │
                                    useWorkspaceRealtime(workspace.id)
                                                   │
                                              addMessage()  (dedupe by id)
                                                   │
                                             auto scroll-to-bottom
```

The sender also refetches the latest 50 messages after a successful POST, so the sender's view is authoritative even if the realtime event is delayed or dropped.

### 13.3 Profile Resolution

Three components resolve user profiles lazily against the `profiles` table:

| Component | Trigger | Fields |
|---|---|---|
| WorkspaceChat | New sender IDs appear | display_name, username, avatar_url |
| WorkspaceActivity | New actor IDs appear | display_name, username, avatar_url |
| WorkspaceMembers | Via `/members` endpoint | display_name, username, avatar_url |

Chat and Activity fetch profiles client-side with an `in("id", ids)` query, skip IDs already cached in state, and guard against unmounted-component races with a `cancelled` flag.

## 14. Security Model

### 14.1 Layered Enforcement

| Layer | Control | Scope |
|---|---|---|
| 1 | `get_current_user` dependency | All endpoints require authentication |
| 2 | Service-level checks | Membership lookup before listing members, resources, shared note |
| 3 | RPC validation | Role checks, ownership checks, state checks inside SECURITY DEFINER functions |
| 4 | RLS SELECT policies | Direct table reads limited to workspace members |
| 5 | Function grants | Write RPCs executable only by `service_role` |
| 6 | Storage path scoping | Shared note download keyed by original owner's folder |

### 14.2 Function Grant Summary

| Grantee | Functions |
|---|---:|
| service_role | 23 |
| authenticated | 1 (is_workspace_member) |
| anon | 0 |
| public | 0 |

### 14.3 RLS Policy Map

| Table | RLS Enabled | SELECT Policy | Write Access |
|---|---|---|---|
| workspaces | — | Members can view workspaces | RPC only |
| workspace_members | — | Members can view workspace members | RPC only |
| workspace_invitations | — | Inviter or recipient can view invitations | RPC only |
| workspace_resources | — | Members can view shared resources | RPC only |
| workspace_messages | — | Members can read messages | RPC only |
| workspace_activity | ✓ | Workspace members can read activity | Trigger writes |
| workspace_polls | ✓ | Workspace members can read polls | RPC only |
| workspace_poll_options | ✓ | Workspace members can read poll options | RPC only |
| workspace_poll_votes | ✓ | Workspace members can read poll votes | RPC only |

Read-only exposure: `authenticated` holds SELECT on `workspace_messages`, `workspace_activity`, `workspace_polls`, `workspace_poll_options`, `workspace_poll_votes`; `anon` is revoked from the poll and activity tables entirely.

### 14.4 Invitation Integrity

| Rule | Mechanism |
|---|---|
| No duplicate pending invite per email | Partial unique index on (workspace_id, lower(invited_email)) WHERE status = 'pending' |
| Invitee must exist | Email resolved against `auth.users` in RPC |
| No self-invite | RPC equality check on inviter/recipient |
| No re-invite of members | RPC existence check on `workspace_members` |
| Expiry | DEFAULT now() + 7 days; response attempt past expiry marks row `expired` |
| Atomic accept | `respond_to_invitation` uses `SELECT ... FOR UPDATE`, then inserts membership with `ON CONFLICT DO NOTHING` |

## 15. Concurrency and Atomicity

Row locking (`FOR UPDATE`) is used in the functions that mutate shared membership and resource state:

| Function | Locked rows | Purpose |
|---|---|---|
| respond_to_workspace_invitation | invitation row | Prevents double-accept |
| remove_workspace_member | actor membership, target membership | Consistent role hierarchy check under concurrent removals |
| revoke_workspace_resource | resource row | Prevents double revocation |

Additional atomicity guarantees: workspace creation + owner enrollment occur in a single function body; poll creation + option insertion occur in one function; invitation acceptance inserts membership and updates the invitation in one transaction.

## 16. Schema Coverage Map

| Endpoint Family | Request Schema | Response Schema | Service Function | RPC / Table |
|---|---|---|---|---|
| Workspaces | WorkspaceCreate | (raw row) | create_workspace, list_workspaces | create_workspace_with_owner / tables |
| Invitations | WorkspaceInvite | (raw row) | create_invitation, list_invitations, respond_to_invitation | invite_registered_user, respond_to_workspace_invitation / table |
| Members | WorkspaceRoleUpdate | WorkspaceMemberResponse[] | list_workspace_members, update_workspace_member_role, remove_workspace_member | RPC + tables |
| Resources | WorkspaceNoteShare | SharedNoteResponse | share_workspace_note, list_workspace_resources, revoke_workspace_resource, get_shared_note | RPC + storage |
| Messages | WorkspaceMessageCreate | WorkspaceMessageResponse | send_workspace_message, get_workspace_messages | RPC |
| Updates | — | WorkspaceUpdateResponse | get_workspace_updates | RPC |
| Polls | CreatePollRequest, CastPollVoteRequest, PinPollRequest | PollResponse, PollListResponse, PollDetailsResponse | 6 functions | 6 RPCs + 3 tables |
| Tasks | CreateWorkspaceTaskRequest, UpdateWorkspaceTaskRequest, CreateTaskCommentRequest | WorkspaceTaskListResponse, TaskCommentsResponse | 7 functions | 6 RPCs |

Schema utilization: `WorkspaceMessageResponse` and `SharedNoteResponse` are defined but the router returns raw service data at those endpoints; they document the intended payload shape.

## 17. UI Component Interaction Graph

```
CollaborationHub
   ├─ onOpenWorkspace(workspace) ─────────────► WorkspaceOverview
   │                                               ├─ Overview dashboard (6 parallel fetches)
   │                                               ├─ Resources ─► WorkspaceResources ─► SharedNoteViewer
   │                                               ├─ Tasks ────► WorkspaceTasks
   │                                               ├─ Polls ────► WorkspacePolls
   │                                               ├─ Activity ─► WorkspaceActivity
   │                                               ├─ Members ──► WorkspaceMembers ─► InviteMemberForm
   │                                               └─ Messages ─► WorkspaceChat ─► useWorkspaceRealtime
   └─ CreateWorkspaceForm (inline variant)
```

Shared utilities:

| Utility | Used By | Purpose |
|---|---|---|
| formatDate / formatTime | Overview, Activity, Chat, Tasks, Polls | Consistent timestamp rendering; today's times shown as HH:MM |
| UserInfo | Chat, Tasks | Avatar + display name + @username chip |
| SectionHeader / PreviewCard / EmptyMessage | Overview | Consistent preview block structure |
| getActorName / getMemberName | Overview | Profile field fallback chain |

## 18. Known Constraints

1. The SQL script opens with a table named `workplace` but all subsequent DDL and application code use `workspaces`; `workspaces` is authoritative.
2. `workspace_resources.resource_type` permits `note` and `material`; only `note` is exercised by the frontend in this version.
3. `list_invitations` accepts a `user_email` argument but does not filter on it; the RLS SELECT policy provides the actual visibility restriction.
4. Task and task-comment tables are not present in the supplied DDL; their behavior is fully encapsulated in the task RPCs.
5. Tasks, polls, resources, and members are returned unpaginated; pagination exists only for messages and activity.
6. `WorkspaceOverview` reloads all dashboard data on every section navigation, favoring freshness over request volume.
7. Poll percentage bars clamp server values to [0, 100] defensively before width calculation.
8. Note content is downloaded synchronously from the `notes` bucket during `GET .../resources/{id}/note`; large notes will increase response latency proportional to file size.