function RecentBooks({ study }) {

    return (

        <div className="bg-white rounded-xl shadow border p-6">

            <h2 className="text-xl font-semibold mb-6">

                Recent Books

            </h2>

            <div className="space-y-5">

                {study.recent_books.map((book) => (

                    <div
                        key={book.id}
                        className="border rounded-lg p-4"
                    >

                        <div className="font-semibold">

                            {book.title}

                        </div>

                        <div className="text-sm text-gray-500 mt-1">

                            Page {book.current_page} / {book.total_pages}

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

}

export default RecentBooks;