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
  const fileInputRef = useRef(null);

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

  // NEW: upload a file as a "material" resource
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setUploadMessage("");

    try {
      await shareWorkspaceFile(workspace.id, file);
      setUploadMessage(`"${file.name}" uploaded successfully.`);
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to upload file.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRevoke = async (resourceId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this shared resource?"
    );

    if (!confirmed) return;

    setError("");

    try {
      await revokeWorkspaceResource(workspace.id, resourceId);
      setMessage("Resource removed successfully.");
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to remove resource.");
    }
  };

  if (loading) {
    return <p className="text-[#8a7965]">Loading workspace resources...</p>;
  }

  // CHANGED: branch by resource_type. Notes still go to SharedNoteViewer,
  // materials go to the new ResourceViewer.
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
        <h2 className="text-xl font-semibold text-[#2a1f14] mb-3">
          Share a Note
        </h2>

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

      {/* NEW: Upload a File section */}
      <section>
        <h2 className="text-xl font-semibold text-[#2a1f14] mb-3">
          Upload a File
        </h2>

        <p className="text-sm text-[#8a7965] mb-3">
          PDF, DOCX, TXT, Markdown, or images (max 25 MB)
        </p>

        <div className="flex flex-wrap gap-3 items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.md,.jpg,.jpeg,.png,.webp"
            onChange={handleFileUpload}
            disabled={uploading}
            className="text-sm text-[#2a1f14] file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-[#5c1a1a] file:text-white file:text-sm file:font-medium hover:file:bg-[#4a1515] disabled:opacity-50"
          />

          {uploading && (
            <span className="text-sm text-[#8a7965]">Uploading…</span>
          )}
        </div>

        {uploadMessage && (
          <p className="text-sm text-green-600 mt-2">{uploadMessage}</p>
        )}
      </section>

      {message && (
        <p className="text-sm text-green-600">{message}</p>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <section>
        <h2 className="text-xl font-semibold text-[#2a1f14] mb-3">
          Shared Resources
        </h2>

        {resources.length === 0 ? (
          <p className="text-[#8a7965]">
            No resources have been shared with this workspace yet.
          </p>
        ) : (
          <div className="space-y-3">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="bg-white border border-[#e8dfd3] rounded-xl p-4 flex items-center justify-between gap-4"
              >
                <div>
                  {/* CHANGED: title now shows the file name for materials */}
                  <h3 className="font-medium text-[#2a1f14]">
                    {resource.resource_type === "note"
                      ? "Shared Note"
                      : resource.title ||
                        resource.metadata?.original_filename ||
                        "Shared File"}
                  </h3>

                  <p className="text-sm text-[#8a7965]">
                    Shared on:{" "}
                    {resource.created_at
                      ? new Date(resource.created_at).toLocaleDateString()
                      : "Unknown"}
                  </p>

                  {/* NEW: MIME + size for materials */}
                  {resource.resource_type === "material" &&
                    resource.metadata?.mime_type && (
                      <p className="text-xs text-[#a89a87]">
                        {resource.metadata.mime_type}
                        {resource.metadata.file_size_bytes
                          ? ` · ${(
                              resource.metadata.file_size_bytes / 1024
                            ).toFixed(1)} KB`
                          : ""}
                      </p>
                    )}

                  {/* CHANGED: Resource ID hidden for materials (they have MIME info instead) */}
                  {resource.resource_type === "note" && (
                    <p className="text-xs text-[#a89a87]">
                      Resource ID: {resource.resource_id}
                    </p>
                  )}
                </div>

                {/* CHANGED: button label depends on type */}
                <button
                  onClick={() => setSelectedResource(resource.id)}
                  className="text-sm text-[#5c1a1a] hover:underline"
                >
                  {resource.resource_type === "note" ? "View Note" : "View File"}
                </button>
                <button
                  onClick={() => handleRevoke(resource.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
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