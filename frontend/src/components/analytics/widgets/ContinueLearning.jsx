function ContinueLearning({ study }) {

    const book = study.currently_reading;

    if (!book) {
        return (
            <div className="bg-white rounded-xl shadow border p-6">
                <h2 className="text-xl font-semibold mb-4">
                    Continue Learning
                </h2>

                <p className="text-gray-500">
                    No books uploaded yet.
                </p>
            </div>
        );
    }

    const progress = Math.round(
        (book.current_page / book.total_pages) * 100
    );

    return (
        <div className="bg-white rounded-xl shadow border p-6">

            <h2 className="text-xl font-semibold mb-6">
                Continue Learning
            </h2>

            <div className="space-y-5">

                <div>
                    <h3 className="text-lg font-semibold">
                        {book.title}
                    </h3>

                    <p className="text-gray-500 text-sm">
                        Page {book.current_page} of {book.total_pages}
                    </p>
                </div>

                <div>

                    <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{progress}%</span>
                    </div>

                    <div className="w-full h-3 bg-gray-200 rounded-full">

                        <div
                            className="h-3 bg-blue-500 rounded-full transition-all duration-500"
                            style={{
                                width: `${progress}%`,
                            }}
                        />

                    </div>

                </div>

                <button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                >
                    Continue Reading
                </button>

            </div>

        </div>
    );
}

export default ContinueLearning;