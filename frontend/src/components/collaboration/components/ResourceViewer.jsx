import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { getSharedResource } from "../../../api/collaborationApi";

export default function ResourceViewer({ workspaceId, resourceId, onClose }) {
  const [state, setState] = useState({ status: "loading" });
  const [textContent, setTextContent] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getSharedResource(workspaceId, resourceId);
        if (cancelled) return;

        // For text-based files we need a second fetch to get the body —
        // the signed URL is direct, not proxied through our API.
        const mt = data.mime_type || "";
        const needsTextFetch =
          data.resource_type === "material" &&
          (mt.startsWith("text/") || mt === "text/markdown");

        if (needsTextFetch) {
          const res = await fetch(data.url);
          if (!res.ok) throw new Error(`Failed to fetch file (${res.status})`);
          const text = await res.text();
          if (cancelled) return;
          setTextContent(text);
        }

        setState({ status: "ready", data });
      } catch (err) {
        if (!cancelled) {
          setState({
            status: "error",
            error: err?.response?.data?.detail || err.message || "Unknown error",
          });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [workspaceId, resourceId]);

  // ----- Loading / error states -----
  if (state.status === "loading") {
    return (
      <div className="p-4 space-y-4">
        <button
          onClick={onClose}
          className="text-sm text-[#5c1a1a] hover:underline"
        >
          ← Back
        </button>
        <p className="text-[#8a7965]">Loading…</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="p-4 space-y-4">
        <button
          onClick={onClose}
          className="text-sm text-[#5c1a1a] hover:underline"
        >
          ← Back
        </button>
        <p className="text-red-600">Failed to load: {state.error}</p>
      </div>
    );
  }

  const { data } = state;
  const mime = data.mime_type || "";
  const url = data.url;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#2a1f14]">
          {data.title || data.filename || "Shared File"}
        </h2>
        <button
          onClick={onClose}
          className="text-sm text-[#5c1a1a] hover:underline"
        >
          ← Back
        </button>
      </div>

      {/* Image */}
      {mime.startsWith("image/") && (
        <img
          src={url}
          alt={data.title || "Shared image"}
          className="max-w-full rounded-lg"
        />
      )}

      {/* PDF */}
      {mime === "application/pdf" && (
        <iframe
          src={url}
          title={data.title || "PDF"}
          className="w-full border border-[#e8dfd3] rounded-lg"
          style={{ height: "80vh" }}
        />
      )}

      {/* DOCX */}
      {mime ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && (
        <iframe
          src={`https://docs.google.com/viewer?url=${encodeURIComponent(
            url
          )}&embedded=true`}
          title={data.title || "DOCX"}
          className="w-full border border-[#e8dfd3] rounded-lg"
          style={{ height: "80vh" }}
        />
      )}

      {/* Markdown */}
      {mime === "text/markdown" && (
        <article className="markdown-body text-[#2a1f14]">
          <ReactMarkdown>{stripFrontmatter(textContent)}</ReactMarkdown>
        </article>
      )}

      {/* Plain text */}
      {mime === "text/plain" && (
        <pre className="whitespace-pre-wrap break-words text-[#2a1f14] bg-[#faf7f3] p-4 rounded-lg">
          {textContent}
        </pre>
      )}

      {/* Anything else — download link */}
      {!mime.startsWith("image/") &&
        mime !== "application/pdf" &&
        mime !==
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
        mime !== "text/markdown" &&
        mime !== "text/plain" && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-[#5c1a1a] underline"
          >
            Download {data.filename || "file"}
          </a>
        )}
    </div>
  );
}

// Strip the YAML frontmatter block your create_note() writes at the top
// of every .md file, so the Markdown renderer doesn't show it as text.
function stripFrontmatter(text) {
  if (!text || !text.startsWith("---")) return text;
  const end = text.indexOf("\n---", 3);
  if (end === -1) return text;
  return text.slice(end + 4).replace(/^\s+/, "");
}