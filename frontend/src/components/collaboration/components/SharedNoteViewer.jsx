
import { useEffect, useState } from "react";
import { getSharedNote } from "../../../api/collaborationApi";

export default function SharedNoteViewer({
  workspaceId,
  resourceId,
  onClose,
}) {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadNote = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getSharedNote(workspaceId, resourceId);
        setNote(data);
      } catch (err) {
        setError(err.message || "Unable to load shared note.");
      } finally {
        setLoading(false);
      }
    };

    loadNote();
  }, [workspaceId, resourceId]);

  if (loading) return <p>Loading shared note...</p>;

  if (error) {
    return (
      <div>
        <p className="text-red-600">{error}</p>
        <button onClick={onClose}>Back to Resources</button>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <button onClick={onClose}>
        ← Back to Resources
      </button>

      <header>
        <h2 className="text-2xl font-semibold">{note.title}</h2>
        <p className="text-sm text-gray-500">
          Subject: {note.subject || "Uncategorized"}
        </p>
      </header>

      <article className="border rounded-lg p-5 whitespace-pre-wrap break-words">
        {note.content}
      </article>
    </section>
  );
}
