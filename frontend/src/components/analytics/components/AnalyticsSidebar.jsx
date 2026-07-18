import {
  LayoutDashboard,
  TrendingUp,
  BookOpen,
  Brain,
  Map,
  FileBarChart2,
} from "lucide-react";

const menuItems = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    id: "performance",
    label: "Performance",
    icon: TrendingUp,
  },
  {
    id: "study",
    label: "Study",
    icon: BookOpen,
  },
  {
    id: "quiz",
    label: "Quiz",
    icon: Brain,
  },
  {
    id: "roadmaps",
    label: "Roadmaps",
    icon: Map,
  },
  {
    id: "reports",
    label: "Reports",
    icon: FileBarChart2,
  },
];

function AnalyticsSidebar({ page, setPage }) {
  return (
    <aside className="w-72 bg-white border-r min-h-[calc(100vh-64px)]">

      <div className="p-6">

        <h2 className="text-lg font-semibold text-gray-800">
          Analytics
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Insights & Reports
        </p>

      </div>

      <nav className="px-3 pb-6">

        {menuItems.map((item) => {
          const Icon = item.icon;

          const active = page === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all

                ${
                  active
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              <Icon size={20} />

              <span className="font-medium">
                {item.label}
              </span>

            </button>
          );
        })}

      </nav>

      {/* Future widgets */}

      <div className="mt-auto p-4">

        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">

          <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">
            Coming Soon
          </p>

          <ul className="mt-3 text-sm text-gray-600 space-y-2">

            <li>• Weekly Reports</li>

            <li>• AI Insights</li>

            <li>• Study Heatmap</li>

            <li>• Goal Predictions</li>

          </ul>

        </div>

      </div>

    </aside>
  );
}

export default AnalyticsSidebar;