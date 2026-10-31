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

**Date:** 1 November 2026  
**Module:** Collaboration / Workspace Backend  
**Scope:** Database, FastAPI services, APIs, SQL functions, and backend testing

## 1. Workspace Management

### Added
- Implemented workspace creation.
- Added workspace listing for authenticated users.
- Added workspace ownership management.
- Implemented workspace membership tracking.
- Added workspace member listing.
- Implemented member role management with three roles:
  - Owner
  - Admin
  - Member
- Added functionality to promote, change roles, and remove workspace members.
- Added membership validation to protected workspace operations.

### Database
- Implemented `workspaces` table.
- Implemented `workspace_members` table.
- Added database functions:
  - `create_workspace_with_owner`
  - `is_workspace_member`
  - `update_workspace_member_role`
  - `remove_workspace_member`

## 2. Workspace Invitations

### Added
- Implemented invitation of registered users to workspaces.
- Added invitation tracking using email and user ID.
- Implemented invitation acceptance and rejection.
- Added invitation status management.
- Added invitation expiration support.
- Added validation to prevent duplicate pending invitations and self-invitations.

### Database Functions
- `invite_registered_user`
- `respond_to_workspace_invitation`

### Database
- Implemented `workspace_invitations` table.

## 3. Workspace Messaging

### Added
- Implemented workspace group messaging.
- Added authenticated message submission.
- Implemented message retrieval for workspace members.
- Added chronological message history.
- Added workspace membership validation before accessing or sending messages.
- Integrated message activity tracking.

### Database
- Implemented `workspace_messages` table.
- Added database functions:
  - `send_workspace_message`
  - `get_workspace_messages`
- Configured Supabase Realtime publication for `workspace_messages`.
- Added RLS SELECT policy allowing authenticated workspace members to read messages.

**Note:** Backend messaging and Realtime database configuration are implemented. Frontend Realtime subscriptions and chat UI are pending.

## 4. Workspace Resources & Notes Sharing

### Added
- Implemented workspace resource sharing.
- Added support for sharing existing notes with workspace members.
- Added resource ownership tracking.
- Added resource-sharing metadata.
- Implemented workspace resource listing.
- Added resource revocation functionality.
- Added validation to ensure resources belong to the correct workspace.
- Added protection against sharing or accessing resources without workspace membership.

### Resource Types
- Notes
- Materials (supported as a resource type; a separate materials module/table is not implemented yet).

### Database
- Implemented `workspace_resources` table.
- Added database function:
  - `share_workspace_note`
  - `revoke_workspace_resource`

**Important:** Resources are references to existing user-owned content, rather than duplicated copies of the original notes.

## 5. Workspace Activity & Updates

### Added
- Implemented a unified workspace activity log.
- Added automatic activity tracking through PostgreSQL triggers.
- Implemented workspace update retrieval.
- Added timestamp-based update polling.
- Added pagination/limit support.
- Added `has_more` information in update responses.
- Restricted activity retrieval to workspace members.

### Automatically Tracked Events
- Messages sent.
- Members joined.
- Member roles changed.
- Members removed.
- Resources shared.
- Resources revoked.
- Invitations created and updated.

### Database
- Implemented `workspace_activity` table.
- Added indexes for activity retrieval.
- Added RLS SELECT policy for workspace members.
- Added triggers:
  - `trg_workspace_message_activity`
  - `trg_workspace_member_activity`
  - `trg_workspace_resource_activity`
  - `trg_workspace_invitation_activity`

### Database Function
- `get_workspace_updates`

### API
`GET /collaboration/workspaces/{workspace_id}/updates`

**Note:** Activity retrieval currently uses timestamp-based polling. Automatic frontend updates and more advanced cursor-based synchronization are not implemented.

## 6. Polls & Voting System

### Added
- Implemented workspace poll creation.
- Added question and description support.
- Added 2–10 options per poll.
- Added optional expiration timestamps.
- Added optional attachment of existing shared workspace resources.
- Implemented poll listing and individual poll details.
- Added total vote counts.
- Added individual option vote counts and percentages.
- Added current user's vote identification.
- Implemented vote submission.
- Implemented vote modification while a poll is active.
- Enforced one vote per user per poll.
- Added poll closing.
- Added authorization for poll creators and workspace owners/admins to close polls.
- Added poll pinning and unpinning.
- Restricted pinning to workspace owners and admins.
- Prevented voting on closed or expired polls.

### Database
Created:
- `workspace_polls`
- `workspace_poll_options`
- `workspace_poll_votes`

Added constraints, indexes, foreign keys, and RLS policies.

### Database Functions
- `create_workspace_poll`
- `cast_workspace_poll_vote`
- `get_workspace_polls`
- `get_workspace_poll_details`
- `close_workspace_poll`
- `set_workspace_poll_pin`

### API Endpoints

| Method | Endpoint | Function |
|---|---|---|
| POST | `/collaboration/workspaces/{workspace_id}/polls` | Create poll |
| GET | `/collaboration/workspaces/{workspace_id}/polls` | List polls |
| GET | `/collaboration/polls/{poll_id}` | Get poll details |
| POST | `/collaboration/polls/{poll_id}/vote` | Submit/change vote |
| PATCH | `/collaboration/polls/{poll_id}/close` | Close poll |
| PATCH | `/collaboration/polls/{poll_id}/pin` | Pin/unpin poll |

## 7. API Architecture & Security

### Added
- Integrated collaboration routes into the main FastAPI application.
- Implemented service-layer functions for database operations.
- Added Pydantic request schemas and validation.
- Integrated Supabase RPC functions with the backend.
- Added authenticated user identification using the existing authentication dependency.
- Added centralized RPC error handling through `_rpc_error()`.
- Added HTTP status mapping for authorization, missing resources, conflicts, and validation errors.

### Security
- Used the Supabase service-role client exclusively on the backend.
- Kept service-role credentials away from the frontend.
- Enforced workspace membership checks inside database functions.
- Enabled Row Level Security on collaboration tables.
- Restricted direct client-side write permissions.
- Added role-based authorization for administrative operations.

## 8. Testing & Verification

The following functionality has been tested through FastAPI Swagger:

| Feature | Status |
|---|---|
| Workspace creation and listing | Tested |
| Workspace invitations | Tested |
| Invitation acceptance | Tested |
| Workspace member listing | Tested |
| Member role updates | Tested |
| Member removal | Tested |
| Workspace messaging | Tested |
| Message retrieval | Tested |
| Note sharing | Tested |
| Resource listing | Tested |
| Resource revocation | Tested |
| Automatic activity logging | Tested |
| Workspace updates retrieval | Tested |
| Poll creation | Tested |
| Poll listing | Tested |
| Poll details and results | Tested |
| Vote submission | Tested |
| Changing an existing vote | Tested |
| Poll closure | Tested |
| Rejecting votes on closed polls | Tested |
| Poll pinning | Tested |

## 9. Pending Work

The following items remain outside the completed backend scope:

- Frontend workspace management UI.
- Frontend group chat interface.
- Frontend Supabase Realtime subscriptions.
- Frontend resource-sharing interface.
- Frontend activity/update integration.
- Frontend poll creation and voting interface.
- Testing resource attachment to polls.
- Testing permissions with a regular workspace member across all operations.
- Integrating poll events into the unified workspace activity log.
- Improving timestamp-based activity pagination.
- Handling automatic poll expiration/status transitions.
- Final consistency review of API responses and error messages.

## Overall Progress

**Collaboration Backend V1 — Core implementation completed.**

The backend now supports workspace management, invitations, membership and roles, group messaging, resource sharing, notes sharing, activity tracking, update retrieval, and polls with voting.

The next major development stage is frontend integration, after completing the remaining backend verification and cleanup.