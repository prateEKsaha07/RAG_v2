import { useState } from "react";
import { createWorkspace } from "../../../api/collaborationApi";

export default function CreateWorkspaceForm({ onSuccess, onCancel }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Workspace name is required.");
      return;
    }

    try {
      setLoading(true);

      const workspace = await createWorkspace({
        name: name.trim(),
        description: description.trim(),
      });

      onSuccess?.(workspace);
    } catch (err) {
      setError(err.message || "Failed to create workspace.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="workspace-name">Workspace Name</label>
        <input
          id="workspace-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter workspace name"
          maxLength={100}
          required
        />
      </div>

      <div>
        <label htmlFor="workspace-description">Description</label>
        <textarea
          id="workspace-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this workspace for?"
          maxLength={2000}
          rows={4}
        />
      </div>

      {error && <p role="alert">{error}</p>}

      <div>
        <button type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </button>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Workspace"}
        </button>
      </div>
    </form>
  );
}