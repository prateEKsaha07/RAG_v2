import PerformanceSummary from "../widgets/PerformanceSummary";
import WeeklyPerformance from "../widgets/WeeklyPerformance";
import PerformanceTrend from "../widgets/PerformanceTrend";
import PerformanceInsights from "../widgets/PerformanceInsights";

function Performance({ dashboard }) {
    return (
        <div className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-6">
                <PerformanceSummary dashboard={dashboard} />
                <PerformanceTrend dashboard={dashboard} />
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
                <WeeklyPerformance dashboard={dashboard} />
                <PerformanceInsights dashboard={dashboard} />
            </div>
        </div>
    );
}

export default Performance;