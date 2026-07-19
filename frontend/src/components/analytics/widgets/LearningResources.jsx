function LearningResources({ dashboard }) {

    const { study } = dashboard;

    return (

        <div className="bg-white rounded-xl shadow border p-6">

            <h2 className="text-xl font-semibold mb-6">

                Learning Resources

            </h2>

            <div className="space-y-4">

                {study.recent_books.map(book => (

                    <div
                        key={book.id}
                        className="border rounded-lg p-4"
                    >

                        <div className="font-semibold">

                            {book.title}

                        </div>

                        <div className="text-sm text-gray-500">

                            {book.current_page} / {book.total_pages} pages

                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
}
export default LearningResources;