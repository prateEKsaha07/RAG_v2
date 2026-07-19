function WeakTopics({ quiz }) {

    return (

        <div className="bg-white rounded-xl shadow border p-6">

            <h2 className="text-xl font-semibold mb-6">

                Weak Topics

            </h2>

            <div className="space-y-4">

                {quiz.weak_topics.map((topic) => (

                    <div
                        key={topic.topic}
                    >

                        <div className="flex justify-between mb-2">

                            <span>

                                {topic.topic}

                            </span>

                            <span>

                                {topic.count}

                            </span>

                        </div>

                        <div className="h-2 bg-gray-200 rounded">

                            <div
                                className="h-2 bg-red-500 rounded"
                                style={{
                                    width: `${Math.min(topic.count * 20,100)}%`,
                                }}
                            />

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

}

export default WeakTopics;