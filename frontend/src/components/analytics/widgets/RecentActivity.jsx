import {
    BookOpen,
    Brain,
    FileText,
    Map,
} from "lucide-react";

function RecentActivity({ activity }) {

    const getIcon = (type) => {
        switch (type) {
            case "book":
                return <BookOpen size={20} className="text-blue-500" />;

            case "quiz":
                return <Brain size={20} className="text-purple-500" />;

            case "note":
                return <FileText size={20} className="text-green-500" />;

            case "roadmap":
                return <Map size={20} className="text-orange-500" />;

            default:
                return <FileText size={20} />;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow border p-6">

            <h2 className="text-xl font-semibold mb-6">
                Recent Activity
            </h2>

            <div className="space-y-5">

                {activity.map((item, index) => (

                    <div
                        key={index}
                        className="flex items-start gap-4"
                    >

                        <div className="mt-1">
                            {getIcon(item.type)}
                        </div>

                        <div className="flex-1">

                            <p className="font-medium">
                                {item.title}
                            </p>

                            <p className="text-sm text-gray-500">
                                {new Date(item.time).toLocaleString()}
                            </p>

                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
}

export default RecentActivity;