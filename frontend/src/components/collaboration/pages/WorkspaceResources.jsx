import SharedNoteViewer from "../components/SharedNoteViewer";
import ResourceViewer from "../components/ResourceViewer";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getWorkspaceResources,
  shareWorkspaceNote,
  revokeWorkspaceResource,
  shareWorkspaceFile,
} from "../../../api/collaborationApi";
import { getMyNotes } from "../../../api/collaborationApi";
import { supabase } from "../../../supabaseClient";

export default function WorkspaceResources({ workspace }) {
  const [resources, setResources] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState("");
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedResource, setSelectedResource] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [profiles, setProfiles] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const fileInputRef = useRef(null);

  const currentUserRole = workspace.current_user_role;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [resourceData, noteData] = await Promise.all([
        getWorkspaceResources(workspace.id),
        getMyNotes(),
      ]);
      setResources(resourceData || []);
      setNotes(noteData.notes || []);
    } catch (err) {
      setError(err.message || "Failed to load workspace resources.");
    } finally {
      setLoading(false);
    }
  }, [workspace.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Resolve current user (matches WorkspaceChat.jsx)
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data?.user?.id || null);
    };
    loadUser();
  }, []);

  // Profile lookup (unchanged)
  useEffect(() => {
    const ids = [
      ...new Set(
        resources
          .map((r) => r.shared_by)
          .filter(Boolean)
          .filter((id) => !profiles[id])
      ),
    ];
    if (ids.length === 0) return;
    let cancelled = false;
    supabase
      .from("profiles")
      .select("id, display_name, username")
      .in("id", ids)
      .then(({ data, error: supaErr }) => {
        if (cancelled || supaErr || !data) return;
        setProfiles((prev) => {
          const next = { ...prev };
          for (const p of data) next[p.id] = p;
          return next;
        });
      });
    return () => {
      cancelled = true;
    };
  }, [resources, profiles]);

  const getSharerName = (userId) => {
    const p = profiles[userId];
    return p?.display_name || p?.username || "Workspace member";
  };

  // Can the current user delete this resource?
  // Mirrors the backend RPC rule: role IN ('owner','admin') OR shared_by == currentUserId
  const canDelete = (resource) => {
    if (currentUserRole === "owner" || currentUserRole === "admin") return true;
    if (!currentUserId) return false;
    return resource.shared_by === currentUserId;
  };

  const handleShare = async (e) => {
    e.preventDefault();
    if (!selectedNoteId) return;
    setSharing(true);
    setError("");
    setMessage("");
    try {
      await shareWorkspaceNote(workspace.id, selectedNoteId);
      setSelectedNoteId("");
      setMessage("Note shared successfully.");
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to share note.");
    } finally {
      setSharing(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
    setError("");
    setUploadMessage("");
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError("");
    setUploadMessage("");
    try {
      await shareWorkspaceFile(workspace.id, selectedFile);
      setUploadMessage(`"${selectedFile.name}" uploaded successfully.`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  const handleRevoke = async (resource) => {
    const label =
      resource.resource_type === "note"
        ? "this shared note"
        : `"${resource.title || resource.metadata?.original_filename || "this file"}"`;
    const confirmed = window.confirm(
      `Are you sure you want to delete ${label} from this workspace?`
    );
    if (!confirmed) return;
    setError("");
    try {
      await revokeWorkspaceResource(workspace.id, resource.id);
      setMessage(
        resource.resource_type === "note"
          ? "Note removed successfully."
          : "File deleted successfully."
      );
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to remove resource.");
    }
  };

  if (loading) {
    return <p className="text-[#8a7965]">Loading workspace resources...</p>;
  }

  if (selectedResource) {
    const current = resources.find((r) => r.id === selectedResource);
    const isNote = current?.resource_type === "note";
    return isNote ? (
      <SharedNoteViewer
        workspaceId={workspace.id}
        resourceId={selectedResource}
        onClose={() => setSelectedResource(null)}
      />
    ) : (
      <ResourceViewer
        workspaceId={workspace.id}
        resourceId={selectedResource}
        onClose={() => setSelectedResource(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-semibold text-[#2a1f14] mb-3">Share a Note</h2>
        <form onSubmit={handleShare} className="flex flex-wrap gap-3">
          <select
            value={selectedNoteId}
            onChange={(e) => setSelectedNoteId(e.target.value)}
            required
            className="border border-[#e8dfd3] rounded-lg px-3 py-2 flex-1 min-w-48 text-sm bg-[#faf7f3] text-[#2a1f14] focus:outline-none focus:border-[#5c1a1a]"
          >
            <option value="">Select one of your notes</option>
            {notes.map((note) => (
              <option key={note.id} value={note.id}>
                {note.title || note.filename || "Untitled note"}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!selectedNoteId || sharing}
            className="px-4 py-2 rounded-lg bg-[#5c1a1a] text-white text-sm hover:bg-[#4a1515] disabled:opacity-50"
          >
            {sharing ? "Sharing..." : "Share Note"}
          </button>
        </form>
        {notes.length === 0 && (
          <p className="text-sm text-[#8a7965] mt-2">
            You don't have any notes available to share.
          </p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[#2a1f14] mb-3">Upload a File</h2>
        <p className="text-sm text-[#8a7965] mb-3">
          PDF, DOCX, TXT, Markdown, or images (max 25 MB)
        </p>
        <div className="flex flex-wrap gap-3 items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.md,.jpg,.jpeg,.png,.webp"
            onChange={handleFileSelect}
            disabled={uploading}
            className="text-sm text-[#2a1f14] file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-[#5c1a1a] file:text-white file:text-sm file:font-medium hover:file:bg-[#4a1515] disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleFileUpload}
            disabled={!selectedFile || uploading}
            className="px-4 py-2 rounded-lg bg-[#5c1a1a] text-white text-sm hover:bg-[#4a1515] disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Share File"}
          </button>
        </div>
        {selectedFile && !uploading && (
          <p className="text-sm text-[#8a7965] mt-2">
            Selected: <span className="text-[#2a1f14]">{selectedFile.name}</span>
            {" "}({(selectedFile.size / 1024).toFixed(1)} KB)
          </p>
        )}
        {uploadMessage && (
          <p className="text-sm text-green-600 mt-2">{uploadMessage}</p>
        )}
      </section>

      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <section>
        <h2 className="text-xl font-semibold text-[#2a1f14] mb-3">Shared Resources</h2>
        {resources.length === 0 ? (
          <p className="text-[#8a7965]">
            No resources have been shared with this workspace yet.
          </p>
        ) : (
          <div className="space-y-3">
            {resources.map((resource) => {
              const deletable = canDelete(resource);
              const isNote = resource.resource_type === "note";

              return (
                <div
                  key={resource.id}
                  className="bg-white border border-[#e8dfd3] rounded-xl p-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-medium text-[#2a1f14]">
                      {isNote
                        ? "Shared Note"
                        : resource.title ||
                          resource.metadata?.original_filename ||
                          "Shared File"}
                    </h3>

                    <p className="text-sm text-[#8a7965]">
                      Shared by {getSharerName(resource.shared_by)} on{" "}
                      {resource.created_at
                        ? new Date(resource.created_at).toLocaleDateString()
                        : "Unknown"}
                    </p>

                    {resource.resource_type === "material" &&
                      resource.metadata?.mime_type && (
                        <p className="text-xs text-[#a89a87]">
                          {resource.metadata.mime_type}
                          {resource.metadata.file_size_bytes
                            ? ` · ${(resource.metadata.file_size_bytes / 1024).toFixed(1)} KB`
                            : ""}
                        </p>
                      )}

                    {isNote && (
                      <p className="text-xs text-[#a89a87]">
                        Resource ID: {resource.resource_id}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <button
                      onClick={() => setSelectedResource(resource.id)}
                      className="text-sm text-[#5c1a1a] hover:underline"
                    >
                      {isNote ? "View Note" : "View File"}
                    </button>

                    {deletable && (
                      <button
                        onClick={() => handleRevoke(resource)}
                        className="text-sm text-red-600 hover:underline"
                        title={
                          currentUserRole === "owner" || currentUserRole === "admin"
                            ? "Remove as workspace admin/owner"
                            : "Remove your shared resource"
                        }
                      >
                        {isNote ? "Remove" : "Delete File"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <button
        onClick={loadData}
        className="border border-[#e8dfd3] text-[#5a4a3a] text-sm px-4 py-2 rounded-lg hover:bg-[#f0e9e0]"
      >
        Refresh
      </button>
    </div>
  );
}