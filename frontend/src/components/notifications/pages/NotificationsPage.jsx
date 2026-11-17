import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  Mail,
  MessageSquare,
  Info,
  CheckCheck,
} from "lucide-react";
import {
  listNotifications,
  markNotificationsRead,
} from "./../../../api/notificationsApi";

function renderNotificationContent(n) {
  const { type, payload } = n;

  switch (type) {
    case "invitation_received":
      return {
        Icon: Mail,
        text: (
          <>
            <span className="font-medium">
              {payload?.inviter_name || "Someone"}
            </span>{" "}
            invited you to{" "}
            <span className="font-medium">
              {payload?.workspace_name || "a workspace"}
            </span>
          </>
        ),
      };
    case "task_comment_added":
      return {
        Icon: MessageSquare,
        text: (
          <>
            <span className="font-medium">
              {payload?.commenter_name || "Someone"}
            </span>{" "}
            commented on your task{" "}
            <span className="font-medium">
              {payload?.task_title || ""}
            </span>
            {payload?.comment_preview ? `: "${payload.comment_preview}"` : ""}
          </>
        ),
      };
    default:
      return {
        Icon: Info,
        text: <>{type?.replaceAll("_", " ") || "Activity"}</>,
      };
  }
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleString([], {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const SOURCE_TABS = [
  { id: "all", label: "All" },
  { id: "collaboration", label: "Collaboration" },
  { id: "friends", label: "Friends" },
  { id: "system", label: "System" },
];

export default function NotificationsPage({ onBack }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [markingAll, setMarkingAll] = useState(false);

  const PAGE_SIZE = 20;

  const load = useCallback(async (loadMore = false) => {
    if (loadMore) setLoadingMore(true);
    else setLoading(true);

    setError("");

    try {
      const before =
        loadMore && notifications.length > 0
          ? notifications[notifications.length - 1].created_at
          : null;

      const data = await listNotifications({
        limit: PAGE_SIZE,
        before,
      });
      const items = Array.isArray(data) ? data : [];

      if (loadMore) {
        setNotifications((prev) => {
          const ids = new Set(prev.map((x) => x.id));
          return [...prev, ...items.filter((x) => !ids.has(x.id))];
        });
      } else {
        setNotifications(items);
      }

      setHasMore(items.length === PAGE_SIZE);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible =
    sourceFilter === "all"
      ? notifications
      : notifications.filter((n) => n.source === sourceFilter);

  const unreadVisible = visible.filter((n) => !n.read_at);

  const markOneRead = async (notification) => {
    if (notification.read_at) return;

    // Optimistic
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id
          ? { ...n, read_at: new Date().toISOString() }
          : n
      )
    );

    try {
      await markNotificationsRead([notification.id]);
    } catch {
      // Revert
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, read_at: null } : n
        )
      );
    }
  };

  const markAllRead = async () => {
    if (unreadVisible.length === 0 || markingAll) return;

    setMarkingAll(true);
    const ids = unreadVisible.map((n) => n.id);

    // Optimistic
    setNotifications((prev) =>
      prev.map((n) =>
        ids.includes(n.id) ? { ...n, read_at: new Date().toISOString() } : n
      )
    );

    try {
      await markNotificationsRead(ids);
    } catch {
      // Revert
      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n.id) ? { ...n, read_at: null } : n))
      );
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f3ee] text-[#2a1f14]">
      <main className="max-w-3xl mx-auto px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <button
              onClick={onBack}
              className="text-sm text-[#8a7965] hover:text-[#5c1a1a] mb-3"
            >
              ← Back
            </button>
            <p className="text-[11px] tracking-[0.14em] uppercase text-[#8a7965] mb-1.5">
              Notifications
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2a1f14] mb-1">
              All Notifications
            </h1>
            <p className="text-sm text-[#8a7965]">
              {unreadVisible.length > 0
                ? `${unreadVisible.length} unread`
                : "You're all caught up."}
            </p>
          </div>

          <button
            onClick={markAllRead}
            disabled={unreadVisible.length === 0 || markingAll}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-[#5c1a1a]/40 text-[#5c1a1a] hover:bg-[#faf3ee]"
          >
            <CheckCheck size={14} strokeWidth={1.8} />
            {markingAll ? "Marking..." : "Mark all as read"}
          </button>
        </div>

        {/* Source filter tabs */}
        <div className="flex flex-wrap gap-2 mb-5">
          {SOURCE_TABS.map((tab) => {
            const isActive = sourceFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSourceFilter(tab.id)}
                className={`px-3.5 py-2 rounded-full text-xs font-medium transition-colors border ${
                  isActive
                    ? "bg-[#5c1a1a] text-white border-[#5c1a1a]"
                    : "bg-white text-[#5a4a3a] border-[#e8dfd3] hover:border-[#5c1a1a]/40"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Errors */}
        {error && (
          <p className="text-sm text-red-600 mb-4">{error}</p>
        )}

        {/* List */}
        {loading ? (
          <div className="bg-white border border-[#e8dfd3] rounded-lg p-8 text-center">
            <p className="text-sm text-[#8a7965]">Loading notifications...</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="bg-white border border-[#e8dfd3] rounded-lg p-12 text-center">
            <div className="w-12 h-12 rounded-md border border-[#e8dfd3] bg-[#faf7f3] mx-auto flex items-center justify-center mb-4">
              <Bell size={20} strokeWidth={1.8} className="text-[#5c1a1a]" />
            </div>
            <h3 className="text-lg font-semibold text-[#2a1f14] mb-2">
              {sourceFilter === "all"
                ? "No notifications yet"
                : `No ${sourceFilter} notifications`}
            </h3>
            <p className="text-sm text-[#8a7965]">
              {sourceFilter === "all"
                ? "When something happens in your workspaces, you'll see it here."
                : "Try a different filter."}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-[#e8dfd3] rounded-lg divide-y divide-[#f0e9e0] overflow-hidden">
            {visible.map((n) => {
              const { Icon, text } = renderNotificationContent(n);
              const isUnread = !n.read_at;

              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markOneRead(n)}
                  className={`w-full text-left px-4 py-3 flex gap-3 transition-colors hover:bg-[#faf7f3] ${
                    isUnread ? "bg-[#fdf8f4]" : ""
                  }`}
                >
                  <div className="w-9 h-9 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center shrink-0">
                    <Icon
                      size={15}
                      strokeWidth={1.8}
                      className="text-[#5c1a1a]"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#2a1f14] leading-snug">
                      {text}
                    </p>
                    <p className="text-xs text-[#8a7965] mt-1">
                      {formatDate(n.created_at)}
                      {n.source && (
                        <>
                          <span className="mx-1.5">·</span>
                          <span className="capitalize">{n.source}</span>
                        </>
                      )}
                    </p>
                  </div>
                  {isUnread && (
                    <span className="w-2 h-2 rounded-full bg-[#a83232] shrink-0 self-center" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Load more */}
        {!loading && hasMore && visible.length > 0 && (
          <div className="text-center mt-4">
            <button
              onClick={() => load(true)}
              disabled={loadingMore}
              className="text-sm text-[#5c1a1a] font-medium hover:underline disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}