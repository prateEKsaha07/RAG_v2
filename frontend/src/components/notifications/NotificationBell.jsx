import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell,
  Mail,
  MessageSquare,
  Info,
} from "lucide-react";
import {
  getUnreadNotificationCount,
  listNotifications,
  markNotificationsRead,
} from "../../api/notificationsApi";

function renderNotificationContent(notification) {
  const { type, payload } = notification;

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

function formatRelative(dateString) {
  if (!dateString) return "";
  const then = new Date(dateString).getTime();
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateString).toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
}

export default function NotificationBell({ onNavigateToAll }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const wrapperRef = useRef(null);

  // Poll unread count every 30 seconds.
  useEffect(() => {
    let cancelled = false;

    async function fetchCount() {
      try {
        const res = await getUnreadNotificationCount();
        if (cancelled) return;
        setUnreadCount(res?.unread_count ?? 0);
      } catch {
        // Silent — the bell shouldn't error out the whole navbar
      }
    }

    fetchCount();
    const interval = setInterval(fetchCount, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Fetch latest notifications when dropdown opens.
  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);
    setError("");

    listNotifications({ limit: 10 })
      .then((data) => {
        if (cancelled) return;
        setNotifications(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.response?.data?.detail || "Failed to load notifications.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  // Close dropdown when clicking outside.
  // Uses 'click' (not 'mousedown') so button onClick fires first.
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [open]);

  // Centralized handler — called by both item clicks and "View all".
  const navigateToAll = useCallback(() => {
    console.log("[bell] navigateToAll fired; onNavigateToAll =", onNavigateToAll);

    if (typeof onNavigateToAll === "function") {
      onNavigateToAll();
    } else {
      // Fallback — gives the user *something* instead of a dead click.
      console.warn(
        "[bell] onNavigateToAll prop is missing. Falling back to hash navigation."
      );
      try {
        window.location.hash = "#notifications";
      } catch {
        /* no-op */
      }
    }
  }, [onNavigateToAll]);

  const handleItemClick = useCallback(
    async (notification) => {
      if (!notification.read_at) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id
              ? { ...n, read_at: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        try {
          await markNotificationsRead([notification.id]);
        } catch {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notification.id ? { ...n, read_at: null } : n
            )
          );
          setUnreadCount((prev) => prev + 1);
        }
      }

      setOpen(false);
      navigateToAll();
    },
    [navigateToAll]
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative w-9 h-9 rounded-md border border-[#e8dfd3] flex items-center justify-center text-[#5a4a3a] hover:bg-[#f0e9e0] transition-colors"
      >
        <Bell size={16} strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-[#a83232] text-white text-[10px] font-semibold flex items-center justify-center leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-[#e8dfd3] rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8dfd3]">
            <h3 className="text-sm font-semibold text-[#2a1f14]">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="text-[11px] text-[#8a7965]">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <p className="text-xs text-[#8a7965] text-center py-6">
                Loading...
              </p>
            )}

            {!loading && error && (
              <p className="text-xs text-red-600 text-center py-6 px-4">
                {error}
              </p>
            )}

            {!loading && !error && notifications.length === 0 && (
              <p className="text-xs text-[#8a7965] text-center py-6">
                No notifications yet.
              </p>
            )}

            {!loading &&
              !error &&
              notifications.map((n) => {
                const { Icon, text } = renderNotificationContent(n);
                const isUnread = !n.read_at;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(n);
                    }}
                    className={`w-full text-left px-4 py-3 border-b border-[#f0e9e0] last:border-b-0 hover:bg-[#faf7f3] transition-colors flex gap-3 ${
                      isUnread ? "bg-[#fdf8f4]" : ""
                    }`}
                  >
                    <div className="w-8 h-8 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center shrink-0">
                      <Icon
                        size={14}
                        strokeWidth={1.8}
                        className="text-[#5c1a1a]"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-[#2a1f14] leading-snug">
                        {text}
                      </p>
                      <p className="text-[10px] text-[#8a7965] mt-1">
                        {formatRelative(n.created_at)}
                      </p>
                    </div>
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-[#a83232] shrink-0 self-center" />
                    )}
                  </button>
                );
              })}
          </div>

          <button
            type="button"
            onClick={(e) => {
              console.log("[bell] View all button clicked (raw)");
              e.stopPropagation();
              setOpen(false);
              navigateToAll();
            }}
            className="w-full text-center text-xs font-medium text-[#5c1a1a] hover:bg-[#faf7f3] py-2.5 border-t border-[#e8dfd3]"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}