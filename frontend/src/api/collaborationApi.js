
import apiClient from "./client";

// WORKSPACES

export const getMyWorkspaces = () =>
  apiClient.get("/collaboration/workspaces");

export const createWorkspace = (workspaceData) =>
  apiClient.post("/collaboration/workspaces", workspaceData);

// INVITATIONS
export const getMyInvitations = () =>
  apiClient.get("/collaboration/invitations");

export const inviteMember = (workspaceId, email) =>
  apiClient.post(
    `/collaboration/workspaces/${workspaceId}/invitations`,
    { email }
  );

export const acceptInvitation = (invitationId) =>
  apiClient.post(
    `/collaboration/invitations/${invitationId}/accept`
  );

export const rejectInvitation = (invitationId) =>
  apiClient.post(
    `/collaboration/invitations/${invitationId}/reject`
  );


// WORKSPACE MEMBERS

export const getWorkspaceMembers = (workspaceId) =>
  apiClient.get(`/collaboration/workspaces/${workspaceId}/members`);

export const updateMemberRole = (workspaceId, userId, role) =>
  apiClient.patch(
    `/collaboration/workspaces/${workspaceId}/members/${userId}/role`,
    { role }
  );

export const removeWorkspaceMember = (workspaceId, userId) =>
  apiClient.delete(
    `/collaboration/workspaces/${workspaceId}/members/${userId}`
  );


// Shared resources
export const shareWorkspaceNote = (workspaceId, noteId) =>
  apiClient.post(
    `/collaboration/workspaces/${workspaceId}/resources/notes`,
    { note_id: noteId }
  );

export const getWorkspaceResources = (workspaceId) =>
  apiClient.get(
    `/collaboration/workspaces/${workspaceId}/resources`
  );

export const revokeWorkspaceResource = (workspaceId, resourceId) =>
  apiClient.delete(
    `/collaboration/workspaces/${workspaceId}/resources/${resourceId}`
  );

// WORKSPACE MESSAGES

export const getWorkspaceMessages = (workspaceId, params = {}) =>
  apiClient.get(
    `/collaboration/workspaces/${workspaceId}/messages`,
    { params }
  );

export const sendWorkspaceMessage = (workspaceId, content) =>
  apiClient.post(
    `/collaboration/workspaces/${workspaceId}/messages`,
    { content }
  );


// WORKSPACE ACTIVITY

export const getWorkspaceUpdates = (workspaceId, params = {}) =>
  apiClient.get(
    `/collaboration/workspaces/${workspaceId}/updates`,
    { params }
  );


// POLLS

export const getWorkspacePolls = (workspaceId) =>
  apiClient.get(`/collaboration/workspaces/${workspaceId}/polls`);

export const getPollDetails = (pollId) =>
  apiClient.get(`/collaboration/polls/${pollId}`);

export const createWorkspacePoll = (workspaceId, pollData) =>
  apiClient.post(
    `/collaboration/workspaces/${workspaceId}/polls`,
    pollData
  );

export const voteOnPoll = (pollId, optionId) =>
  apiClient.post(
    `/collaboration/polls/${pollId}/vote`,
    { option_id: optionId }
  );

export const closePoll = (pollId) =>
  apiClient.patch(`/collaboration/polls/${pollId}/close`);

export const setPollPin = (pollId, isPinned) =>
  apiClient.patch(
    `/collaboration/polls/${pollId}/pin`,
    { is_pinned: isPinned }
  );
// TASKS
export const getWorkspaceTasks = (workspaceId) =>
  apiClient.get(`/collaboration/workspaces/${workspaceId}/tasks`);

export const createWorkspaceTask = (workspaceId, taskData) =>
  apiClient.post(
    `/collaboration/workspaces/${workspaceId}/tasks`,
    taskData
  );

export const updateWorkspaceTask = (taskId, taskData) =>
  apiClient.patch(`/collaboration/tasks/${taskId}`, taskData);

export const deleteWorkspaceTask = (taskId) =>
  apiClient.delete(`/collaboration/tasks/${taskId}`);

// TASK COMMENTS
export const getTaskComments = (taskId) =>
  apiClient.get(`/collaboration/tasks/${taskId}/comments`);

export const addTaskComment = (taskId, content) =>
  apiClient.post(
    `/collaboration/tasks/${taskId}/comments`,
    { content }
  );

export const getMyNotes = () => apiClient.get("/notes");

export const getSharedNote = (workspaceId, resourceId) =>
  apiClient.get(
    `/collaboration/workspaces/${workspaceId}/resources/${resourceId}/note`
  );

