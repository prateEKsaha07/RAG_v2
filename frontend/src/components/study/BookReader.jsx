import { useState } from "react";
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

function BookReader({ book, onBack }) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(
    book?.current_page || 1
  );

  const [scale, setScale] = useState(0.9);

  function onDocumentLoadSuccess({ numPages }) {
  setNumPages(numPages);
  }

// pdf navigation 
  const previousPage = () => {
    if(pageNumber > 1){
        setPageNumber(pageNumber - 1);
    }
}
  const nextPage = () => {
    if(pageNumber < numPages){
        setPageNumber(pageNumber + 1);
    }
}
const zoomIn = () => {

    setScale(scale + 0.2);

}
const zoomOut = () => {
    if(scale > 0.6){
        setScale(scale - 0.2);
    }
}

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

      <main className="flex-1 flex items-center justify-center p-10">

        <div className="bg-white rounded-xl shadow-lg border w-full max-w-5xl h-[75vh] flex items-center justify-center">

          <Document
    file={book.signed_url}
    onLoadSuccess={onDocumentLoadSuccess}
    loading="Loading PDF..."
>

    <Page
        pageNumber={pageNumber}
        scale={scale}
    />

</Document>

        </div>

      </main>

      {/* Footer */}

      <footer className="h-20 bg-white border-t flex items-center justify-center">

        <div className="flex items-center gap-6">

          <button 
          onClick={previousPage}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg">

            <ChevronLeft size={18} />

            Previous

          </button>

          <div className="font-medium text-slate-700">

            page{pageNumber} / {numPages}

          </div>

          <button
          onClick={nextPage} 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">

            Next

            <ChevronRight size={18} />

          </button>

          <button className="flex items-center gap-2 border px-4 py-2 rounded-lg">
            <ZoomIn size={18 * scale} />
            <span>{Math.round(scale * 100)}%</span>
          </button>

        </div>

      </footer>

    </div>
  );
}

export default BookReader;