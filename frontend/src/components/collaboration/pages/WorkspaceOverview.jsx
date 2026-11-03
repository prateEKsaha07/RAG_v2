
import { useEffect, useState } from "react";

import WorkspaceMembers from "./WorkspaceMembers";
import WorkspaceResources from "./WorkspaceResources";
import WorkspaceTasks from "./WorkspaceTasks";
import WorkspacePolls from "./WorkspacePolls";
import WorkspaceChat from "./WorkspaceChat";
import WorkspaceActivity from "./WorkspaceActivity";

import {
  getWorkspaceMembers,
  getWorkspaceResources,
  getWorkspaceTasks,
  getWorkspacePolls,
  getWorkspaceMessages,
  getWorkspaceUpdates,
} from "../../../api/collaborationApi";

function getList(response, key) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.[key])) return response[key];
  return [];
}

function formatDate(date) {
  if (!date) return "";

  return new Date(date).toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
}

function formatTime(date) {
  if (!date) return "";

  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMemberName(member) {
  return (
    member?.display_name ||
    member?.profile?.display_name ||
    member?.username ||
    member?.profile?.username ||
    "Workspace member"
  );
}

function getActorName(item, type = "actor") {
  const profile =
    item?.profile ||
    item?.[`${type}_profile`] ||
    {};

  return (
    item?.[`${type}_name`] ||
    item?.display_name ||
    profile?.display_name ||
    item?.[`${type}_username`] ||
    item?.username ||
    profile?.username ||
    "Workspace member"
  );
}

function getActivityDescription(eventType) {
  const descriptions = {
    member_joined: "Joined the workspace",
    message_sent: "Sent a message",
    task_created: "Created a task",
    task_updated: "Updated a task",
    task_deleted: "Deleted a task",
    task_comment_added: "Commented on a task",
    resource_shared: "Shared a resource",
    resource_removed: "Removed a resource",
    invitation_sent: "Invited a member",
    invitation_accepted: "Accepted an invitation",
  };

  return (
    descriptions[eventType] ||
    (eventType || "Workspace activity").replaceAll("_", " ")
  );
}

function SectionHeader({ title, onViewAll }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-semibold text-gray-800">{title}</h2>

      {onViewAll && (
        <button
          onClick={onViewAll}
          className="text-xs font-medium text-burgundy-700 hover:underline"
        >
          View all
        </button>
      )}
    </div>
  );
}

function PreviewCard({ children, className = "" }) {
  return (
    <section
      className={`bg-white border border-gray-200 rounded-xl p-4 ${className}`}
    >
      {children}
    </section>
  );
}

function EmptyMessage({ children = "Nothing to show yet." }) {
  return (
    <p className="text-xs text-gray-400 py-3 text-center">
      {children}
    </p>
  );
}

function SummaryCard({ label, value, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-3 text-left hover:border-burgundy-300 transition"
    >
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-semibold text-gray-800 mt-1">
        {value}
      </p>
    </button>
  );
}

export default function WorkspaceOverview({
  workspace,
  onNavigate,
  activeSection = "overview",
}) {
  const [dashboard, setDashboard] = useState({
    members: [],
    resources: [],
    tasks: [],
    polls: [],
    updates: [],
    messages: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!workspace?.id) return;

    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      const results = await Promise.allSettled([
        getWorkspaceMembers(workspace.id),
        getWorkspaceResources(workspace.id),
        getWorkspaceTasks(workspace.id),
        getWorkspacePolls(workspace.id),
        getWorkspaceUpdates(workspace.id, 5),
        getWorkspaceMessages(workspace.id, 5),
      ]);

      if (cancelled) return;

      const [
        members,
        resources,
        tasks,
        polls,
        updates,
        messages,
      ] = results;

      setDashboard({
        members:
          members.status === "fulfilled"
            ? getList(members.value, "members")
            : [],
        resources:
          resources.status === "fulfilled"
            ? getList(resources.value, "resources")
            : [],
        tasks:
          tasks.status === "fulfilled"
            ? getList(tasks.value, "tasks")
            : [],
        polls:
          polls.status === "fulfilled"
            ? getList(polls.value, "polls")
            : [],
        updates:
          updates.status === "fulfilled"
            ? getList(updates.value, "updates")
            : [],
        messages:
          messages.status === "fulfilled"
            ? getList(messages.value, "messages")
            : [],
      });

      if (results.some((result) => result.status === "rejected")) {
        setError("Some workspace information could not be loaded.");
      }

      setLoading(false);
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [workspace?.id, activeSection]);

  if (!workspace) {
    return <p className="text-sm text-gray-500">Workspace not found.</p>;
  }

  const pendingTasks = dashboard.tasks.filter(
    (task) =>
      task.status !== "completed" &&
      task.status !== "cancelled"
  );

  const activePolls = dashboard.polls.filter(
    (poll) => poll.status === "active"
  );

  console.log("Dashboard polls:", dashboard.polls);
  console.log("Active polls:", activePolls);

  const recentTasks = [...dashboard.tasks]
    .sort(
      (a, b) =>
        new Date(b.created_at || 0) -
        new Date(a.created_at || 0)
    )
    .slice(0, 5);

  const recentUpdates = [...dashboard.updates]
    .sort(
      (a, b) =>
        new Date(b.created_at || 0) -
        new Date(a.created_at || 0)
    )
    .slice(0, 5);

  const recentMessages = [...dashboard.messages]
    .sort(
      (a, b) =>
        new Date(b.created_at || 0) -
        new Date(a.created_at || 0)
    )
    .slice(0, 5);

  const recentResources = dashboard.resources.slice(0, 5);
  const recentMembers = dashboard.members.slice(0, 5);

  // Center section content
  function renderMainContent() {
    if (activeSection === "messages") {
      return <WorkspaceChat workspace={workspace} />;
    }

    if (activeSection === "activity") {
      return <WorkspaceActivity workspace={workspace} />;
    }

    if (activeSection === "members") {
      return <WorkspaceMembers workspace={workspace} />;
    }

    if (activeSection === "resources") {
      return <WorkspaceResources workspace={workspace} />;
    }

    if (activeSection === "tasks") {
      return <WorkspaceTasks workspace={workspace} />;
    }

    if (activeSection === "polls") {
      return <WorkspacePolls workspace={workspace} />;
    }

    if (activeSection !== "overview") {
      return (
        <p className="text-sm text-gray-500">
          This section is not implemented yet.
        </p>
      );
    }

    return (
      <div className="space-y-5">
        {/* Workspace heading */}
        <header className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex flex-wrap justify-between items-start gap-3">
            <div>
              <p className="text-xs text-burgundy-700 font-semibold uppercase tracking-wide">
                Workspace
              </p>

              <h1 className="text-2xl font-semibold text-gray-900 mt-1">
                {workspace.name}
              </h1>

              <p className="text-sm text-gray-500 mt-2">
                {workspace.description || "Welcome to your workspace."}
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-burgundy-50 text-burgundy-700 text-xs font-medium">
              {workspace.current_user_role || "Member"}
            </span>
          </div>
        </header>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryCard
            label="Members"
            value={loading ? "—" : dashboard.members.length}
            onClick={() => onNavigate("members")}
          />

          <SummaryCard
            label="Open Tasks"
            value={loading ? "—" : pendingTasks.length}
            onClick={() => onNavigate("tasks")}
          />

          <SummaryCard
            label="Resources"
            value={loading ? "—" : dashboard.resources.length}
            onClick={() => onNavigate("resources")}
          />

          <SummaryCard
            label="Active Polls"
            value={loading ? "—" : activePolls.length}
            onClick={() => onNavigate("polls")}
          />
        </div>

        {error && (
          <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-3">
            {error}
          </p>
        )}

        {loading ? (
          <div className="bg-white border rounded-xl p-8 text-center">
            <p className="text-sm text-gray-500">
              Loading workspace overview...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Tasks */}
            <PreviewCard>
              <SectionHeader
                title="Recent Tasks"
                onViewAll={() => onNavigate("tasks")}
              />

              {recentTasks.length === 0 ? (
                <EmptyMessage>No tasks created yet.</EmptyMessage>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentTasks.map((task) => (
                    <div
                      key={task.id}
                      className="py-2 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {task.title || "Untitled task"}
                        </p>

                        <p className="text-xs text-gray-400 mt-1 truncate">
                          By {getActorName(task, "creator")}
                          {task.created_at
                            ? ` · ${formatDate(task.created_at)}`
                            : ""}
                        </p>
                      </div>

                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 shrink-0 capitalize">
                        {(task.status || "todo").replaceAll("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </PreviewCard>

            {/* Activity */}
            <PreviewCard>
              <SectionHeader
                title="Recent Activity"
                onViewAll={() => onNavigate("activity")}
              />

              {recentUpdates.length === 0 ? (
                <EmptyMessage>No recent activity.</EmptyMessage>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentUpdates.map((update) => (
                    <div
                      key={update.id}
                      className="py-2"
                    >
                      <p className="text-sm text-gray-700 truncate capitalize">
                        {getActivityDescription(update.event_type)}
                      </p>

                      <p className="text-xs text-gray-400 mt-1 truncate">
                        By {getActorName(update)}
                        {update.created_at
                          ? ` · ${formatDate(update.created_at)}`
                          : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </PreviewCard>

            {/* Resources */}
            <PreviewCard>
              <SectionHeader
                title="Shared Resources"
                onViewAll={() => onNavigate("resources")}
              />

              {recentResources.length === 0 ? (
                <EmptyMessage>No resources shared yet.</EmptyMessage>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentResources.map((resource) => (
                    <div key={resource.id} className="py-2">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {resource.title ||
                          resource.filename ||
                          resource.note_title ||
                          "Shared resource"}
                      </p>

                      <p className="text-xs text-gray-400 mt-1 truncate">
                        Shared by {getActorName(resource, "shared_by")}
                        {resource.created_at
                          ? ` · ${formatDate(resource.created_at)}`
                          : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </PreviewCard>

            {/* Members */}
            <PreviewCard>
              <SectionHeader
                title="Workspace Members"
                onViewAll={() => onNavigate("members")}
              />

              {recentMembers.length === 0 ? (
                <EmptyMessage>No members found.</EmptyMessage>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentMembers.map((member) => {
                    const avatar =
                      member.avatar_url ||
                      member.profile?.avatar_url;

                    return (
                      <div
                        key={member.user_id || member.id}
                        className="py-2 flex items-center gap-3"
                      >
                        {avatar ? (
                          <img
                            src={avatar}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-burgundy-50 text-burgundy-700 flex items-center justify-center text-xs font-semibold">
                            {getMemberName(member).charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {getMemberName(member)}
                          </p>

                          <p className="text-xs text-gray-400 capitalize">
                            {member.role || "Member"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </PreviewCard>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-4 items-start h-screen overflow-hidden p-4">

      {/* LEFT: Workspace navigation */}
      <aside className="w-56 shrink-0 h-full overflow-y-auto">
        <button
          onClick={() => onNavigate("hub")}
          className="mb-4 text-sm text-gray-500 hover:text-burgundy-700"
        >
          ← Back to Collaboration
        </button>

        <h3 className="font-semibold text-gray-900 mb-3">
          {workspace.name || "Workspace"}
        </h3>

        <nav>
          <ul className="list-none p-0 m-0 space-y-1">
            {[
              { id: "overview", label: "Overview" },
              { id: "resources", label: "Resources" },
              { id: "tasks", label: "Tasks" },
              { id: "polls", label: "Polls" },
              { id: "activity", label: "Activity" },
              { id: "members", label: "Members" },
              { id: "messages", label: "Messages" },
            ].map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  aria-current={
                    activeSection === item.id ? "page" : undefined
                  }
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    activeSection === item.id
                      ? "bg-burgundy-50 text-burgundy-800 font-semibold"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* CENTER: Main workspace content */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto space-y-5">
        {renderMainContent()}
      </main>

      {/* RIGHT: Communication and quick actions */}
      <aside className="w-64 shrink-0 h-full overflow-y-auto space-y-4">

        {/* Messages preview */}
        <PreviewCard>
          <SectionHeader
            title="Messages"
            onViewAll={() => onNavigate("messages")}
          />

          {loading ? (
            <EmptyMessage>Loading messages...</EmptyMessage>
          ) : recentMessages.length === 0 ? (
            <EmptyMessage>No messages yet.</EmptyMessage>
          ) : (
            <div className="space-y-3">
              {recentMessages.slice(0, 4).map((message) => (
                <div key={message.id} className="min-w-0">
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {message.content}
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    {formatTime(message.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </PreviewCard>

        {/* Polls preview */}
        <PreviewCard>
          <SectionHeader
            title="Active Polls"
            onViewAll={() => onNavigate("polls")}
          />

          {loading ? (
            <EmptyMessage>Loading polls...</EmptyMessage>
          ) : activePolls.length === 0 ? (
            <EmptyMessage>No active polls.</EmptyMessage>
          ) : (
            <div className="space-y-3">
              {activePolls.slice(0, 4).map((poll) => (
                <div key={poll.id}>
                  <p className="text-sm font-medium text-gray-800 line-clamp-2">
                    {poll.question}
                  </p>

                  {poll.expires_at && (
                    <p className="text-xs text-gray-400 mt-1">
                      Ends {formatDate(poll.expires_at)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </PreviewCard>

        {/* Quick actions */}
        <PreviewCard>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Quick Actions
          </h3>

          <div className="flex flex-col gap-2">
            {[
              ["View Tasks", "tasks"],
              ["View Members", "members"],
              ["View Resources", "resources"],
              ["View Activity", "activity"],
              ["Open Messages", "messages"],
            ].map(([label, section]) => (
              <button
                key={section}
                onClick={() => onNavigate(section)}
                className="text-left text-sm px-3 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-burgundy-50 hover:text-burgundy-700 transition"
              >
                {label}
              </button>
            ))}
          </div>
        </PreviewCard>
      </aside>
    </div>
  );
}
