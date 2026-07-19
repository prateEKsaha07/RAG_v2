function ReadingStats({ study }) {

    return (

        <div className="bg-white rounded-xl shadow border p-6">

            <h2 className="text-xl font-semibold mb-6">

                Reading Statistics

            </h2>

            <div className="space-y-6">

                <div>

                    <div className="text-gray-500">

                        Books Read Recently

                    </div>

                    <div className="text-3xl font-bold">

                        {study.recent_books.length}

                    </div>

                </div>

                <div>

                    <div className="text-gray-500">

                        Overall Progress

                    </div>

                    <div className="text-3xl font-bold">

                        {study.reading_progress}%

                    </div>

                </div>
                <div>
                    <div className="text-gray-500">
                        Current Book
                    </div>
                    <div className="font-semibold">
                        {study.currently_reading?.title}
                    </div>
                </div>
            </div>
        </div>
    );
}
export default ReadingStats;