create table if not exists public.workplace(
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_workspaces_owner on public.workplace(owner_id);

///

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  role         text not null default 'member' check (role in ('member', 'admin', 'owner')),
  joined_at    timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create index idx_workspace_members_user on public.workspace_members(user_id);

///

create table public.workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  invited_by uuid not null references auth.users(id) on delete cascade,
  invited_at timestamptz not null default now(),
  invited_email text not null,
  invited_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending','accepted','rejected','cancelled','expired')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  responded_at timestamptz,
  check (expires_at > created_at)
);

create index idx_workspace_invitations_email
  on public.workspace_invitations (lower(invited_email));

create index idx_workspace_invitations_workspace
  on public.workspace_invitations (workspace_id);

create unique index idx_workspace_invitations_pending
  on public.workspace_invitations (workspace_id, lower(invited_email))
  where status = 'pending';

///

create table if not exists public.workspace_resources (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  resource_type text not null check (resource_type in ('note','material')),
  resource_id text not null,
  resource_owner_id uuid not null references auth.users(id) on delete cascade,
  shared_by uuid not null references auth.users(id) on delete cascade,
  title text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  check (revoked_at is null or revoked_at >= created_at)
);

create index idx_workspace_resources_workspace
  on public.workspace_resources (workspace_id);

create index idx_workspace_resources_owner
  on public.workspace_resources (resource_owner_id);

create unique index idx_workspace_resource_active
  on public.workspace_resources (workspace_id, resource_type, resource_id)
  where revoked_at is null;

///

CREATE TABLE public.workspace_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL
        REFERENCES public.workspaces(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL
        REFERENCES auth.users(id) ON DELETE CASCADE,

    content TEXT NOT NULL CHECK (
        char_length(trim(content)) BETWEEN 1 AND 4000
    ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_workspace_messages_history
    ON public.workspace_messages(workspace_id, created_at DESC);

///

rls policies

-- Workspaces: only members can read a workspace.
CREATE POLICY "Members can view workspaces"
ON public.workspaces
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.workspace_members wm
        WHERE wm.workspace_id = workspaces.id
          AND wm.user_id = (SELECT auth.uid())
    )
);

-- Members: workspace members can view the member list.
CREATE POLICY "Members can view workspace members"
ON public.workspace_members
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.workspace_members viewer
        WHERE viewer.workspace_id = workspace_members.workspace_id
          AND viewer.user_id = (SELECT auth.uid())
    )
);

-- Invitations: the inviter or intended recipient can view an invitation.
CREATE POLICY "Inviter or recipient can view invitations"
ON public.workspace_invitations
FOR SELECT
TO authenticated
USING (
    invited_by = (SELECT auth.uid())
    OR invited_user_id = (SELECT auth.uid())
    OR lower(invited_email) = lower(
        COALESCE(
            (SELECT email FROM auth.users WHERE id = (SELECT auth.uid())),
            ''
        )
    )
);

-- Resources: only current workspace members can view shared-resource references.
CREATE POLICY "Members can view shared resources"
ON public.workspace_resources
FOR SELECT
TO authenticated
USING (
    revoked_at IS NULL
    AND EXISTS (
        SELECT 1
        FROM public.workspace_members wm
        WHERE wm.workspace_id = workspace_resources.workspace_id
          AND wm.user_id = (SELECT auth.uid())
    )
);

-- Messages: only workspace members can read messages.
CREATE POLICY "Members can view workspace messages"
ON public.workspace_messages
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.workspace_members wm
        WHERE wm.workspace_id = workspace_messages.workspace_id
          AND wm.user_id = (SELECT auth.uid())
    )
);
