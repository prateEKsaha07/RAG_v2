import InviteMemberForm from "../components/InviteMemberForm";
import { useEffect, useState } from "react";
import {
  getWorkspaceMembers,
  updateMemberRole,
  removeWorkspaceMember,
} from "../../../api/collaborationApi";

export default function WorkspaceMembers({ workspace }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState("");

  const currentRole = workspace?.current_user_role;
  const canManageMembers = ["owner", "admin"].includes(currentRole);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getWorkspaceMembers(workspace.id);
      setMembers(data);
    } catch (err) {
      setError(err.message || "Failed to load workspace members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspace?.id) {
      loadMembers();
    }
  }, [workspace?.id]);

  const handleRoleChange = async (userId, role) => {
    try {
      setActionLoading(userId);
      setActionError("");

      await updateMemberRole(workspace.id, userId, role);
      await loadMembers();
    } catch (err) {
      setActionError(err.message || "Failed to update member role.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveMember = async (member) => {
    const name =
      member.display_name || member.username || "this member";

    const confirmed = window.confirm(
      `Are you sure you want to remove ${name} from this workspace?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(member.user_id);
      setActionError("");

      await removeWorkspaceMember(workspace.id, member.user_id);
      await loadMembers();
    } catch (err) {
      setActionError(err.message || "Failed to remove member.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <p className="text-[#8a7965]">Loading workspace members...</p>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
        <button
          onClick={loadMembers}
          className="text-sm font-medium text-red-700 hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        {canManageMembers && (
          <div className="mb-6">
            {!showInviteForm ? (
              <button
                onClick={() => {
                  setInviteSuccess("");
                  setShowInviteForm(true);
                }}
                className="px-4 py-2 rounded-md bg-[#5c1a1a] text-white text-sm hover:bg-[#4a1515]"
              >
                Invite Member
              </button>
            ) : (
              <div className="border border-[#e8dfd3] rounded-lg p-4 bg-white">
                <h3 className="font-semibold mb-3 text-[#2a1f14]">
                  Invite a Member
                </h3>

                <InviteMemberForm
                  workspaceId={workspace.id}
                  onCancel={() => setShowInviteForm(false)}
                  onSuccess={() => {
                    setShowInviteForm(false);
                    setInviteSuccess("Invitation sent successfully.");
                  }}
                />
              </div>
            )}

            {inviteSuccess && (
              <p className="text-sm text-green-600 mt-2">
                {inviteSuccess}
              </p>
            )}
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold text-[#2a1f14]">
            Workspace Members
          </h2>
          <p className="text-sm text-[#8a7965]">{members.length} members</p>
        </div>

        <button
          onClick={loadMembers}
          className="text-sm border border-[#e8dfd3] text-[#5a4a3a] px-4 py-2 rounded-lg hover:bg-[#f0e9e0]"
        >
          Refresh
        </button>
      </div>

      {actionError && (
        <p role="alert" className="text-sm text-red-700 mb-4">
          {actionError}
        </p>
      )}

      {members.length === 0 ? (
        <p className="text-[#8a7965]">No members found in this workspace.</p>
      ) : (
        <div className="space-y-3">
          {members.map((member) => {
            const isOwner = member.role === "owner";
            const isBusy = actionLoading === member.user_id;

            return (
              <div
                key={member.user_id}
                className="flex items-center justify-between gap-4 bg-white border border-[#e8dfd3] rounded-xl p-4"
              >
                {/* Member information */}
                <div className="flex items-center gap-3">
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#e8dfd3] text-[#5a4a3a] flex items-center justify-center font-medium">
                      {(
                        member.display_name ||
                        member.username ||
                        "U"
                      ).charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <p className="font-medium text-[#2a1f14]">
                      {member.display_name ||
                        member.username ||
                        "Unknown User"}
                    </p>

                    {member.username && (
                      <p className="text-sm text-[#8a7965]">
                        @{member.username}
                      </p>
                    )}

                    <p className="text-xs text-[#8a7965]">
                      Joined:{" "}
                      {member.joined_at
                        ? new Date(
                            member.joined_at
                          ).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>
                </div>

                {/* Role and management actions */}
                <div className="flex items-center gap-2">
                  {canManageMembers && !isOwner ? (
                    <>
                      <select
                        value={member.role}
                        disabled={isBusy}
                        onChange={(e) =>
                          handleRoleChange(
                            member.user_id,
                            e.target.value
                          )
                        }
                        className="border border-[#e8dfd3] rounded-lg px-3 py-2 text-sm bg-[#faf7f3] text-[#2a1f14] focus:outline-none focus:border-[#5c1a1a] disabled:opacity-50"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>

                      <button
                        disabled={isBusy}
                        onClick={() => handleRemoveMember(member)}
                        className="text-sm border border-[#e8dfd3] text-[#5a4a3a] px-4 py-2 rounded-lg hover:bg-[#f0e9e0] disabled:opacity-50"
                      >
                        {isBusy ? "Processing..." : "Remove"}
                      </button>
                    </>
                  ) : (
                    <span className="capitalize text-sm text-[#5a4a3a]">
                      {member.role}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}