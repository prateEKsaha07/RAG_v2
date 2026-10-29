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




CREATE OR REPLACE FUNCTION public.create_workspace_with_owner(
    p_name TEXT,
    p_description TEXT,
    p_owner_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    new_workspace public.workspaces%ROWTYPE;
BEGIN
    IF p_name IS NULL OR char_length(trim(p_name)) NOT BETWEEN 1 AND 100 THEN
        RAISE EXCEPTION 'Workspace name must be between 1 and 100 characters';
    END IF;

    IF p_description IS NOT NULL AND char_length(p_description) > 2000 THEN
        RAISE EXCEPTION 'Workspace description is too long';
    END IF;

    INSERT INTO public.workspaces (
        name,
        description,
        owner_id
    )
    VALUES (
        trim(p_name),
        COALESCE(p_description, ''),
        p_owner_id
    )
    RETURNING * INTO new_workspace;

    INSERT INTO public.workspace_members (
        workspace_id,
        user_id,
        role
    )
    VALUES (
        new_workspace.id,
        p_owner_id,
        'owner'
    );

    RETURN to_jsonb(new_workspace);
END;
$$;

-- Only the backend service role should call this function.
REVOKE ALL ON FUNCTION public.create_workspace_with_owner(TEXT, TEXT, UUID)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.create_workspace_with_owner(TEXT, TEXT, UUID)
TO service_role;


database func


-- Invite an existing registered user.
CREATE OR REPLACE FUNCTION public.invite_registered_user(
    p_workspace_id UUID,
    p_invited_email TEXT,
    p_inviter_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    recipient_id UUID;
    normalized_email TEXT;
    new_invitation public.workspace_invitations%ROWTYPE;
BEGIN
    normalized_email := lower(trim(p_invited_email));

    IF normalized_email IS NULL OR normalized_email = '' THEN
        RAISE EXCEPTION 'Email is required';
    END IF;

    -- Only workspace owners and admins can invite.
    IF NOT EXISTS (
        SELECT 1
        FROM public.workspace_members wm
        WHERE wm.workspace_id = p_workspace_id
          AND wm.user_id = p_inviter_id
          AND wm.role IN ('owner', 'admin')
    ) THEN
        RAISE EXCEPTION 'Not authorized to invite users';
    END IF;

    -- Resolve an existing Supabase Auth account.
    SELECT u.id
    INTO recipient_id
    FROM auth.users u
    WHERE lower(u.email) = normalized_email
    LIMIT 1;

    IF recipient_id IS NULL THEN
        RAISE EXCEPTION 'No registered user found for this email';
    END IF;

    IF recipient_id = p_inviter_id THEN
        RAISE EXCEPTION 'You cannot invite yourself';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.workspace_members wm
        WHERE wm.workspace_id = p_workspace_id
          AND wm.user_id = recipient_id
    ) THEN
        RAISE EXCEPTION 'User is already a workspace member';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.workspace_invitations wi
        WHERE wi.workspace_id = p_workspace_id
          AND lower(wi.invited_email) = normalized_email
          AND wi.status = 'pending'
    ) THEN
        RAISE EXCEPTION 'A pending invitation already exists';
    END IF;

    INSERT INTO public.workspace_invitations (
        workspace_id,
        invited_by,
        invited_email,
        invited_user_id,
        status
    )
    VALUES (
        p_workspace_id,
        p_inviter_id,
        normalized_email,
        recipient_id,
        'pending'
    )
    RETURNING * INTO new_invitation;

    RETURN to_jsonb(new_invitation);
END;
$$;


-- Accept or reject an invitation atomically.
CREATE OR REPLACE FUNCTION public.respond_to_workspace_invitation(
    p_invitation_id UUID,
    p_actor_id UUID,
    p_action TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    invitation public.workspace_invitations%ROWTYPE;
BEGIN
    IF p_action NOT IN ('accepted', 'rejected') THEN
        RAISE EXCEPTION 'Invalid invitation action';
    END IF;

    SELECT *
    INTO invitation
    FROM public.workspace_invitations wi
    WHERE wi.id = p_invitation_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invitation not found';
    END IF;

    IF invitation.invited_user_id IS DISTINCT FROM p_actor_id THEN
        RAISE EXCEPTION 'Not authorized to respond to this invitation';
    END IF;

    IF invitation.status <> 'pending' THEN
        RAISE EXCEPTION 'Invitation is no longer pending';
    END IF;

    IF invitation.expires_at <= now() THEN
        UPDATE public.workspace_invitations
        SET status = 'expired'
        WHERE id = p_invitation_id;

        RETURN jsonb_build_object(
            'id', p_invitation_id,
            'status', 'expired'
        );
    END IF;

    IF p_action = 'accepted' THEN
        INSERT INTO public.workspace_members (
            workspace_id,
            user_id,
            role
        )
        VALUES (
            invitation.workspace_id,
            p_actor_id,
            'member'
        )
        ON CONFLICT (workspace_id, user_id) DO NOTHING;
    END IF;

    UPDATE public.workspace_invitations
    SET status = p_action,
        responded_at = now()
    WHERE id = p_invitation_id
    RETURNING * INTO invitation;

    RETURN to_jsonb(invitation);
END;
$$;


-- Only the trusted backend service role may execute these functions.
REVOKE ALL ON FUNCTION public.invite_registered_user(UUID, TEXT, UUID)
FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.respond_to_workspace_invitation(UUID, UUID, TEXT)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.invite_registered_user(UUID, TEXT, UUID)
TO service_role;

GRANT EXECUTE ON FUNCTION public.respond_to_workspace_invitation(UUID, UUID, TEXT)
TO service_role;

