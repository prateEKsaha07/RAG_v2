import OverallReport from "../widgets/OverallReport";
import LearningResources from "../widgets/LearningResources";
import QuizReport from "../widgets/QuizReport";
import ActivitySummary from "../widgets/ActivitySummary";

function Reports({ dashboard }) {
    return (
        <div className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-6">
                <OverallReport dashboard={dashboard} />
                <QuizReport dashboard={dashboard} />
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
                <LearningResources dashboard={dashboard} />
                <ActivitySummary dashboard={dashboard} />
            </div>
        </div>
    );
}

export default Reports;