function ActivitySummary({ dashboard }) {

    const { activity } = dashboard;

    return (

        <div className="bg-white rounded-xl shadow border p-6">

            <h2 className="text-xl font-semibold mb-6">

                Recent Activity

            </h2>

            <div className="space-y-4">

                {activity.slice(0,6).map((item,index) => (

                    <div
                        key={index}
                        className="border-b pb-3"
                    >

                        <div className="font-medium">

                            {item.title}

                        </div>

                        <div className="text-sm text-gray-500">

                            {new Date(item.time).toLocaleString()}

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

}

export default ActivitySummary;
