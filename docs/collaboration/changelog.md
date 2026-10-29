# RAG_v2 — Changelog
**Date: 30 October 2026**

### 1. Profile Module Fixes
- Identified the Pydantic OpenAPI warning caused by `profileResponse` being used as a default parameter value.
- Corrected the `GET /profiles/me` endpoint to use `response_model=profileResponse` and return a single profile object.
- Improved the `PATCH /profiles/me` endpoint with proper request-body validation, partial updates, and missing-profile handling.

### 2. Collaboration Module — Database
- Created five Supabase tables: `workspaces`, `workspace_members`, `workspace_invitations`, `workspace_resources`, and `workspace_messages`.
- Enabled Row Level Security (RLS) and added initial read policies.
- Implemented SQL functions for workspace creation, registered-user invitations, and invitation acceptance/rejection.
- Added workspace-owner membership creation and invitation expiration handling.

### 3. Collaboration Module — Backend APIs
- Integrated the Collaboration router into FastAPI.
- Implemented workspace creation and listing endpoints.
- Implemented invitation creation, listing, acceptance, and rejection endpoints.
- Added backend authentication and invitation error handling.

### 4. Testing and Verification
- Successfully created and listed the **MCA Study Group** workspace.
- Successfully created an invitation for a registered user.
- Verified the recipient could retrieve and accept the invitation.
- Confirmed the accepted invitation added the recipient to the workspace with the `member` role.

### Pending
- Workspace member management and role permissions.
- Shared notes and study materials.
- Workspace chat.
- Collaboration frontend integration.