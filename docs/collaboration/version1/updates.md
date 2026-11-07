## 0. Summary Table

| # | Area | Severity | Effort |
|---:|---|---|---|
| 1 | `_rpc_error` missing 11 patterns | 🔴 | 30 min |
| 2 | `update_workspace_member_role` wrong status (404→403) | 🔴 | 5 min |
| 3 | `get_workspace_updates` pagination direction | 🔴 | Verify + 15 min |
| 4 | `get_workspace_updates` `has_more` full count | 🟡 | 10 min |
| 5 | Consolidate per-function error handlers into `_rpc_error` | 🟠 | 1–2 h |
| 6 | `share_workspace_note` race on partial unique index | 🟠 | 20 min (SQL) |
| 7 | `get_workspace_messages` route validation | 🟠 | 5 min |
| 8 | Member RPC lock ordering (deadlock) | 🟠 | 20 min (SQL) |
| 9 | `respond_to_workspace_invitation` inconsistent response shape | 🟠 | 15 min (SQL) |
| 10 | `get_workspace_poll_details` N+1 subqueries | 🟡 | 30 min (SQL) |
| 11 | Unpaginated task/poll/comment lists | 🟡 | 1 h (SQL) |
| 12 | `update_workspace_task` cannot clear `description`/`due_date` | 🟠 | Design + 30 min |
| 13 | `_rpc_error` regex fragile + leaks traceback | 🔴 | 30 min |
| 14 | `get_shared_note` filename / size / decode | 🟠 | 20 min |
| 15 | `list_workspace_members` full scan + dead branch | 🟡 | 15 min |
| 16 | Narrow `select("*")` in list queries | 🔵 | 20 min |
| 17 | Missing `response_model` declarations | 🔵 | 1 h |
| 18 | Unused imports / duplicate imports | 🔵 | 5 min |
| 19 | Missing type annotations on service `payload` params | 🔵 | 15 min |
| 20 | `print()` in `get_shared_note` → logger | 🔵 | 5 min |
