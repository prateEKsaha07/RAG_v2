import CreateWorkspaceForm from "../components/CreateWorkspaceForm";
import { useEffect, useState } from "react";

import {
  getMyWorkspaces,
  getMyInvitations,
  createWorkspace,
  acceptInvitation,
  rejectInvitation,
} from "../../../api/collaborationApi";

function CollaborationHub({ user, onBack, onOpenWorkspace }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");

  const [creating, setCreating] = useState(false);
  const [processingInvitation, setProcessingInvitation] = useState(null);

  useEffect(() => {
    loadHubData();
  }, []);

  const loadHubData = async () => {
    try {
      setLoading(true);
      setError("");

      const [workspaceData, invitationData] = await Promise.all([
        getMyWorkspaces(),
        getMyInvitations(),
      ]);

      setWorkspaces(Array.isArray(workspaceData) ? workspaceData : []);

      const pendingInvitations = (Array.isArray(invitationData)
        ? invitationData
        : []
      ).filter(
        (invitation) =>
          invitation.invited_user_id === user?.id &&
          invitation.status === "pending"
      );

      setInvitations(pendingInvitations);
    } catch (err) {
      setError(err.message || "Failed to load collaboration data.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      setActionError("");
      await createWorkspace({
        name: workspaceName,
        description: workspaceDescription,
      });
      setWorkspaceName("");
      setWorkspaceDescription("");
      setShowCreateForm(false);
      await loadHubData();
    } catch (err) {
      setActionError(err.message || "Failed to create workspace.");
    } finally {
      setCreating(false);
    }
  };

  const handleInvitationResponse = async (invitationId, action) => {
    try {
      setProcessingInvitation(invitationId);
      setActionError("");

      if (action === "accept") {
        await acceptInvitation(invitationId);
      } else {
        await rejectInvitation(invitationId);
      }

      await loadHubData();
    } catch (err) {
      setActionError(err.message || "Failed to process invitation.");
    } finally {
      setProcessingInvitation(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f3] p-8">
      <button
        onClick={onBack}
        className="text-sm text-[#8a7965] hover:text-[#5c1a1a]"
      >
        Back to Dashboard
      </button>

      <div className="max-w-6xl mx-auto mt-8 space-y-8">
        <header>
          <h1 className="text-3xl font-semibold text-[#2a1f14]">Collaboration</h1>
          <p className="text-[#8a7965] mt-2">
            Connect with others and work together.
          </p>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={loadHubData}
              className="text-sm font-medium text-red-700 hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {actionError && (
          <p role="alert" className="text-sm text-red-700">
            {actionError}
          </p>
        )}

        {loading ? (
          <p className="text-[#8a7965]">Loading collaboration data...</p>
        ) : (
          <>
            {/* MY WORKSPACES */}
            <section>
              <h2 className="text-xl font-semibold text-[#2a1f14] mb-4">
                My Workspaces
              </h2>

              {workspaces.length === 0 ? (
                <p className="text-[#8a7965]">
                  You haven't joined any workspaces yet.
                </p>
              ) : (
                <ul className="grid gap-4 sm:grid-cols-2">
                  {workspaces.map((workspace) => (
                    <li
                      key={workspace.id}
                      className="bg-white border border-[#e8dfd3] rounded-xl p-5 flex flex-col gap-2"
                    >
                      <h3 className="font-semibold text-[#2a1f14]">
                        {workspace.name}
                      </h3>
                      <p className="text-sm text-[#8a7965]">
                        {workspace.description}
                      </p>
                      <p className="text-xs text-[#8a7965]">
                        Your role: {workspace.current_user_role}
                      </p>

                      <button
                        onClick={() => onOpenWorkspace(workspace)}
                        className="mt-2 self-start bg-[#5c1a1a] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#4a1515]"
                      >
                        Open
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* INVITATIONS */}
            <section>
              <h2 className="text-xl font-semibold text-[#2a1f14] mb-4">
                Pending Invitations
              </h2>

              {invitations.length === 0 ? (
                <p className="text-[#8a7965]">
                  You have no pending invitations.
                </p>
              ) : (
                <ul className="space-y-3">
                  {invitations.map((invitation) => (
                    <li
                      key={invitation.id}
                      className="bg-white border border-[#e8dfd3] rounded-xl p-4 flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="text-sm text-[#2a1f14]">
                          Workspace ID: {invitation.workspace_id}
                        </p>
                        <p className="text-xs text-[#8a7965]">
                          Status: {invitation.status}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          disabled={processingInvitation === invitation.id}
                          onClick={() =>
                            handleInvitationResponse(invitation.id, "accept")
                          }
                          className="text-sm bg-[#5c1a1a] text-white px-4 py-2 rounded-lg hover:bg-[#4a1515] disabled:opacity-50"
                        >
                          Accept
                        </button>

                        <button
                          disabled={processingInvitation === invitation.id}
                          onClick={() =>
                            handleInvitationResponse(invitation.id, "reject")
                          }
                          className="text-sm border border-[#e8dfd3] text-[#5a4a3a] px-4 py-2 rounded-lg hover:bg-[#f0e9e0] disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* WORKSPACE ACTIONS */}
            <section>
              <h2 className="text-xl font-semibold text-[#2a1f14] mb-4">
                Workspace Actions
              </h2>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setActionError("");
                    setShowCreateForm((prev) => !prev);
                  }}
                  className="bg-[#5c1a1a] text-white text-sm px-5 py-2.5 rounded-lg hover:bg-[#4a1515]"
                >
                  {showCreateForm ? "Cancel" : "Create Workspace"}
                </button>

                <button
                  onClick={() =>
                    setActionError(
                      "Joining a workspace is currently handled through invitations."
                    )
                  }
                  className="border border-[#e8dfd3] text-[#5a4a3a] text-sm px-5 py-2.5 rounded-lg hover:bg-[#f0e9e0]"
                >
                  Join Workspace
                </button>
              </div>

              {showCreateForm && (
                <form
                  onSubmit={handleCreateWorkspace}
                  className="mt-6 bg-white border border-[#e8dfd3] rounded-xl p-6 space-y-4"
                >
                  <div className="space-y-1">
                    <label
                      htmlFor="workspaceName"
                      className="block text-sm font-medium text-[#2a1f14]"
                    >
                      Workspace Name
                    </label>
                    <input
                      id="workspaceName"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      minLength={1}
                      maxLength={100}
                      required
                      className="w-full border border-[#e8dfd3] rounded-lg px-3 py-2 text-sm bg-[#faf7f3] focus:outline-none focus:border-[#5c1a1a]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="workspaceDescription"
                      className="block text-sm font-medium text-[#2a1f14]"
                    >
                      Description
                    </label>
                    <textarea
                      id="workspaceDescription"
                      value={workspaceDescription}
                      onChange={(e) =>
                        setWorkspaceDescription(e.target.value)
                      }
                      maxLength={2000}
                      rows={3}
                      className="w-full border border-[#e8dfd3] rounded-lg px-3 py-2 text-sm bg-[#faf7f3] focus:outline-none focus:border-[#5c1a1a]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={creating}
                    className="bg-[#5c1a1a] text-white text-sm px-5 py-2.5 rounded-lg hover:bg-[#4a1515] disabled:opacity-50"
                  >
                    {creating ? "Creating..." : "Create"}
                  </button>
                </form>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default CollaborationHub;