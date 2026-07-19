import RoadmapSummary from "../widgets/RoadmapSummary";
import RoadmapStatus from "../widgets/RoadmapStatus";
import UpcomingDeadline from "../widgets/UpcomingDeadline";
import RoadmapOverview from "../widgets/RoadmapOverview";

function Roadmaps({ dashboard }) {

    const { roadmap } = dashboard;

    return (

        <div className="space-y-8">

            <div className="grid lg:grid-cols-2 gap-6">

                <RoadmapSummary roadmap={roadmap} />

                <UpcomingDeadline roadmap={roadmap} />

            </div>

            <div className="grid lg:grid-cols-2 gap-6">

                <RoadmapStatus roadmap={roadmap} />

                <RoadmapOverview roadmap={roadmap} />

            </div>

        </div>

    );

}

export default Roadmaps;