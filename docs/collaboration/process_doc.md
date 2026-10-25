## Implementation and Technical Design Document

**Project:** RAG_v2 — AI Study Companion  
**Module:** Workspace Collaboration  
**Status:** Proposed implementation plan; codebase and database audit required before implementation  
**Document purpose:** Define the architecture, database design, authorization model, API contract, frontend integration, workspace-aware RAG behavior, implementation sequence, testing strategy, and deployment considerations for adding collaboration to the existing application.

---

## 1. Executive Summary

The collaboration module will let users create workspaces, invite other users, share selected study documents, discuss material in a shared conversation, and use workspace-scoped AI retrieval. It must extend the existing RAG_v2 application rather than replace or disrupt its personal study flow.

The current application uses React with Vite on the frontend, FastAPI on the backend, Supabase for authentication and PostgreSQL, Supabase Storage for supported files, FAISS for vector retrieval, and Cohere for embeddings and model-related functionality. The application is deployed using Vercel, Render, and Supabase.

The collaboration feature should reuse the current authentication and service layers where possible. Supabase Realtime can support live updates for messages and workspace activity, avoiding a separate Socket.IO service for the initial implementation. FastAPI remains responsible for authorization, validation, business rules, and AI orchestration.

The central security rule is that a workspace must only retrieve documents explicitly shared with that workspace, and only for users who are currently authorized members. A document remains owned by its original user; sharing it does not create a second document copy or transfer ownership.

Implementation must begin with a codebase and data-flow audit. The exact current database schema, document-storage layout, chunk metadata, FAISS index lifecycle, authentication dependencies, and RAG service interfaces must be confirmed before selecting the final indexing and retrieval strategy.

## 2. Goals and Non-Goals

### 2.1 Goals

The module should support:

- Creating and editing a workspace.
- Listing workspaces available to the signed-in user.
- Managing workspace membership and roles.
- Inviting existing users or allowing invitees to accept invitations through a secure flow.
- Accepting or rejecting invitations and revoking pending invitations.
- Sharing specific existing documents with a workspace.
- Revoking a document's workspace access.
- Maintaining workspace-specific conversations and message history.
- Retrieving context only from documents explicitly shared with the active workspace.
- Enforcing access control in FastAPI and the database layer where applicable.
- Showing useful activity and membership updates to authorized members.
- Preserving the existing personal RAG experience and personal document permissions.
- Supporting small study documents, with typical documents expected to be under approximately 10 MB.
- Supporting future MCP integration without making MCP a prerequisite for collaboration.

### 2.2 Non-goals for the initial release

The first version should not include:

- Real-time collaborative editing of the same document.
- Copying shared documents into another user's storage.
- Publicly discoverable workspaces.
- Anonymous workspace access.
- A separate Socket.IO server.
- A separate vector database unless the audit shows it is necessary.
- Cross-workspace retrieval.
- Automatic access to all documents owned by every workspace member.
- AI tools that can modify workspace data without explicit authorization and appropriate safeguards.
- MCP integration as part of the initial collaboration release.

These exclusions keep the initial scope focused on shared study, secure document access, and workspace-specific AI assistance.

## 3. Existing Application Context

The planned integration uses the following existing components:

| Component | Current role | Collaboration role |
|---|---|---|
| React + Vite | Frontend application | Workspace screens, invitations, members, shared resources, chat |
| FastAPI | Backend API and orchestration | Workspace APIs, authorization, shared retrieval, AI chat |
| Supabase Auth | User authentication | Identity for workspace membership and invitation acceptance |
| Supabase PostgreSQL | Application data | Workspace, membership, invitation, resource, message, and activity records |
| Supabase Storage | Uploaded files | Keep existing document objects in their current storage locations |
| FAISS | Vector retrieval | Reuse only after confirming current index and metadata architecture |
| Cohere | Embeddings and existing model integration | Reuse compatible embedding behavior for shared-document retrieval |
| Supabase Realtime | Noted as the preferred live-update option | Subscribe to authorized message and activity changes |
| Vercel and Render | Current deployment | Deploy frontend and backend changes through existing services |

The profile module is considered functional. Its visual polish is separate from the collaboration work and should not block this module. Profile fields may be used to display member names and avatars, but authorization must rely on authenticated user IDs and membership records, not display names or avatar URLs.

## 4. Mandatory Codebase Audit Before Coding

Do not begin by creating tables or implementing endpoints based only on this document. First inspect the current project and document the findings.

### 4.1 Authentication

Review:

- `backend/app/core/auth.py`
- `backend/app/main.py`
- Existing route dependencies that validate Supabase access tokens.
- How the authenticated user's UUID is exposed to routers and services.
- Whether the backend verifies JWT signatures and relevant claims correctly.
- How the frontend obtains and sends the current access token.
- Token expiration and unauthorized-response handling.

All collaboration endpoints must derive the acting user's identity from verified authentication. Never accept a client-supplied `user_id` as proof of identity.

### 4.2 Current document flow

Trace the complete path for a personal document:

1. Frontend upload request.
2. FastAPI upload endpoint.
3. Storage path and object metadata.
4. Database record creation.
5. Text extraction and chunking.
6. Embedding generation.
7. FAISS indexing.
8. Metadata associated with each vector.
9. Retrieval query.
10. Context construction and model call.
11. Document deletion and index cleanup.

Record the actual table names, object path conventions, chunk IDs, owner IDs, and index persistence mechanism. Do not assume that document content, chunks, or vector metadata are stored in a particular table until verified.

### 4.3 RAG service boundaries

Identify the reusable functions or services for:

- Loading and validating a document.
- Chunking and embedding.
- Searching the user's existing documents.
- Constructing model context.
- Generating an answer.
- Managing FAISS index state.
- Handling per-user indexes or metadata filters.

Prefer extracting reusable service functions over duplicating the personal RAG pipeline. Personal retrieval and workspace retrieval should share reliable low-level logic while enforcing different, explicit authorization scopes.

### 4.4 Database and storage audit

Inspect the live Supabase schema and existing RLS policies for all relevant tables. Confirm:

- User and profile foreign keys.
- Document metadata tables and ownership columns.
- Storage buckets and object naming.
- Current RLS policies.
- Whether the backend uses a Supabase service-role client.
- Existing migrations or SQL scripts.
- Existing indexes and constraints.

The service-role client bypasses RLS. If it is used by FastAPI, every operation must still enforce user and workspace authorization in backend code. RLS should be treated as an additional protection layer, not a replacement for application authorization.

### 4.5 Audit deliverable

Before implementation, write a short architecture note recording the confirmed names and interfaces of the current tables, routers, services, storage paths, and retrieval components. Identify gaps and choose the vector strategy only after this audit.

## 5. Architecture

### 5.1 High-level request flow

A typical workspace question should follow this sequence:

1. The user opens a workspace and submits a question.
2. The frontend sends the workspace ID, message, and valid access token to FastAPI.
3. FastAPI validates the token and derives the authenticated user ID.
4. The backend verifies that the user is an active member of the requested workspace.
5. The backend obtains the workspace's explicitly shared resource list.
6. Retrieval searches only chunks belonging to those shared resources.
7. The backend builds context from authorized results and calls the existing model integration.
8. The backend saves the user's message and the assistant response with the workspace conversation.
9. The frontend receives the response and updates the conversation.
10. Supabase Realtime may notify authorized members of new messages or activity.

At every step, the backend must keep the workspace ID, membership, resource IDs, and retrieval filters consistent. The client must not be able to widen the retrieval scope by submitting arbitrary document IDs.

### 5.2 Logical component layout

The exact filenames should follow the repository's established conventions. A possible organization is:

```text
backend/app/modules/workspaces/
    router.py
    schema.py
    service.py
    repository.py
    permissions.py

backend/app/modules/workspace_invitations/
    router.py
    schema.py
    service.py

backend/app/modules/workspace_chat/
    router.py
    schema.py
    service.py

backend/app/modules/workspace_rag/
    service.py
    retrieval.py

frontend/src/
    api/workspaces.js
    components/workspaces/
        WorkspaceList.jsx
        WorkspaceScreen.jsx
        WorkspaceMembers.jsx
        WorkspaceInvitations.jsx
        WorkspaceResources.jsx
        WorkspaceChat.jsx
```

This is a suggested organization, not a requirement to create every file. Before adding directories, follow the existing module patterns and avoid over-fragmenting a small implementation.

### 5.3 Keep personal and workspace flows separate at the permission boundary

Personal endpoints must continue to use the current user's personal resource scope. Workspace endpoints must require a workspace ID and a successful membership check. Do not silently make personal documents available to all workspace members.

Shared service functions can be reused, but they should receive an explicit, validated retrieval scope instead of guessing scope from optional parameters.

## 6. Database Design

The following schema is a proposed logical design. Confirm the existing naming conventions and migration approach before applying it. Use UUID primary keys and foreign keys to the actual Supabase Auth user ID where appropriate.

### 6.1 `workspaces`

Represents a collaboration space.

| Column | Suggested type | Purpose |
|---|---|---|
| `id` | `uuid primary key` | Workspace identifier |
| `name` | `text not null` | Workspace name |
| `description` | `text not null default ''` | Optional description |
| `created_by` | `uuid not null references auth.users(id)` | Original creator |
| `created_at` | `timestamptz not null default now()` | Creation time |
| `updated_at` | `timestamptz not null default now()` | Last update time |

The creator should also be added as a workspace member with the owner role within a transaction or a reliable service operation. Avoid relying only on a client-side follow-up request.

### 6.2 `workspace_members`

Represents current membership and permissions.

| Column | Suggested type | Purpose |
|---|---|---|
| `id` | `uuid primary key` | Membership record |
| `workspace_id` | `uuid not null references workspaces(id) on delete cascade` | Workspace |
| `user_id` | `uuid not null references auth.users(id) on delete cascade` | Member |
| `role` | `text not null` | `owner`, `admin`, or `member` |
| `joined_at` | `timestamptz not null default now()` | Join time |

Add a unique constraint on `(workspace_id, user_id)`. Add checks restricting role values. Define explicit behavior for ownership transfer and owner departure; do not permit the last owner to leave or be removed without transferring ownership or deleting the workspace through an authorized process.

### 6.3 `workspace_invitations`

Represents invitations to join a workspace.

| Column | Suggested type | Purpose |
|---|---|---|
| `id` | `uuid primary key` | Invitation ID |
| `workspace_id` | `uuid not null references workspaces(id) on delete cascade` | Target workspace |
| `invited_by` | `uuid not null references auth.users(id)` | Inviter |
| `invitee_user_id` | `uuid references auth.users(id)` | Target account when known |
| `invitee_email` | `text` | Normalized target email when email invitations are supported |
| `token_hash` | `text` | Hash of a high-entropy invitation token, if token-based links are used |
| `status` | `text not null` | `pending`, `accepted`, `declined`, `revoked`, or `expired` |
| `expires_at` | `timestamptz not null` | Expiration |
| `created_at` | `timestamptz not null default now()` | Creation time |
| `responded_at` | `timestamptz` | Response time |

Use a constraint or service validation to ensure an invitation has a valid target. Normalize email addresses consistently. Avoid storing raw invitation secrets. If invitations are limited to already-registered users, `invitee_user_id` can be the primary target and email-based token flows can be omitted from the first release.

Prevent duplicate active invitations for the same workspace and target. Invitation acceptance must be atomic: validate status, expiry, intended recipient, and workspace state; insert membership; then mark the invitation accepted. Concurrent acceptance attempts must not create duplicate memberships.

### 6.4 `workspace_resources`

Links an existing document to a workspace without copying its file.

| Column | Suggested type | Purpose |
|---|---|---|
| `id` | `uuid primary key` | Resource-link identifier |
| `workspace_id` | `uuid not null references workspaces(id) on delete cascade` | Workspace |
| `document_id` | Type must match the existing document table's primary key | Existing document identifier |
| `shared_by` | `uuid not null references auth.users(id)` | User who shared it |
| `created_at` | `timestamptz not null default now()` | Share time |

Add a unique constraint on `(workspace_id, document_id)`. Add the appropriate foreign key to the existing document table after confirming its actual name and key type. Do not create a duplicate document table merely to support collaboration.

Before sharing, verify that the acting user owns the document or has explicit permission to share it. The initial version should preferably allow only the document owner to share or unshare their document. The workspace must not gain access to the owner's other documents.

### 6.5 `workspace_messages`

Stores workspace conversation history.

| Column | Suggested type | Purpose |
|---|---|---|
| `id` | `uuid primary key` | Message ID |
| `workspace_id` | `uuid not null references workspaces(id) on delete cascade` | Workspace |
| `user_id` | `uuid references auth.users(id) on delete set null` | Author for user messages; nullable for system/assistant records if required |
| `role` | `text not null` | `user`, `assistant`, or an explicitly supported system role |
| `content` | `text not null` | Message body |
| `metadata` | `jsonb not null default '{}'::jsonb` | Optional bounded metadata, such as cited resource IDs |
| `created_at` | `timestamptz not null default now()` | Creation time |

Add checks for valid roles and indexes on `(workspace_id, created_at)` and, if needed, `(workspace_id, id)`. Do not store secrets, access tokens, or full private document contents in metadata. If assistant responses include citations, store stable resource/chunk references and validate that they belong to the authorized workspace scope before displaying them.

Consider adding a `conversation_id` only if multiple separate conversations per workspace are an explicit requirement. A single workspace conversation is simpler for the first release.

### 6.6 `workspace_activity`

Stores useful events for the workspace activity feed.

| Column | Suggested type | Purpose |
|---|---|---|
| `id` | `uuid primary key` | Activity ID |
| `workspace_id` | `uuid not null references workspaces(id) on delete cascade` | Workspace |
| `actor_user_id` | `uuid references auth.users(id) on delete set null` | Actor |
| `event_type` | `text not null` | Allowlisted event name |
| `payload` | `jsonb not null default '{}'::jsonb` | Small, non-sensitive event data |
| `created_at` | `timestamptz not null default now()` | Event time |

Possible events include workspace creation, member joined, invitation revoked, resource shared, resource unshared, and resource owner access revoked. Activity records must not leak private document text or invitation tokens. Only expose activity to current workspace members.

### 6.7 Schema constraints and indexes

Use foreign keys, uniqueness constraints, check constraints, and indexes to enforce invariants in the database as well as application code. At minimum, index membership lookups by `(user_id, workspace_id)`, workspace resources by `(workspace_id, document_id)`, invitations by target and status, and messages by `(workspace_id, created_at)`.

Use migrations or versioned SQL files according to the repository's existing practice. Test migrations against a development project first. Do not reset or recreate production tables to add collaboration.

## 7. Roles and Authorization Rules

Define permissions centrally and enforce them on every API request.

| Action | Owner | Admin | Member |
|---|---:|---:|---:|
| View workspace and members | Yes | Yes | Yes |
| Send and view workspace messages | Yes | Yes | Yes |
| Search workspace-shared documents | Yes | Yes | Yes |
| Invite members | Yes | Yes, if enabled by policy | No |
| Remove ordinary members | Yes | Yes, if enabled by policy | No |
| Change member roles | Yes | Limited or no by default | No |
| Edit workspace name and description | Yes | Optional | No |
| Delete workspace | Yes | No | No |
| Share a document they own | Yes | Yes, only for their own document | Yes, only for their own document |
| Unshare a document they own | Yes | Yes, only for their own document | Yes, only for their own document |
| Change ownership | Yes | No | No |

These are recommended initial rules. If the product needs a stricter policy, make the role matrix stricter before implementation.

Authorization rules:

1. The authenticated user ID must come from verified credentials.
2. The user must be an active member of the requested workspace for member operations.
3. Workspace-level administrative operations must check the role server-side.
4. A document must be explicitly linked in `workspace_resources` before workspace retrieval can access it.
5. The person sharing a document must have permission to share that document.
6. A member's removal or departure must immediately prevent further access to workspace messages and shared retrieval.
7. A workspace ID or document ID supplied by a client is an identifier, not proof of authorization.
8. The service-role client must never be treated as an authorization mechanism.
9. Return consistent errors that do not disclose whether an inaccessible private resource exists.
10. Do not rely on hiding UI controls to enforce permissions.

### 7.1 Database RLS

Enable and configure RLS for the new tables using the project's established security model. Policies should generally require workspace membership to read workspace rows, messages, resources, and activity. Writes should be limited to permitted roles and validated relationships.

If all writes go through FastAPI using the service-role client, database RLS will not constrain those service-role operations. In that design, enforce every authorization check in backend services and keep direct client access to sensitive tables read-only or unavailable as appropriate. If the frontend uses Supabase directly for Realtime subscriptions, ensure RLS prevents non-members from receiving rows. Test policies with two distinct accounts, including a non-member account.

Do not make tables publicly readable just to simplify Realtime.

## 8. API Design

Use the existing API prefix, response conventions, error handling, and authentication dependency. The routes below are proposed names and should be aligned with current naming conventions.

### 8.1 Workspaces

| Method | Suggested route | Purpose |
|---|---|---|
| `POST` | `/workspaces` | Create a workspace and its owner membership |
| `GET` | `/workspaces` | List workspaces for the current user |
| `GET` | `/workspaces/{workspace_id}` | Get workspace details after membership check |
| `PATCH` | `/workspaces/{workspace_id}` | Update workspace details with role check |
| `DELETE` | `/workspaces/{workspace_id}` | Delete workspace through owner-only flow |

Creating a workspace and its owner membership should be atomic or safely recoverable. List only workspaces the authenticated user belongs to.

### 8.2 Membership and invitations

| Method | Suggested route | Purpose |
|---|---|---|
| `GET` | `/workspaces/{workspace_id}/members` | List members visible to workspace members |
| `DELETE` | `/workspaces/{workspace_id}/members/{user_id}` | Remove a member if authorized |
| `PATCH` | `/workspaces/{workspace_id}/members/{user_id}` | Change role if authorized |
| `POST` | `/workspaces/{workspace_id}/invitations` | Create an invitation |
| `GET` | `/invitations` | List invitations addressed to current user |
| `POST` | `/invitations/{invitation_id}/accept` | Accept a valid invitation |
| `POST` | `/invitations/{invitation_id}/decline` | Decline an invitation |
| `DELETE` | `/workspaces/{workspace_id}/invitations/{invitation_id}` | Revoke a pending invitation |

Do not trust the frontend to specify the role granted by an invitation. The initial invitation role should default to `member`; role changes should use a separate authorized operation.

### 8.3 Shared resources

| Method | Suggested route | Purpose |
|---|---|---|
| `GET` | `/workspaces/{workspace_id}/resources` | List resources explicitly shared with the workspace |
| `POST` | `/workspaces/{workspace_id}/resources` | Share an existing document |
| `DELETE` | `/workspaces/{workspace_id}/resources/{resource_id}` | Unshare a document |

The share operation should accept the existing document ID, validate the document owner's permissions, create the workspace-resource link, and emit an activity event. It must not copy the underlying file or silently index the document into a global workspace.

The resource listing should return only safe metadata needed by the UI. Do not return raw storage secrets or private paths unless the current design specifically requires a protected, authorized download flow.

### 8.4 Messages and workspace AI

| Method | Suggested route | Purpose |
|---|---|---|
| `GET` | `/workspaces/{workspace_id}/messages` | Paginated message history |
| `POST` | `/workspaces/{workspace_id}/messages` | Add a normal user message, if separate from AI requests |
| `POST` | `/workspaces/{workspace_id}/chat` | Save the user question, run scoped RAG, save the assistant response |
| `GET` | `/workspaces/{workspace_id}/activity` | Paginated activity feed |

For a first version, a single chat endpoint may handle the user question and assistant response. Use pagination for history and activity. Validate message length and rate-limit expensive AI requests. Avoid returning unbounded history in a single response.

### 8.5 Error semantics

Use the existing project convention, but distinguish the following cases:

- `401 Unauthorized`: missing, expired, or invalid authentication.
- `403 Forbidden` or a deliberately consistent `404 Not Found`: authenticated but not authorized to access a workspace or resource.
- `404 Not Found`: requested resource is absent, subject to anti-enumeration policy.
- `409 Conflict`: duplicate membership, duplicate active invitation, or conflicting state transition.
- `422 Unprocessable Entity`: invalid input or schema.
- `429 Too Many Requests`: rate limit reached.
- `500` or appropriate `503`: unexpected or temporarily unavailable backend/model dependency.

Do not include stack traces, service-role credentials, raw SQL errors, or private document contents in client-visible errors.

## 9. Workspace Invitations

Implement invitations as explicit state transitions rather than a loose email or membership insert.

### 9.1 Create invitation

1. Authenticate the inviter.
2. Verify the inviter's role in the target workspace.
3. Validate and normalize the target account or email.
4. Reject an existing member or duplicate pending invitation.
5. Create a pending invitation with a bounded expiry.
6. If using invitation links, generate a high-entropy token and store only its hash.
7. Send a notification only if an email provider is configured; otherwise show the invitation in the recipient's in-app invitation list.

### 9.2 Accept invitation

1. Authenticate the recipient.
2. Load the invitation and lock or otherwise protect it against concurrent updates.
3. Confirm it is pending and not expired.
4. Confirm that the authenticated user matches the intended recipient.
5. Confirm the workspace still exists and is accepting members.
6. Insert the membership if it does not already exist.
7. Mark the invitation accepted and set the response time.
8. Record activity.
9. Return the workspace summary.

Perform these changes in a transaction, stored procedure, or carefully designed service operation that cannot leave a half-accepted invitation. Never accept an invitation merely because the client knows its UUID.

### 9.3 Remove member or leave workspace

Removing a member should invalidate future workspace access immediately. Define what happens to their messages and shared resources:

- Keep workspace messages for continuity, with author identity retained or anonymized according to the product's retention policy.
- Do not automatically delete a member's original document.
- Remove or revoke resource links shared by that member if the policy requires that a former member's shared resources cease to be available.
- If a document owner loses workspace membership, ensure the workspace cannot continue retrieving that owner's document unless the product explicitly defines a separate, authorized retention/ownership-transfer policy.
- Preserve ownership of the original document.
- If the departing member is the last owner, require ownership transfer or an authorized workspace deletion.

The selected policy must be applied consistently by database operations and the retrieval layer.

## 10. Sharing Documents Safely

The workspace resource link is an authorization record, not a file copy.

When a user shares a document:

1. Confirm the user owns the existing document or has an explicitly supported sharing permission.
2. Confirm the user is an active workspace member.
3. Confirm the user is allowed to share resources under the role policy.
4. Insert a `workspace_resources` row.
5. Make the document's existing chunks eligible for workspace retrieval only through this link.
6. Record an activity event.

When a resource is unshared, the retrieval layer must stop returning its chunks for future queries. If a dedicated workspace index exists, update or rebuild it so stale vectors cannot continue to surface.

The resource list and AI retrieval must both use the same source of truth for share permissions. Do not assume that hiding a document from the resource list prevents the RAG service from retrieving its chunks.

## 11. Workspace-Aware RAG

This is the most important technical part of the module. The implementation must be selected after the current FAISS and chunk metadata architecture is inspected.

### 11.1 Required retrieval invariant

For a request to workspace `W`, every retrieved chunk must belong to a document that is explicitly linked to `W` and remains accessible under the current authorization policy.

Conceptually:

```text
authenticated user
    -> verify active membership in workspace W
    -> fetch workspace_resources for W
    -> derive the allowed document IDs
    -> retrieve only chunks from those document IDs
    -> construct model context from authorized chunks
```

Never retrieve from every workspace member's personal index and merge the results without explicit document-level authorization filtering.

### 11.2 Candidate vector strategies

Choose one only after the audit.

**Strategy A: Reuse a shared vector index with strict metadata filtering.**  
Suitable if the current FAISS architecture supports stable metadata for document IDs and retrieval can reliably filter candidates by the authorized document ID set before content enters model context. Confirm that the filtering is correct and cannot be bypassed by similarity ranking or stale metadata.

**Strategy B: Maintain a workspace-specific vector index.**  
Potentially suitable if the current FAISS architecture cannot reliably filter by document ID or if workspace indexing is an established, maintainable pattern. This adds lifecycle complexity: sharing, unsharing, membership changes, resource deletion, index rebuilding, and concurrency all need careful handling. Do not create an index per workspace without measuring memory and maintenance costs.

**Strategy C: Retrieve candidates and post-filter them by document ID.**  
This can be acceptable for a small corpus only if the retrieval algorithm retrieves enough candidates to provide reliable results and no unauthorized text is passed to the LLM, logged, cached, or returned before filtering. Post-filtering too small a candidate set can cause poor recall. It is not safe to use a post-filter as an excuse to expose unauthorized chunks to model context.

The selected strategy must provide both security and reasonable retrieval quality. For every result, preserve the document ID and chunk identity so authorization can be checked before context construction.

### 11.3 Index lifecycle

Define how shared retrieval behaves when:

- A document is shared.
- A document is unshared.
- A source document is deleted.
- A document is reprocessed or re-embedded.
- The owner leaves the workspace.
- A member is removed.
- A workspace is deleted.
- An indexing job fails or is retried.

The initial implementation may avoid duplicate embeddings by reusing existing vectors, provided the current metadata and filtering design supports it. If a separate workspace index is required, do not duplicate embedding work unnecessarily and ensure cleanup is idempotent.

### 11.4 Context construction and citations

For each retrieved chunk, retain the source document ID, title or display name, and a stable chunk reference where available. Show source citations in the UI only for resources the user can currently access in that workspace. Validate citation references before serving linked content.

Keep prompts clear that retrieved document text is untrusted content. Instructions embedded inside uploaded documents must not be treated as system or developer instructions. The model should answer based on relevant content and should not be allowed to expand the retrieval scope on its own.

### 11.5 Failure behavior

If no resources are shared, tell the user that the workspace has no shared study documents and answer only if the product explicitly supports general-knowledge answers. If retrieval or embedding services are unavailable, return a controlled error or clearly label a non-RAG fallback. Never silently fall back to a user's personal document corpus when workspace retrieval fails.

## 12. Workspace Chat and Realtime Updates

### 12.1 Message flow

For a workspace AI request:

1. Validate authentication and membership.
2. Validate message length and request limits.
3. Persist the user message.
4. Run workspace-scoped retrieval.
5. Build the model prompt using only authorized chunks.
6. Generate the assistant response.
7. Persist the assistant response and allowed citation metadata.
8. Return the response to the caller.

Decide how to represent failed model responses. Options include a failed-message status or a separate request record. Avoid leaving ambiguous duplicate user messages when the client retries. Consider an idempotency key if retries could trigger repeated model charges.

### 12.2 Supabase Realtime

Use Supabase Realtime for message and activity notifications if it fits the existing Supabase setup. The backend remains the authority for creating messages and validating AI requests.

- Subscribe only to the active workspace.
- Ensure RLS and Realtime authorization prevent non-members from receiving rows.
- Unsubscribe when the user leaves the workspace screen or changes workspace.
- Handle reconnection and refresh message history after reconnecting.
- Use stable message IDs to deduplicate a response received both from the HTTP request and Realtime.
- Do not broadcast private document content or secrets in activity payloads.

If reliable authorization for direct client subscriptions is difficult under the current setup, use a backend-mediated update mechanism rather than exposing overly broad database access.

### 12.3 Message ordering and pagination

Use server-generated timestamps and stable IDs. Fetch older messages with cursor-based pagination or a consistent time-and-ID ordering. Do not rely solely on client clocks. Escape or safely render user-authored text; do not inject message content as raw HTML.

## 13. Frontend Implementation

Follow the existing component, API client, state-management, styling, and routing patterns. The names below are conceptual; align them with the current application.

### 13.1 Workspace list

Provide a workspace entry point that shows:

- Workspaces the current user belongs to.
- Workspace name and optional description.
- Member count if available.
- Invitation status and pending invitations.
- Actions permitted by the user's role.

Include loading, empty, error, and retry states. Avoid making the profile page responsible for workspace state.

### 13.2 Workspace screen

A workspace screen can contain these areas:

- Workspace details and member management.
- Shared resources list.
- Workspace conversation.
- Activity history, if included in the first release.

Keep the layout usable on narrow screens. Separate resource management and chat components where this matches the existing frontend architecture.

### 13.3 Member and invitation management

Display member profile details from safe fields such as display name, username, and avatar URL. Use user IDs for identity. Show role-aware controls only where appropriate, while still enforcing all permissions in the backend.

The invitation UI should display pending, accepted, declined, revoked, and expired states where useful. Handle duplicate invites and already-member cases with understandable messages.

### 13.4 Shared resource picker

Let users select from documents they are authorized to share. The picker should display only their eligible documents, but the backend must independently verify ownership or share permission. Show the document's shared status and allow authorized users to unshare it.

### 13.5 Workspace chat

The chat should include:

- Message history with pagination.
- A message composer with length limits.
- Loading and retry behavior.
- A clear indication that an answer is based on workspace-shared material when applicable.
- Source citations tied to authorized shared resources.
- A clear state when the workspace has no shared documents.
- Realtime updates without duplicate messages.
- Safe rendering of text and links.

Do not reuse a personal-chat component if it hardcodes personal document retrieval or writes messages to personal conversation tables. Reuse visual primitives where possible, but keep the data and authorization scopes distinct.

### 13.6 Frontend API client

Create or extend the existing API client using the same token handling and error conventions as the profile API. Do not create a second, inconsistent authentication implementation. Avoid logging access tokens, invitation tokens, private document content, or full prompts in browser logs.

## 14. Pydantic Schemas and Validation

Use the project's current Pydantic version and schema naming conventions.

Define request and response models for:

- Workspace create, update, and response.
- Member response and role change.
- Invitation create, response, and state.
- Resource share request and resource response.
- Message create, message response, and paginated history.
- Workspace chat request and response.
- Activity response.

Validation requirements include:

- Trim and bound workspace names and descriptions.
- Bound message length and page size.
- Reject unsupported role values.
- Validate UUIDs and input field formats.
- Normalize invitation email addresses if email invitations are supported.
- Reject empty or oversized chat messages.
- Ignore or reject client-supplied fields that should be generated by the backend, such as actor user IDs, role assignment, timestamps, or authorization status.
- Use response models that expose only safe fields.

Do not rely on Pydantic validation as a replacement for authorization or database constraints.

## 15. Transactions, Concurrency, and Reliability

Several operations involve more than one row and must be atomic or safely recoverable:

- Workspace creation plus owner membership.
- Invitation acceptance plus membership creation and invitation state transition.
- Role changes with last-owner protection.
- Resource sharing plus activity event.
- Resource unsharing plus activity event and retrieval invalidation.
- Workspace deletion and related cleanup.

Prefer PostgreSQL transactions or database functions for invariants that must be atomic. If the current Supabase client pattern makes multi-step operations non-transactional, design idempotent operations and explicit recovery behavior rather than assuming that sequential API calls cannot fail halfway through.

Use unique constraints to handle duplicate requests safely. Handle retryable failures in indexing and model calls without duplicating messages, invitations, or resource links.

## 16. Security and Privacy Requirements

Security is part of the feature design, not a final polish step.

### 16.1 Authentication and authorization

- Verify Supabase access tokens on every protected request.
- Derive user identity from verified token claims.
- Check membership and role on every workspace operation.
- Check document ownership or explicit sharing permission on every resource-share operation.
- Scope every query to the authorized workspace or user.
- Avoid IDOR vulnerabilities where changing a UUID grants access to another user's data.
- Recheck authorization immediately before retrieval and before serving citations or downloads.

### 16.2 Service-role client

If FastAPI uses the Supabase service-role key, keep it exclusively on the server. Never expose it through Vite environment variables or browser code. Service-role operations bypass RLS, so backend permission checks are mandatory for reads and writes.

### 16.3 Storage and document access

Keep existing document buckets and paths intact. Do not make private study documents public to simplify sharing. If users need to download a shared document, authorize the request and use the existing protected download mechanism or short-lived signed URLs. A signed URL is a bearer credential and should not be logged or persisted unnecessarily.

### 16.4 Invitation security

- Use unguessable tokens for invitation links.
- Store only token hashes where practical.
- Expire invitations.
- Validate recipient identity.
- Support revocation.
- Avoid leaking invitation details to non-recipients.
- Rate-limit invitation creation and acceptance attempts.

### 16.5 AI and prompt injection

Treat document content and messages as untrusted input. The model must not be able to bypass backend authorization by requesting arbitrary document IDs or constructing its own filters. Tools should expose narrowly scoped operations, and the backend should determine authorized data before any content reaches the model.

### 16.6 Logging and secrets

Log request IDs, operation names, and safe error details. Avoid logging access tokens, service-role keys, invitation tokens, private document content, or unnecessary personal data. Configure secret values only in server-side deployment settings.

## 17. Testing Strategy

Use automated tests where the current project has a test framework; otherwise establish a small, repeatable backend test setup before broad feature development.

### 17.1 Authentication and permissions

Test at least two separate users and a third non-member account:

- Unauthenticated user cannot access protected workspace endpoints.
- Member can view their workspace.
- Non-member cannot view workspace details, messages, resources, or activity.
- Member cannot perform owner-only actions.
- User cannot alter a workspace ID to read another workspace's data.
- User cannot share another user's document without permission.
- Former member loses access after removal.
- A removed member cannot retrieve workspace chunks through AI.
- Service-role backend operations still enforce authorization.

### 17.2 Invitation tests

- Valid invitation can be accepted once.
- Expired invitation cannot be accepted.
- Revoked invitation cannot be accepted.
- Invitation cannot be accepted by the wrong user.
- Duplicate pending invitation is handled consistently.
- Concurrent acceptance does not create duplicate membership.
- Last-owner rules are enforced.
- Workspace deletion and invitation state remain consistent.

### 17.3 Resource-sharing tests

- A user can share an eligible owned document.
- Duplicate resource links are prevented.
- A document not explicitly shared is never retrieved by workspace RAG.
- Unsharing immediately excludes a document from subsequent retrieval.
- Deleting a source document does not leave retrievable stale chunks.
- A user's personal RAG still retrieves only their personal authorized documents.
- A workspace cannot retrieve documents shared only with another workspace.

### 17.4 RAG tests

Use documents with deliberately distinct test content so unauthorized retrieval is easy to detect. Confirm that the context sent to the model contains only authorized chunks. Test empty workspaces, retrieval failures, stale metadata, and resource removal. Mock external model calls in unit tests and run a small integration test against the development stack.

### 17.5 Chat and Realtime tests

- Messages are stored with the correct workspace ID.
- Only members can read message history.
- Pagination does not skip or duplicate messages.
- A user message and assistant response are not duplicated on retry.
- Realtime events are not delivered to non-members.
- Reconnecting clients refresh missed messages.
- User-supplied text is rendered safely.
- Failed model calls have clear, recoverable behavior.

### 17.6 Frontend tests

Test loading, empty, success, and error states for each main screen. Verify role-aware controls, invitation status transitions, resource sharing, message retries, and mobile layout. Do not treat frontend visibility tests as proof of backend authorization.

## 18. Implementation Phases

Build the module in small, testable phases. Do not implement the entire feature in one large change.

### Phase 0: Audit and design confirmation

- Inspect auth, routers, document upload and processing, FAISS metadata, storage, Supabase schema, RLS, and deployment configuration.
- Record the actual table names and service functions.
- Confirm the invitation model: registered-user invitations first, or email/token invitations.
- Confirm the owner-departure and shared-resource revocation policy.
- Choose the vector strategy.
- Finalize migrations and endpoint names.

**Exit condition:** The implementation design maps to real code and schema; no key assumption about document storage or indexing remains unverified.

### Phase 1: Database foundation

- Add versioned SQL migrations for the collaboration tables.
- Add foreign keys, constraints, and indexes.
- Configure RLS and Realtime authorization according to the chosen access pattern.
- Test schema changes in a development Supabase project.
- Add any required safe database functions for atomic operations.

**Exit condition:** Schema and permission tests pass before frontend integration begins.

### Phase 2: Workspace and membership APIs

- Implement workspace creation, listing, detail, update, and deletion.
- Create owner membership reliably.
- Implement member listing and role checks.
- Enforce last-owner and membership invariants.
- Add API tests for member and non-member access.

**Exit condition:** Workspace CRUD and authorization work independently of chat and RAG.

### Phase 3: Invitations

- Implement invitation creation, listing, acceptance, decline, revocation, and expiry.
- Add recipient validation and duplicate handling.
- Make acceptance atomic or safely recoverable.
- Record invitation-related activity.

**Exit condition:** Invitation state transitions and race-condition tests pass.

### Phase 4: Explicit resource sharing

- List eligible documents.
- Share existing documents without copying them.
- List and unshare workspace resources.
- Record activity.
- Ensure ownership, deletion, and membership changes update access correctly.

**Exit condition:** A workspace can list only explicitly shared resources, and resource access rules are tested.

### Phase 5: Workspace-scoped retrieval

- Reuse existing extraction, embedding, and retrieval services.
- Implement the chosen vector strategy.
- Enforce document-ID filtering from authorized workspace resource links.
- Validate citations and context construction.
- Test that private and unshared documents cannot enter model context.

**Exit condition:** Retrieval isolation tests pass for personal, shared, unshared, and cross-workspace cases.

### Phase 6: Workspace chat

- Implement paginated history.
- Implement workspace AI requests.
- Persist user and assistant messages.
- Add safe error and retry handling.
- Include authorized source citations.
- Add rate limits and idempotency if needed.

**Exit condition:** Workspace chat works with shared documents without changing the personal chat behavior.

### Phase 7: Realtime

- Enable Realtime for the necessary tables.
- Configure membership-aware row access.
- Add frontend subscriptions, cleanup, reconnect, and deduplication.
- Verify that non-members cannot receive messages or activity.

**Exit condition:** Live updates work and authorization tests confirm isolation.

### Phase 8: Frontend integration

- Add the workspace entry point and workspace list.
- Build workspace details and member management.
- Add invitations and resource picker.
- Add chat and activity views.
- Reuse the application's design system and API conventions.
- Add loading, empty, error, and retry states.

**Exit condition:** A user can complete the main workflow through the UI without bypassing backend controls.

### Phase 9: Release readiness

- Run regression tests for personal RAG, profiles, authentication, and document management.
- Review RLS, service-role usage, logs, environment variables, and error handling.
- Test with separate accounts in a staging environment.
- Verify migrations and rollback/recovery procedures.
- Deploy backend and frontend changes through the existing hosting setup.
- Monitor API errors, retrieval latency, and model failures.

**Exit condition:** Core collaboration flows and privacy boundaries are verified in staging before production release.

## 19. Deployment and Operations

Use the existing deployment setup:

- Apply schema migrations to the intended Supabase environment.
- Configure any new backend environment variables only if actually required.
- Deploy FastAPI changes to the existing Render service.
- Deploy frontend changes to the existing Vercel project.
- Confirm allowed frontend origins and backend API base URLs.
- Verify that no secret is bundled into the frontend.
- Confirm that Realtime is enabled only for required tables and respects authorization.
- Check logs for failed migrations, API errors, retrieval errors, and model failures.
- Keep a documented rollback path for database and application changes.

Do not change existing production storage policies or delete existing indexes as part of an unrelated collaboration migration.

## 20. Performance and Cost Considerations

The current application already pays the computational cost of embedding and retrieving personal documents. The collaboration module should reuse existing vectors where safe rather than automatically re-embedding every shared document.

Monitor:

- Number of workspaces and memberships.
- Number and size of shared documents.
- FAISS index memory and persistence behavior.
- Embedding calls caused by sharing or reprocessing.
- Retrieval latency and candidate counts.
- Workspace message volume.
- Model latency and token usage.
- Realtime subscriptions and reconnection behavior.

Avoid one vector index per workspace unless the current architecture and workload justify it. For typical documents under approximately 10 MB, file size alone does not determine vector-index cost; extracted text length, chunk count, embedding dimensions, and number of concurrent indexes also matter.

Set reasonable limits for workspace creation, member count, document count, message size, and AI request frequency based on measured usage and product needs. Keep limits configurable where practical.

## 21. Future MCP Compatibility

MCP is not required for collaboration. The collaboration services should nevertheless be designed so they can later be exposed through a separate MCP server.

Good future candidates include:

- Search the current user's authorized documents.
- Search documents explicitly shared with a specified workspace.
- Retrieve workspace member-visible resource metadata.
- Generate a quiz from authorized shared material.
- Summarize an authorized workspace conversation.
- Create a study plan from allowed study data.

When MCP is added, the MCP tool must call the same trusted service layer and authorization checks as the normal API. Do not create a parallel authorization system or let the model choose arbitrary user IDs, workspace IDs, or document IDs without validating access.

Start with read-only tools. Add state-changing tools only after defining confirmation, idempotency, audit logging, and role requirements. MCP must not be able to broaden a workspace retrieval scope or bypass membership checks.

## 22. Definition of Done

The collaboration module is ready for release when:

- Users can create and list workspaces.
- The creator becomes the owner reliably.
- Membership roles and last-owner rules are enforced.
- Invitations have secure and tested state transitions.
- Existing documents can be shared without being copied.
- Only explicitly shared documents are eligible for workspace retrieval.
- Unshared or inaccessible documents are excluded from subsequent retrieval.
- Workspace messages and AI responses persist correctly.
- Only current members can read workspace data and receive Realtime events.
- Removing a member revokes future access.
- Personal RAG, profiles, authentication, and document management continue to work.
- Backend authorization is tested independently of frontend controls.
- RLS and service-role usage have been reviewed.
- Migrations, deployment steps, and recovery procedures are documented.
- Errors, loading states, retries, and empty states are handled.
- The feature has been tested with multiple accounts in a staging environment.

## 23. Recommended Immediate Next Step

Do not start by writing all the SQL or creating the frontend. Begin with Phase 0.

Inspect the existing repository and produce a short audit of:

1. The current auth dependency and how routers obtain the authenticated user.
2. The actual document metadata schema and storage paths.
3. The current chunk and FAISS metadata structure.
4. The functions used for personal retrieval and model context construction.
5. Existing Supabase RLS policies and service-role usage.
6. The frontend routing, API client, and current chat implementation.

Then finalize the schema and vector strategy based on those findings. This prevents a collaboration implementation that looks complete in the UI but leaks private data, duplicates indexing work, or breaks the personal RAG flow.

---

## Appendix A: Key Design Decisions

| Decision | Recommended starting point | Must be confirmed |
|---|---|---|
| Live updates | Supabase Realtime | RLS and subscription behavior |
| Collaboration backend | Existing FastAPI service | Current router and service patterns |
| Document ownership | Original user retains ownership | Existing document deletion policy |
| Document sharing | Explicit resource-link record | Actual document table and ID type |
| Workspace RAG | Authorized document-ID scope | FAISS metadata and retrieval capabilities |
| Vector indexes | Reuse existing vectors where safe | Current index lifecycle and metadata filters |
| Invitations | Secure, expiring, revocable invitation records | Registered-user vs email-token flow |
| Workspace chat | Workspace-scoped persisted messages | Whether one or multiple conversations are needed |
| MCP | Future adapter over trusted services | Desired external-client use cases |
| Frontend polish | Follow existing UI conventions | Current routing and component organization |

## Appendix B: Principles to Preserve

1. Preserve the existing personal study flow.
2. Keep document ownership separate from document sharing.
3. Share only documents explicitly selected by their owner or an authorized user.
4. Treat membership as revocable authorization, not a permanent entitlement.
5. Enforce permissions in trusted backend code, even when using Supabase service-role access.
6. Keep workspace retrieval scoped to authorized shared documents.
7. Prefer reusing current services and vectors when the audit confirms that it is safe.
8. Keep database migrations reversible or provide a documented recovery plan.
9. Test authorization using multiple independent accounts.
10. Add complexity only when the current architecture or verified requirements justify it.
"""