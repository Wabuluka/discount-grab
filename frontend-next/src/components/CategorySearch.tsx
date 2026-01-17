"use client";

import { useState, useRef, useEffect } from "react";

interface CategoryOption {
  id: string;
  name: string;
  parentName?: string;
}

interface CategorySearchProps {
  categories: CategoryOption[];
  value: string;
  onChange: (categoryId: string) => void;
  loading?: boolean;
  placeholder?: string;
}

export default function CategorySearch({
  categories,
  value,
  onChange,
  loading = false,
  placeholder = "Search or select a category...",
}: CategorySearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get the selected category's display name
  const selectedCategory = categories.find((cat) => cat.id === value);
  const displayValue = selectedCategory
    ? selectedCategory.parentName
      ? `${selectedCategory.parentName} → ${selectedCategory.name}`
      : selectedCategory.name
    : "";

  // Filter categories based on search query
  const filteredCategories = categories.filter((cat) => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = cat.name.toLowerCase().includes(searchLower);
    const parentMatch = cat.parentName?.toLowerCase().includes(searchLower);
    return nameMatch || parentMatch;
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchQuery("");
    } else if (e.key === "Enter" && filteredCategories.length === 1) {
      e.preventDefault();
      onChange(filteredCategories[0].id);
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  const handleSelect = (categoryId: string) => {
    onChange(categoryId);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-400 flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
        Loading categories...
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Input Field */}
      <div
        className={`w-full px-4 py-2.5 border rounded-lg cursor-pointer transition-all flex items-center gap-2 ${
          isOpen
            ? "border-cyan-500 ring-2 ring-cyan-500"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        <svg
          className="w-5 h-5 text-gray-400 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 outline-none bg-transparent text-gray-900 placeholder-gray-400"
          />
        ) : (
          <span className={`flex-1 ${value ? "text-gray-900" : "text-gray-400"}`}>
            {displayValue || placeholder}
          </span>
        )}

        {value && !isOpen && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <svg
          className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {filteredCategories.length === 0 ? (
            <div className="px-4 py-3 text-gray-500 text-center">
              {searchQuery ? (
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>No categories found for &quot;{searchQuery}&quot;</span>
                </div>
              ) : (
                "No categories available"
              )}
            </div>
          ) : (
            <>
              {/* Clear selection option */}
              {value && (
                <button
                  type="button"
                  onClick={() => handleSelect("")}
                  className="w-full px-4 py-2.5 text-left text-gray-500 hover:bg-gray-50 border-b border-gray-100 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear selection
                </button>
              )}

              {/* Category options */}
              {filteredCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleSelect(category.id)}
                  className={`w-full px-4 py-2.5 text-left hover:bg-cyan-50 flex items-center justify-between transition-colors ${
                    category.id === value ? "bg-cyan-50 text-cyan-700" : "text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {category.parentName && (
                      <>
                        <span className="text-gray-400">{category.parentName}</span>
                        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                    <span className="font-medium">{category.name}</span>
                  </div>
                  {category.id === value && (
                    <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
