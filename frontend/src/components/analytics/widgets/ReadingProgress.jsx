function ReadingProgress({ study }) {

    return (

        <div className="bg-white rounded-xl shadow border p-6">

            <h2 className="text-xl font-semibold mb-6">
                Reading Progress
            </h2>

            <div className="flex items-center justify-center">

                <div className="relative w-48 h-48">

                    <svg
                        className="w-full h-full"
                        viewBox="0 0 120 120"
                    >

                        <circle
                            cx="60"
                            cy="60"
                            r="50"
                            stroke="#E5E7EB"
                            strokeWidth="10"
                            fill="none"
                        />

                        <circle
                            cx="60"
                            cy="60"
                            r="50"
                            stroke="#3B82F6"
                            strokeWidth="10"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${study.reading_progress * 3.14} 314`}
                            transform="rotate(-90 60 60)"
                        />

                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center">

                        <div className="text-center">

                            <div className="text-4xl font-bold">

                                {study.reading_progress}%

                            </div>

                            <div className="text-gray-500">

                                Completed

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default ReadingProgress;