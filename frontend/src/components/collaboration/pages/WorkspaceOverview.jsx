
import WorkspaceMembers from "./WorkspaceMembers";
import WorkspaceResources from "./WorkspaceResources";

export default function WorkspaceOverview({
  workspace,
  onNavigate,
  activeSection = "overview",
}) {
  const navigationItems = [
    { id: "overview", label: "Overview" },
    { id: "resources", label: "Resources" },
    { id: "tasks", label: "Tasks" },
    { id: "polls", label: "Polls" },
    { id: "activity", label: "Activity" },
    { id: "members", label: "Members" },
    { id: "messages", label: "Messages" },
  ];

  return (
    <div className="flex gap-4 items-start min-h-screen p-4">

      {/* Left: Workspace navigation */}
      <aside className="w-56 shrink-0">
        <button
          onClick={() => onNavigate("hub")}
          className="mb-4"
        >
          ← Back to Collaboration
        </button>

        <h3 className="font-semibold mb-2">
          {workspace?.name || "Workspace"}
        </h3>

        <nav>
          <ul className="list-none p-0 m-0 space-y-1">
            {navigationItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  aria-current={
                    activeSection === item.id ? "page" : undefined
                  }
                  className={`w-full text-left ${
                    activeSection === item.id
                      ? "font-semibold"
                      : ""
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Center: Main workspace dashboard */}
      <main className="flex-1 min-w-0 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">
            {workspace?.name || "Workspace Overview"}
          </h1>
          <p>
            {workspace?.description || "Welcome to your workspace."}
          </p>
          <p>
            Role: {workspace?.current_user_role || "Member"}
          </p>
        </header>

        {activeSection === "members" ? (
          <WorkspaceMembers workspace={workspace} />
        ) : activeSection === "resources" ? (
          <WorkspaceResources workspace={workspace} />
        ) : activeSection === "overview" ? (
          <>
            <section>
              <h2 className="text-lg font-semibold">Overview</h2>
              <p>Workspace information and overview content will appear here.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <p>No recent activity to display.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold">Tasks</h2>
              <p>Workspace tasks will appear here.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold">Resources</h2>
              <p>Shared notes and resources will appear here.</p>
            </section>
          </>
        ) : (
          <section>
            <h2 className="text-lg font-semibold capitalize">
              {activeSection}
            </h2>
            <p>This section is not implemented yet.</p>
          </section>
        )}
      </main>

      {/* Right: Communication panel */}
      <aside className="w-64 shrink-0 space-y-6">
        <section>
          <h3 className="font-semibold">Messages</h3>
          <p>Recent workspace messages will appear here.</p>
          <button onClick={() => onNavigate("messages")}>
            Open Messages
          </button>
        </section>

        <section>
          <h3 className="font-semibold">Polls</h3>
          <p>Active workspace polls will appear here.</p>
          <button onClick={() => onNavigate("polls")}>
            View Polls
          </button>
        </section>

        <section>
          <h3 className="font-semibold">Quick Actions</h3>
          <div className="flex flex-col gap-2">
            <button onClick={() => onNavigate("tasks")}>View Tasks</button>
            <button onClick={() => onNavigate("members")}>View Members</button>
            <button onClick={() => onNavigate("resources")}>View Resources</button>
          </div>
        </section>
      </aside>
    </div>
  );
}
