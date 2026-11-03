
import { useState } from "react";
import { inviteMember } from "../../../api/collaborationApi";

export default function InviteMemberForm({
  workspaceId,
  onSuccess,
  onCancel,
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      await inviteMember(workspaceId, email.trim());
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Failed to send invitation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">
          Member Email
        </label>

        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          className="w-full border rounded-md px-3 py-2"
        />
      </div>

      <p className="text-sm text-gray-500">
        The user must already have a registered account.
      </p>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-md bg-burgundy-700 text-white disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Invitation"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 border rounded-md"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
