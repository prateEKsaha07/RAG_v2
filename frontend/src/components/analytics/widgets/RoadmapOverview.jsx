function RoadmapOverview({ roadmap }) {

    return (

        <div className="bg-white rounded-xl shadow border p-6">

            <h2 className="text-xl font-semibold mb-6">

                Current Roadmap

            </h2>

            <div className="space-y-5">

                <div>

                    <span className="text-gray-500">

                        Current Subject

                    </span>

                    <p className="font-semibold text-lg">

                        {roadmap.nearest_subject}

                    </p>

                </div>

                <div>

                    <span className="text-gray-500">

                        Next Deadline

                    </span>

                    <p className="font-semibold text-lg">

                        {roadmap.next_deadline}

                    </p>

                </div>

                <div>

                    <span className="text-gray-500">

                        Active Roadmaps

                    </span>

                    <p className="font-semibold text-lg">

                        {roadmap.active}

                    </p>

                </div>

            </div>

        </div>

    );

}

export default RoadmapOverview;