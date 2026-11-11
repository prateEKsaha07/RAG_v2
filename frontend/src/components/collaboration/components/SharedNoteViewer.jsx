import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { getSharedResource } from "../../../api/collaborationApi";

// Remove the YAML frontmatter block your create_note() writes at the top,
// so ReactMarkdown doesn't render it as a horizontal rule + raw text.
function stripFrontmatter(text) {
  if (!text || !text.startsWith("---")) return text;
  const end = text.indexOf("\n---", 3);
  if (end === -1) return text;
  return text.slice(end + 4).replace(/^\s+/, "");
}

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

        // Unified endpoint handles notes and materials; this viewer only
        // receives notes, but the shape for 'note' is identical to before.
        const data = await getSharedResource(workspaceId, resourceId);
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
      <button onClick={onClose}>← Back to Resources</button>

      <header>
        <h2 className="text-2xl font-semibold">{note.title}</h2>
        <p className="text-sm text-gray-500">
          Subject: {note.subject || "Uncategorized"}
        </p>
      </header>

      {/* FIXED: render Markdown instead of raw text */}
      <article className="border rounded-lg p-5 markdown-body">
        <ReactMarkdown>{stripFrontmatter(note.content || "")}</ReactMarkdown>
      </article>
    </section>
  );
}