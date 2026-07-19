import QuizSummary from "../widgets/QuizSummary";
import RecentAttempts from "../widgets/RecentAttempts";
import WeakTopics from "../widgets/WeakTopics";
import QuizTrend from "../widgets/QuizTrend";

function Quiz({ dashboard }) {
    const { quiz } = dashboard;
    return (
        <div className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-6">
                <QuizSummary quiz={quiz} />
                <QuizTrend quiz={quiz} />
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
                <RecentAttempts quiz={quiz} />
                <WeakTopics quiz={quiz} />
            </div>
        </div>
    );
}

export default Quiz;