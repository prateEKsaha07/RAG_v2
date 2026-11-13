import { useEffect, useState } from "react";
import {
  ClipboardList,
  BarChart3,
  FileText,
  FolderOpen,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

// Maps reference type to a display label and icon.
const TYPE_CONFIG = {
  task:     { label: "Task",     icon: ClipboardList },
  poll:     { label: "Poll",     icon: BarChart3 },
  note:     { label: "Note",     icon: FileText },
  material: { label: "File",     icon: FolderOpen },
};

// Resolve the referenced entity's display title. Calls one of the
// read endpoints per type. Returns:
//   { title, exists: true }  — entity present and readable
//   { title: null, exists: false } — entity gone / deleted / revoked / 404
function useReferenceTitle(workspaceId, type, id) {
  const [state, setState] = useState({ title: null, exists: true, loading: true });

  useEffect(() => {
    if (!workspaceId || !type || !id) {
      setState({ title: null, exists: false, loading: false });
      return;
    }

    let cancelled = false;
    setState({ title: null, exists: true, loading: true });

    const baseUrl = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("access_token");

    // Endpoint shape per type. Each resolves to a title string.
    async function load() {
      try {
        if (type === "task") {
          // Tasks come back as a list; find by id
          const res = await fetch(
            `${baseUrl}/collaboration/workspaces/${workspaceId}/tasks`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const body = await res.json();
          const list = body.tasks || [];
          const found = list.find((t) => t.id === id);
          if (cancelled) return;
          if (!found) setState({ title: null, exists: false, loading: false });
          else setState({ title: found.title, exists: true, loading: false });

        } else if (type === "poll") {
          const res = await fetch(
            `${baseUrl}/collaboration/polls/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (res.status === 404) {
            if (!cancelled) setState({ title: null, exists: false, loading: false });
            return;
          }
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const body = await res.json();
          if (!cancelled) {
            const poll = body.poll || body;
            setState({ title: poll.question, exists: true, loading: false });
          }

        } else if (type === "note" || type === "material") {
          const res = await fetch(
            `${baseUrl}/collaboration/workspaces/${workspaceId}/resources/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (res.status === 404) {
            if (!cancelled) setState({ title: null, exists: false, loading: false });
            return;
          }
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const body = await res.json();
          if (!cancelled) {
            setState({
              title: body.title || body.filename || "(untitled)",
              exists: true,
              loading: false,
            });
          }
        } else {
          if (!cancelled) setState({ title: null, exists: false, loading: false });
        }
      } catch {
        if (!cancelled) setState({ title: null, exists: true, loading: false });
      }
    }

    load();
    return () => { cancelled = true; };
  }, [workspaceId, type, id]);

  return state;
}

export default function ReferenceChip({
  workspaceId,
  referencedType,
  referencedId,
  onOpen,
}) {
  const config = TYPE_CONFIG[referencedType] || TYPE_CONFIG.task;
  const Icon = config.icon;
  const { title, exists, loading } = useReferenceTitle(
    workspaceId,
    referencedType,
    referencedId
  );

  const clickable = exists && !loading && typeof onOpen === "function";

  const handleClick = () => {
    if (!clickable) return;
    onOpen({ type: referencedType, id: referencedId });
  };

  // Muted state when entity was deleted
  if (!exists && !loading) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#e8dfd3] bg-[#f0e9e0]/50 text-[#8a7965] text-[11px] mb-1.5">
        <AlertCircle size={11} strokeWidth={1.8} />
        <span>{config.label} deleted</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!clickable}
      title={clickable ? `Open ${config.label}` : undefined}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] mb-1.5 transition-colors ${
        clickable
          ? "border-[#e8dfd3] bg-[#faf7f3] text-[#5a4a3a] hover:border-[#5c1a1a]/40 hover:text-[#5c1a1a] cursor-pointer"
          : "border-[#e8dfd3] bg-[#faf7f3] text-[#8a7965] cursor-default"
      }`}
    >
      <Icon size={11} strokeWidth={1.8} />
      <span className="font-medium">{config.label}:</span>
      <span className="truncate max-w-[220px]">
        {loading ? "Loading…" : title || "(untitled)"}
      </span>
      {clickable && <ExternalLink size={10} strokeWidth={1.8} className="ml-0.5 opacity-60" />}
    </button>
  );
}