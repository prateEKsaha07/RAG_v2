import {
  FileText,
  Brain,
  MessageCircle,
  Upload,
  BarChart3,
  Map
} from "lucide-react";

function QuickActions({
  onNotes,
  onQA,
  onQuiz,
  onUpload,
  onAnalytics,
  onRoadmap,
}) {

  const actions = [
    {
      title: "My Notes",
      description: "Create and manage notes",
      icon: FileText,
      color: "bg-purple-100 text-purple-600",
      action: onNotes,
    },
    {
      title: "Ask AI",
      description: "Ask questions from your study material",
      icon: MessageCircle,
      color: "bg-green-100 text-green-600",
      action: onQA,
    },
    {
      title: "Take Quiz",
      description: "Generate an AI quiz",
      icon: Brain,
      color: "bg-blue-100 text-blue-600",
      action: onQuiz,
    },
    {
      title: "Study Material",
      description: "Upload or switch subjects",
      icon: Upload,
      color: "bg-orange-100 text-orange-600",
      action: onUpload,
    },
    {
      title: "Analytics",
      description: "Track your progress",
      icon: BarChart3,
      color: "bg-pink-100 text-pink-600",
      action: onAnalytics,
    },
    {
      title: "Roadmap",
      description: "Manage your study plan",
      icon: Map,
      color: "bg-cyan-100 text-cyan-600",
      action: onRoadmap,
    },
  ];

  return (
    <section className="mt-8">

      <div className="flex justify-between items-center mb-5">

        <h2 className="text-2xl font-bold text-gray-800">
          Quick Actions
        </h2>

      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

        {actions.map((item) => {

          const Icon = item.icon;

          return (
            <button
              key={item.title}
              onClick={item.action}
              className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition p-6 text-left"
            >

              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${item.color}`}
              >
                <Icon size={28} />
              </div>

              <h3 className="font-bold text-lg">
                {item.title}
              </h3>

              <p className="text-gray-500 mt-2 text-sm">
                {item.description}
              </p>

            </button>
          );

        })}

      </div>

    </section>
  );
}

export default QuickActions;