import { useState, useEffect } from "react";
// configuring pdf.js
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  MoreVertical,
  ZoomIn,
} from "lucide-react";

import {
  updateProgress,
  updateLastOpened,
} from "../../api/bookApi";

function BookReader({ book, onBack }) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(
    book?.current_page || 1
  );
  const [scale, setScale] = useState(0.9);

  function onDocumentLoadSuccess({ numPages }) {
  console.log("PDF loaded");
  console.log("Total pages:", numPages);
  setNumPages(numPages);
  }

// pdf navigation 
const previousPage = async () => {
  if (pageNumber > 1) {
    const newPage = pageNumber - 1;
    setPageNumber(newPage);
    await updateProgress(newPage);
  }
};

const nextPage = async () => {
  if (pageNumber < numPages) {
    const newPage = pageNumber + 1;

    setPageNumber(newPage);

    await updateProgress(book.id, newPage);
  }
};

const zoomIn = () => {

    setScale(scale + 0.2);

}

const zoomOut = () => {
    if(scale > 0.6){
        setScale(scale - 0.2);
    }
}

useEffect(() => {
  updateLastOpened(book.id);
}, []);

return (
  <div className="min-h-screen bg-slate-100 flex flex-col">

    {/* Header */}
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm">

      <div className="flex items-center gap-4">

        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-slate-100 transition"
        >
          <ArrowLeft size={22} />
        </button>

        <div>
          <h1 className="font-semibold text-slate-800">
            {book?.title}
          </h1>

          <p className="text-xs text-slate-500">
            Study Reader
          </p>
        </div>

      </div>

      <div className="flex items-center gap-2">

        <button className="p-2 rounded-lg hover:bg-slate-100">
          <Search size={20} />
        </button>

        <button className="p-2 rounded-lg hover:bg-slate-100">
          <MoreVertical size={20} />
        </button>

      </div>

    </header>

    {/* Reader */}

    <main className="flex-1 flex items-center justify-center p-6 overflow-hidden">

      <div className="relative overflow-auto bg-white rounded-xl shadow-lg border w-full max-w-5xl h-full flex items-center justify-center">

        <Document
          file={book.signed_url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading="Loading PDF..."
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>

      </div>

    </main>

    {/* Footer */}

    <footer className="relative z-50 h-20 bg-white border-t flex items-center justify-center">

      <div className="flex items-center gap-6">

        <button
          onClick={previousPage}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg"
        >
          <ChevronLeft size={18} />
          Previous
        </button>

        <div className="font-medium text-slate-700">
          Page {pageNumber} / {numPages}
        </div>

        <button
          onClick={() => {
            alert("Next button clicked");
            nextPage();
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Next
          <ChevronRight size={18} />
        </button>

        <button
          onClick={zoomIn}
          className="flex items-center gap-2 border px-4 py-2 rounded-lg"
        >
          <ZoomIn size={18} />
          <span>{Math.round(scale * 100)}%</span>
        </button>

      </div>

    </footer>

  </div>
);
}

export default BookReader;