import {
    TrendingUp,
    Target,
    BookOpen,
    AlertTriangle,
} from "lucide-react";

function AIInsights({ dashboard }) {

    const { overview, quiz, roadmap } = dashboard;

    const insights = [];

    insights.push({
        icon: <TrendingUp className="text-blue-500" size={20} />,
        title: "Average Performance",
        message: `Your average quiz score is ${overview.average_score}%.`,
    });

    insights.push({
        icon: <BookOpen className="text-green-500" size={20} />,
        title: "Learning Progress",
        message: `You currently have ${overview.books} books and ${overview.notes} notes available.`,
    });

    if (quiz.weak_topics.length > 0) {
        insights.push({
            icon: <AlertTriangle className="text-orange-500" size={20} />,
            title: "Weakest Topic",
            message: `Focus on "${quiz.weak_topics[0].topic}".`,
        });
    }

    if (roadmap.active > 0) {
        insights.push({
            icon: <Target className="text-purple-500" size={20} />,
            title: "Roadmap",
            message: `Your next roadmap deadline is ${roadmap.next_deadline}.`,
        });
    }

    return (
        <div className="bg-white rounded-xl shadow border p-6">

            <h2 className="text-xl font-semibold mb-6">
                AI Insights
            </h2>

            <div className="space-y-5">

                {insights.map((item, index) => (

                    <div
                        key={index}
                        className="flex gap-4"
                    >

                        <div className="mt-1">
                            {item.icon}
                        </div>

                        <div>

                            <h3 className="font-semibold">
                                {item.title}
                            </h3>

                            <p className="text-gray-600 text-sm mt-1">
                                {item.message}
                            </p>

                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
}

export default AIInsights;