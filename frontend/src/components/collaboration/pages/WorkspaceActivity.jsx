
import { useEffect, useState } from "react";
import { getWorkspaceUpdates } from "../../../api/collaborationApi";
import { supabase } from "../../../supabaseClient";

function formatDate(date) {
  if (!date) return "";

  const value = new Date(date);
  const today = new Date();

  if (value.toDateString() === today.toDateString()) {
    return value.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return value.toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
}

function getActivityDescription(activity) {
  switch (activity.event_type) {
    case "member_joined":
      return "joined the workspace";

    case "message_sent":
      return "sent a message";

    case "task_created":
      return "created a task";

    case "task_updated":
      return "updated a task";

    case "task_deleted":
      return "deleted a task";

    case "task_comment_added":
      return "commented on a task";

    default:
      return (
        activity.event_type
          ?.replaceAll("_", " ")
          .replace(/\b\w/g, (char) => char.toUpperCase()) ||
        "performed an activity"
      );
  }
}

function getActivityIcon(eventType) {
  switch (eventType) {
    case "member_joined":
      return "👤";
    case "message_sent":
      return "💬";
    case "task_created":
      return "+";
    case "task_updated":
      return "↻";
    case "task_deleted":
      return "−";
    case "task_comment_added":
      return "✎";
    default:
      return "•";
  }
}

export default function WorkspaceActivity({ workspace }) {
  const [activities, setActivities] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");

  async function loadActivities(loadMore = false) {
    if (loadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const after =
        loadMore && activities.length > 0
          ? activities[0].created_at
          : null;

      const response = await getWorkspaceUpdates(
        workspace.id,
        20,
        after
      );

      const updates = Array.isArray(response?.updates)
        ? response.updates
        : [];

      if (loadMore) {
        setActivities((previous) => {
          const existingIds = new Set(
            previous.map((item) => item.id)
          );

          const uniqueUpdates = updates.filter(
            (item) => !existingIds.has(item.id)
          );

          return [...uniqueUpdates, ...previous].sort(
            (a, b) =>
              new Date(b.created_at) - new Date(a.created_at)
          );
        });
      } else {
        setActivities(
          [...updates].sort(
            (a, b) =>
              new Date(b.created_at) - new Date(a.created_at)
          )
        );
      }

      setHasMore(Boolean(response?.has_more));
    } catch (err) {
      setError(err.message || "Unable to load workspace activity.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    loadActivities();
    // Load the first page when the selected workspace changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace.id]);

  // Load profiles for activity actors.
  useEffect(() => {
    const actorIds = [
      ...new Set(
        activities
          .map((activity) => activity.actor_id)
          .filter((id) => id && !profiles[id])
      ),
    ];

    if (actorIds.length === 0) return;

    let cancelled = false;

    async function loadProfiles() {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, username, avatar_url")
        .in("id", actorIds);

      if (error) {
        console.error("Unable to load activity profiles:", error);
        return;
      }

      if (cancelled || !data) return;

      setProfiles((previous) => {
        const updated = { ...previous };

        data.forEach((profile) => {
          updated[profile.id] = profile;
        });

        return updated;
      });
    }

    loadProfiles();

    return () => {
      cancelled = true;
    };
  }, [activities, profiles]);

  if (loading) {
    return <p className="text-sm text-gray-500">Loading activity...</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Workspace Activity</h2>
          <p className="text-xs text-gray-500">
            Recent updates in {workspace.name}
          </p>
        </div>

        <button
          onClick={() => loadActivities()}
          className="text-xs text-burgundy-700 font-medium hover:underline"
        >
          Refresh
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {activities.length === 0 ? (
        <div className="border rounded-lg p-6 text-center">
          <p className="text-sm font-medium">No activity yet</p>
          <p className="text-xs text-gray-500 mt-1">
            Workspace activities will appear here.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          {activities.map((activity) => {
            const profile = profiles[activity.actor_id];
            const displayName =
              profile?.display_name ||
              profile?.username ||
              "Workspace member";

            return (
              <div
                key={activity.id}
                className="px-3 py-2 flex items-center gap-2"
              >
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-sm">
                  {getActivityIcon(activity.event_type)}
                </div>

                <div className="flex-1 min-w-0 flex items-center gap-1 text-sm">
                  {profile?.avatar_url && (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="w-5 h-5 rounded-full object-cover shrink-0"
                    />
                  )}

                  <span className="font-medium truncate">
                    {displayName}
                  </span>

                  <span className="text-gray-600 truncate">
                    {getActivityDescription(activity)}
                  </span>
                </div>

                <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                  {formatDate(activity.created_at)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => loadActivities(true)}
            disabled={loadingMore}
            className="text-xs text-burgundy-700 font-medium hover:underline disabled:opacity-50"
          >
            {loadingMore ? "Loading..." : "Load older activity"}
          </button>
        </div>
      )}
    </div>
  );
}
