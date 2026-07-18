import { useState, useEffect, useRef } from "react";

function SubjectSelector({
  subjects,
  value,
  onChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSubjects, setFilteredSubjects] = useState(subjects);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Filter subjects based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSubjects(subjects);
    } else {
      const filtered = subjects.filter(subject =>
        subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSubjects(filtered);
    }
  }, [searchTerm, subjects]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle subject selection
  const handleSelect = (subject) => {
    onChange(subject);
    setIsOpen(false);
    setSearchTerm("");
    // Focus back to input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Get selected subject display name
  const getSelectedDisplay = () => {
    if (!value) return "Select subject...";
    return value;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selector Button */}
      <div 
        className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg shadow-gray-200/50 border transition-all duration-300 cursor-pointer ${
          isOpen 
            ? 'border-blue-400 shadow-blue-100/50 shadow-xl' 
            : 'border-gray-100/80 hover:border-blue-300 hover:shadow-xl hover:shadow-gray-200/60'
        }`}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => {
              if (inputRef.current) {
                inputRef.current.focus();
              }
            }, 100);
          }
        }}
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className={`p-2 rounded-xl transition-all duration-300 ${
            isOpen ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-100 text-gray-500'
          }`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>

          {/* Selected Value */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium transition-colors duration-300 ${
              value ? 'text-gray-800' : 'text-gray-400'
            }`}>
              {getSelectedDisplay()}
            </p>
            {value && (
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                Selected Subject
              </p>
            )}
          </div>

          {/* Arrow Icon */}
          <div className={`transition-all duration-300 transform ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      <div className={`absolute w-full mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100/80 overflow-hidden transition-all duration-300 z-50 ${
        isOpen 
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
          : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
      }`}>
        {/* Search Input */}
        <div className="p-3 border-b border-gray-100/80">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search subjects..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50/50 border border-gray-200/50 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
              onClick={(e) => e.stopPropagation()}
            />
            {searchTerm && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchTerm("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Subjects List */}
        <div className="max-h-64 overflow-y-auto custom-scrollbar">
          {filteredSubjects.length > 0 ? (
            <ul className="py-2">
              {filteredSubjects.map((subject, index) => (
                <li
                  key={subject}
                  className={`px-4 py-2.5 mx-2 rounded-xl transition-all duration-200 cursor-pointer ${
                    value === subject
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'hover:bg-gray-50 text-gray-700 hover:translate-x-1'
                  }`}
                  style={{
                    animationDelay: `${index * 30}ms`,
                  }}
                  onClick={() => handleSelect(subject)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      value === subject ? 'bg-blue-500 scale-100' : 'bg-gray-300 scale-75'
                    }`} />
                    <span className="text-sm">{subject}</span>
                    {value === subject && (
                      <svg className="w-4 h-4 ml-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🔍</div>
              <p className="text-sm text-gray-500 font-medium">No subjects found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search</p>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {filteredSubjects.length > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-100/80 bg-gray-50/30">
            <p className="text-[10px] text-gray-400 font-medium">
              {filteredSubjects.length} subject{filteredSubjects.length !== 1 ? 's' : ''} available
            </p>
          </div>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}

export default SubjectSelector;