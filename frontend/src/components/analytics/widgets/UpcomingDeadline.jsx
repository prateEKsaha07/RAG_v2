function UpcomingDeadline({ roadmap }) {

    return (

        <div className="bg-white rounded-xl shadow border p-6">

            <h2 className="text-xl font-semibold mb-6">

                Upcoming Deadline

            </h2>

            <div className="space-y-5">

                <div>

                    <div className="text-gray-500">

                        Subject

                    </div>

                    <div className="text-2xl font-bold">

                        {roadmap.nearest_subject}

                    </div>

                </div>

                <div>

                    <div className="text-gray-500">

                        Deadline

                    </div>

                    <div className="text-xl font-semibold">

                        {roadmap.next_deadline}

                    </div>

                </div>

            </div>

        </div>

    );

}

export default UpcomingDeadline;