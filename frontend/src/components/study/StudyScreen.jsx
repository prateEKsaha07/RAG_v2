import { useState, useEffect } from "react";
import {
  Upload,
  Search,
  BookOpen,
  Trash2,
  ArrowRight,
} from "lucide-react";

function StudyScreen() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // 
  const [books, setBooks] = useState([]);
  const [loadingBooks,setLoadingBooks] = useState([]);


  const fetchBooks = async () => {
  try {
    setLoadingBooks(true);

    const token = localStorage.getItem("access_token");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/books/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    console.log("Books:", data);

    if (response.ok) {
      setBooks(data.books || []);
    } else {
      console.error(data);
    }
  } catch (err) {
    console.error(err);
  } finally {
    setLoadingBooks(false);
  }
};

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a PDF first.");
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        alert("You are not logged in.");
        return;
      }

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/books/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      console.log("Status:", response.status);
      console.log("Response:", data);

      if (!response.ok) {
        throw new Error(data.detail || "Upload failed.");
      }

      alert("Book uploaded successfully!");
      await fetchBooks();
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };


const deleteBook = async (bookId) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/books/${bookId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail);
    }
    await fetchBooks();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

//  for now it opens the pdf in a local pdf reader 
const openBook = async(book_id) => {
  try {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/books/${book_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const book = await response.json();

    console.log(book);

    // here need to change this 
    window.open(book.signed_url, "_blank");

  } catch (err) {
    console.error(err);
  }
};



  useEffect(() => {
    fetchBooks();
  },[]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-8 py-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">

          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Study Library
            </h1>

            <p className="text-slate-500 mt-2">
              Read and manage your uploaded books.
            </p>
          </div>

          <div className="flex gap-3 mt-5 md:mt-0">

            <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl flex items-center gap-2">

              <Upload size={18} />

              Choose Book

              <input
                hidden
                type="file"
                accept=".pdf"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />

            </label>

            <button
              onClick={handleUpload}
              disabled={uploading}
              className={`px-5 rounded-xl text-white transition
                ${
                  uploading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>

          </div>

        </div>

        {/* Selected File */}

        {selectedFile && (
          <div className="mb-8 rounded-xl border border-green-200 bg-green-50 p-5">

            <h3 className="font-semibold text-green-700">
              Selected Book
            </h3>

            <p className="mt-2 text-gray-700">
              {selectedFile.name}
            </p>

            <p className="text-sm text-gray-500">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </p>

          </div>
        )}

        {/* Search */}

        <div className="relative mb-10">

          <Search
            className="absolute left-4 top-3 text-slate-400"
            size={18}
          />

          <input
            placeholder="Search books..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border bg-white"
          />

        </div>

        {/* Continue Reading */}

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-8 mb-10">

          <h2 className="text-2xl font-bold mb-2">
            Continue Reading
          </h2>

          <p className="opacity-80 mb-6">
            Operating Systems.pdf
          </p>

          <div className="w-full bg-blue-300 rounded-full h-3 mb-4">

            <div
              className="bg-white h-3 rounded-full"
              style={{ width: "18%" }}
            />

          </div>

          <button className="bg-white text-blue-700 px-5 py-2 rounded-xl font-semibold flex items-center gap-2">

            Continue

            <ArrowRight size={18} />

          </button>

        </div>

        {/* Library */}

        <h2 className="text-2xl font-bold mb-6">
          My Books
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">



          {loadingBooks ? (
  <div className="text-center py-10 text-gray-500">
    Loading books...
  </div>
) : books.length === 0 ? (
  <div className="text-center py-10 text-gray-500">
    No books uploaded yet.
  </div>
) : (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    {books.map((book) => (
      // existing card
      <div
              key={book.id}
              className="bg-white rounded-2xl p-6 shadow-sm border"
            >

              <BookOpen
                className="text-blue-600 mb-4"
                size={42}
              />

              <h3 className="font-bold text-lg">
                {book.title}
              </h3>

              <p className="text-slate-500 mt-2">
                {book.current_page} / {book.total_pages} pages
              </p>

              <div className="flex gap-3 mt-6">

                <button
                  onClick={()=>openBook(book.id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                >
                  Read
                </button>

                <button
                  onClick={()=>deleteBook(book.id)}
                  className="bg-red-100 hover:bg-red-200 p-2 rounded-lg"
                >
                  <Trash2
                    size={18}
                    className="text-red-600"
                  />
                </button>

              </div>

            </div>
    ))}
  </div>
)}

        </div>

      </div>
    </div>
  );
}

export default StudyScreen;