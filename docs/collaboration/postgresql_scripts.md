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

atomicity

CREATE OR REPLACE FUNCTION public.remove_workspace_member(
    p_workspace_id UUID,
    p_target_user_id UUID,
    p_actor_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    actor_role TEXT;
    target_role TEXT;
BEGIN
    -- Check the actor's workspace role
    SELECT wm.role INTO actor_role
    FROM public.workspace_members wm
    WHERE wm.workspace_id = p_workspace_id
      AND wm.user_id = p_actor_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Actor is not a workspace member';
    END IF;

    -- Check the target member's role
    SELECT wm.role INTO target_role
    FROM public.workspace_members wm
    WHERE wm.workspace_id = p_workspace_id
      AND wm.user_id = p_target_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Target workspace member not found';
    END IF;

    -- Owner cannot be removed
    IF target_role = 'owner' THEN
        RAISE EXCEPTION 'Workspace owner cannot be removed';
    END IF;

    -- Only owner or admin can remove members
    IF actor_role NOT IN ('owner', 'admin') THEN
        RAISE EXCEPTION 'Not authorized to remove workspace members';
    END IF;

    -- Admins cannot remove other admins
    IF actor_role = 'admin' AND target_role = 'admin' THEN
        RAISE EXCEPTION 'Admins cannot remove other admins';
    END IF;

    -- Remove membership
    DELETE FROM public.workspace_members
    WHERE workspace_id = p_workspace_id
      AND user_id = p_target_user_id;

    RETURN jsonb_build_object(
        'workspace_id', p_workspace_id,
        'removed_user_id', p_target_user_id,
        'removed_role', target_role,
        'removed_by', p_actor_id
    );
END;
$$;

REVOKE ALL ON FUNCTION public.remove_workspace_member(UUID, UUID, UUID)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.remove_workspace_member(UUID, UUID, UUID)
TO service_role;

///

CREATE OR REPLACE FUNCTION public.revoke_workspace_resource(
    p_workspace_id UUID,
    p_resource_id UUID,
    p_actor_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    actor_role TEXT;
    resource_record public.workspace_resources%ROWTYPE;
BEGIN
    -- Verify workspace membership
    SELECT wm.role INTO actor_role
    FROM public.workspace_members wm
    WHERE wm.workspace_id = p_workspace_id
      AND wm.user_id = p_actor_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Not a workspace member';
    END IF;

    -- Retrieve and lock the resource
    SELECT *
    INTO resource_record
    FROM public.workspace_resources wr
    WHERE wr.id = p_resource_id
      AND wr.workspace_id = p_workspace_id
      AND wr.revoked_at IS NULL
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Active workspace resource not found';
    END IF;

    -- Check permission
    IF actor_role NOT IN ('owner', 'admin')
       AND resource_record.shared_by <> p_actor_id THEN
        RAISE EXCEPTION 'Not authorized to revoke this resource';
    END IF;

    -- Revoke resource
    UPDATE public.workspace_resources
    SET revoked_at = now()
    WHERE id = p_resource_id;

    RETURN jsonb_build_object(
        'resource_id', p_resource_id,
        'workspace_id', p_workspace_id,
        'revoked_by', p_actor_id,
        'revoked_at', now()
    );
END;
$$;

REVOKE ALL ON FUNCTION public.revoke_workspace_resource(UUID, UUID, UUID)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.revoke_workspace_resource(UUID, UUID, UUID)
TO service_role;

///

CREATE OR REPLACE FUNCTION public.send_workspace_message(
    p_workspace_id UUID,
    p_sender_id UUID,
    p_content TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    message_record public.workspace_messages%ROWTYPE;
BEGIN
    -- Validate message content
    IF p_content IS NULL
       OR char_length(trim(p_content)) < 1
       OR char_length(trim(p_content)) > 4000 THEN
        RAISE EXCEPTION 'Message must contain between 1 and 4000 characters';
    END IF;

    -- Verify workspace membership
    IF NOT EXISTS (
        SELECT 1
        FROM public.workspace_members wm
        WHERE wm.workspace_id = p_workspace_id
          AND wm.user_id = p_sender_id
    ) THEN
        RAISE EXCEPTION 'Not a workspace member';
    END IF;

    -- Insert message
    INSERT INTO public.workspace_messages (
        workspace_id,
        sender_id,
        content
    )
    VALUES (
        p_workspace_id,
        p_sender_id,
        trim(p_content)
    )
    RETURNING * INTO message_record;

    RETURN jsonb_build_object(
        'id', message_record.id,
        'workspace_id', message_record.workspace_id,
        'sender_id', message_record.sender_id,
        'content', message_record.content,
        'created_at', message_record.created_at
    );
END;
$$;

REVOKE ALL ON FUNCTION public.send_workspace_message(UUID, UUID, TEXT)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.send_workspace_message(UUID, UUID, TEXT)
TO service_role;

///

CREATE OR REPLACE FUNCTION public.get_workspace_messages(
    p_workspace_id UUID,
    p_user_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_before TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    messages JSONB;
BEGIN
    -- Verify workspace membership
    IF NOT EXISTS (
        SELECT 1
        FROM public.workspace_members wm
        WHERE wm.workspace_id = p_workspace_id
          AND wm.user_id = p_user_id
    ) THEN
        RAISE EXCEPTION 'Not a workspace member';
    END IF;

    -- Validate pagination limit
    IF p_limit < 1 OR p_limit > 100 THEN
        RAISE EXCEPTION 'Invalid message limit';
    END IF;

    -- Retrieve messages
    SELECT COALESCE(
        jsonb_agg(
            message_data
            ORDER BY message_data->>'created_at' ASC
        ),
        '[]'::JSONB
    )
    INTO messages
    FROM (
        SELECT jsonb_build_object(
            'id', wm.id,
            'workspace_id', wm.workspace_id,
            'sender_id', wm.sender_id,
            'content', wm.content,
            'created_at', wm.created_at
        ) AS message_data
        FROM public.workspace_messages wm
        WHERE wm.workspace_id = p_workspace_id
          AND (
              p_before IS NULL
              OR wm.created_at < p_before
          )
        ORDER BY wm.created_at DESC, wm.id DESC
        LIMIT p_limit
    ) recent_messages;

    RETURN messages;
END;
$$;

REVOKE ALL ON FUNCTION public.get_workspace_messages(UUID, UUID, INTEGER, TIMESTAMPTZ)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_workspace_messages(UUID, UUID, INTEGER, TIMESTAMPTZ)
TO service_role;

'''Why pagination?
We don't want to load thousands of messages whenever someone opens a workspace.
- Default: 50 messages.
- Maximum: 100 messages.
- p_before: retrieves older messages using a timestamp cursor.'''

///

### for supabase realtime for messaging
-- 1. Enable Realtime for workspace_messages
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'workspace_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime
        ADD TABLE public.workspace_messages;
    END IF;
END;
$$;


-- 2. Create a secure membership-checking function
CREATE OR REPLACE FUNCTION public.is_workspace_member(
    p_workspace_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.workspace_members wm
        WHERE wm.workspace_id = p_workspace_id
          AND wm.user_id = auth.uid()
    );
$$;


-- 3. Restrict execution permissions
REVOKE ALL ON FUNCTION public.is_workspace_member(UUID)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.is_workspace_member(UUID)
TO authenticated;


-- 4. Allow authenticated members to receive messages
GRANT SELECT ON public.workspace_messages TO authenticated;

DROP POLICY IF EXISTS "Workspace members can read messages"
ON public.workspace_messages;

CREATE POLICY "Workspace members can read messages"
ON public.workspace_messages
FOR SELECT
TO authenticated
USING (
    public.is_workspace_member(workspace_id)
);

////

CREATE TABLE public.workspace_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    workspace_id UUID NOT NULL
        REFERENCES public.workspaces(id)
        ON DELETE CASCADE,

    actor_id UUID
        REFERENCES auth.users(id)
        ON DELETE SET NULL,

    event_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,

    payload JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_workspace_activity_timeline
ON public.workspace_activity (
    workspace_id,
    created_at DESC,
    id DESC
);

CREATE INDEX idx_workspace_activity_actor
ON public.workspace_activity (actor_id);

CREATE INDEX idx_workspace_activity_type
ON public.workspace_activity (
    workspace_id,
    event_type,
    created_at DESC
);

///

ALTER TABLE public.workspace_activity
ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can read activity"
ON public.workspace_activity
FOR SELECT
TO authenticated
USING (
    public.is_workspace_member(workspace_id)
);

GRANT SELECT ON public.workspace_activity TO authenticated;

REVOKE ALL ON public.workspace_activity FROM anon;

///

[
  {
    "table_name": "workspace_invitations",
    "trigger_name": "trg_workspace_invitation_activity",
    "action_timing": "AFTER",
    "event_manipulation": "INSERT"
  },
  {
    "table_name": "workspace_invitations",
    "trigger_name": "trg_workspace_invitation_activity",
    "action_timing": "AFTER",
    "event_manipulation": "UPDATE"
  },
  {
    "table_name": "workspace_members",
    "trigger_name": "trg_workspace_member_activity",
    "action_timing": "AFTER",
    "event_manipulation": "INSERT"
  },
  {
    "table_name": "workspace_members",
    "trigger_name": "trg_workspace_member_activity",
    "action_timing": "AFTER",
    "event_manipulation": "DELETE"
  },
  {
    "table_name": "workspace_members",
    "trigger_name": "trg_workspace_member_activity",
    "action_timing": "AFTER",
    "event_manipulation": "UPDATE"
  },
  {
    "table_name": "workspace_messages",
    "trigger_name": "trg_workspace_message_activity",
    "action_timing": "AFTER",
    "event_manipulation": "INSERT"
  },
  {
    "table_name": "workspace_resources",
    "trigger_name": "trg_workspace_resource_activity",
    "action_timing": "AFTER",
    "event_manipulation": "UPDATE"
  },
  {
    "table_name": "workspace_resources",
    "trigger_name": "trg_workspace_resource_activity",
    "action_timing": "AFTER",
    "event_manipulation": "INSERT"
  }
]

///

### voting system
-- 1. Main polls table
CREATE TABLE public.workspace_polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    workspace_id UUID NOT NULL
        REFERENCES public.workspaces(id)
        ON DELETE CASCADE,

    created_by UUID NOT NULL
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    question TEXT NOT NULL
        CHECK (char_length(trim(question)) BETWEEN 1 AND 300),

    description TEXT,

    -- Optional reference to an existing shared workspace resource
    resource_id UUID
        REFERENCES public.workspace_resources(id)
        ON DELETE SET NULL,

    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'closed')),

    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,

    expires_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    closed_at TIMESTAMPTZ
);


-- 2. Poll options
CREATE TABLE public.workspace_poll_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    poll_id UUID NOT NULL
        REFERENCES public.workspace_polls(id)
        ON DELETE CASCADE,

    option_text TEXT NOT NULL
        CHECK (char_length(trim(option_text)) BETWEEN 1 AND 200),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (poll_id, id)
);


-- 3. Member votes
CREATE TABLE public.workspace_poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    poll_id UUID NOT NULL,

    option_id UUID NOT NULL,

    user_id UUID NOT NULL
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- One vote per member per poll
    UNIQUE (poll_id, user_id),

    -- Ensure the selected option belongs to this poll
    FOREIGN KEY (poll_id, option_id)
        REFERENCES public.workspace_poll_options(poll_id, id)
        ON DELETE CASCADE
);


-- 4. Indexes
CREATE INDEX idx_workspace_polls_workspace
ON public.workspace_polls(workspace_id, created_at DESC);

CREATE INDEX idx_workspace_poll_options
ON public.workspace_poll_options(poll_id);

CREATE INDEX idx_workspace_poll_votes
ON public.workspace_poll_votes(poll_id);


-- 5. Enable RLS
ALTER TABLE public.workspace_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_poll_votes ENABLE ROW LEVEL SECURITY;


-- 6. Allow workspace members to read polls
CREATE POLICY "Workspace members can read polls"
ON public.workspace_polls
FOR SELECT
TO authenticated
USING (public.is_workspace_member(workspace_id));


-- Allow members to read options belonging to their workspace polls
CREATE POLICY "Workspace members can read poll options"
ON public.workspace_poll_options
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.workspace_polls p
        WHERE p.id = poll_id
          AND public.is_workspace_member(p.workspace_id)
    )
);


-- Allow members to read votes belonging to their workspace polls
CREATE POLICY "Workspace members can read poll votes"
ON public.workspace_poll_votes
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.workspace_polls p
        WHERE p.id = poll_id
          AND public.is_workspace_member(p.workspace_id)
    )
);


-- 7. Read permissions
GRANT SELECT ON public.workspace_polls TO authenticated;
GRANT SELECT ON public.workspace_poll_options TO authenticated;
GRANT SELECT ON public.workspace_poll_votes TO authenticated;

REVOKE ALL ON public.workspace_polls FROM anon;
REVOKE ALL ON public.workspace_poll_options FROM anon;
REVOKE ALL ON public.workspace_poll_votes FROM anon;

///

CREATE OR REPLACE FUNCTION public.create_workspace_poll(
    p_workspace_id UUID,
    p_user_id UUID,
    p_question TEXT,
    p_options JSONB,
    p_description TEXT DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL,
    p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_poll_id UUID;
    v_option_count INTEGER;
    v_option TEXT;
    v_option_ids JSONB;
BEGIN
    -- Validate membership
    IF NOT EXISTS (
        SELECT 1
        FROM public.workspace_members
        WHERE workspace_id = p_workspace_id
          AND user_id = p_user_id
    ) THEN
        RAISE EXCEPTION 'You are not a member of this workspace';
    END IF;

    -- Validate question
    IF p_question IS NULL OR
       char_length(trim(p_question)) NOT BETWEEN 1 AND 300 THEN
        RAISE EXCEPTION 'Question must be between 1 and 300 characters';
    END IF;

    -- Validate options
    IF p_options IS NULL OR jsonb_typeof(p_options) <> 'array' THEN
        RAISE EXCEPTION 'Options must be a JSON array';
    END IF;

    SELECT COUNT(*)
    INTO v_option_count
    FROM jsonb_array_elements(p_options);

    IF v_option_count < 2 OR v_option_count > 10 THEN
        RAISE EXCEPTION 'A poll must have between 2 and 10 options';
    END IF;

    -- Validate each option
    FOR v_option IN
        SELECT value #>> '{}'
        FROM jsonb_array_elements(p_options)
    LOOP
        IF v_option IS NULL OR
           char_length(trim(v_option)) NOT BETWEEN 1 AND 200 THEN
            RAISE EXCEPTION 'Each option must contain between 1 and 200 characters';
        END IF;
    END LOOP;

    -- Validate expiration
    IF p_expires_at IS NOT NULL AND p_expires_at <= now() THEN
        RAISE EXCEPTION 'Expiration must be in the future';
    END IF;

    -- Validate optional shared resource
    IF p_resource_id IS NOT NULL AND NOT EXISTS (
        SELECT 1
        FROM public.workspace_resources
        WHERE id = p_resource_id
          AND workspace_id = p_workspace_id
          AND revoked_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Shared resource not found in this workspace';
    END IF;

    -- Create poll
    INSERT INTO public.workspace_polls (
        workspace_id,
        created_by,
        question,
        description,
        resource_id,
        expires_at
    )
    VALUES (
        p_workspace_id,
        p_user_id,
        trim(p_question),
        NULLIF(trim(p_description), ''),
        p_resource_id,
        p_expires_at
    )
    RETURNING id INTO v_poll_id;

    -- Create options
    INSERT INTO public.workspace_poll_options (
        poll_id,
        option_text
    )
    SELECT
        v_poll_id,
        trim(value #>> '{}')
    FROM jsonb_array_elements(p_options);

    -- Return created poll and options
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', id,
            'option_text', option_text
        )
    )
    INTO v_option_ids
    FROM public.workspace_poll_options
    WHERE poll_id = v_poll_id;

    RETURN jsonb_build_object(
        'poll_id', v_poll_id,
        'question', trim(p_question),
        'options', v_option_ids,
        'status', 'active'
    );
END;
$$;

REVOKE ALL ON FUNCTION public.create_workspace_poll(
    UUID, UUID, TEXT, JSONB, TEXT, UUID, TIMESTAMPTZ
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.create_workspace_poll(
    UUID, UUID, TEXT, JSONB, TEXT, UUID, TIMESTAMPTZ
) TO service_role;

///

