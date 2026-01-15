"use client";

import { useState } from "react";
import { Category } from "@/services/categoryApi";

interface CategoryTreeProps {
  categories: Category[];
  selectedCategory?: string;
  onSelectCategory?: (categoryId: string) => void;
  showCounts?: boolean;
  variant?: "sidebar" | "admin";
  onAddSubcategory?: (parentId: string) => void;
  onEdit?: (category: Category) => void;
  onDelete?: (categoryId: string) => void;
}

interface CategoryItemProps {
  category: Category;
  level: number;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  selectedCategory?: string;
  onSelectCategory?: (categoryId: string) => void;
  variant: "sidebar" | "admin";
  onAddSubcategory?: (parentId: string) => void;
  onEdit?: (category: Category) => void;
  onDelete?: (categoryId: string) => void;
}

function CategoryItem({
  category,
  level,
  expandedIds,
  toggleExpand,
  selectedCategory,
  onSelectCategory,
  variant,
  onAddSubcategory,
  onEdit,
  onDelete,
}: CategoryItemProps) {
  const hasChildren = category.subcategories && category.subcategories.length > 0;
  const isExpanded = expandedIds.has(category._id);
  const isSelected = selectedCategory === category._id;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleExpand(category._id);
  };

  const handleSelect = () => {
    if (onSelectCategory) {
      onSelectCategory(category._id);
    }
  };

  if (variant === "admin") {
    return (
      <div>
        <div
          className={`flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${
            level > 0 ? "bg-gray-50/50" : ""
          }`}
          style={{ paddingLeft: `${16 + level * 24}px` }}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Expand/Collapse Button */}
            <button
              onClick={handleToggle}
              className={`p-1 rounded-md transition-colors ${
                hasChildren
                  ? "hover:bg-gray-200 text-gray-500"
                  : "text-transparent cursor-default"
              }`}
              disabled={!hasChildren}
            >
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  isExpanded ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Category Icon */}
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                level === 0
                  ? "bg-cyan-100 text-cyan-600"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>

            {/* Category Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p
                  className={`font-medium truncate ${
                    level === 0 ? "text-gray-900" : "text-gray-700 text-sm"
                  }`}
                >
                  {category.name}
                </p>
                {!category.isActive && (
                  <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full shrink-0">
                    Inactive
                  </span>
                )}
                {hasChildren && (
                  <span className="px-2 py-0.5 text-xs bg-cyan-50 text-cyan-600 rounded-full shrink-0">
                    {category.subcategories!.length}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">/{category.slug}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0 ml-2">
            {onAddSubcategory && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddSubcategory(category._id);
                }}
                className="p-1.5 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                title="Add subcategory"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </button>
            )}
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(category);
                }}
                className="p-1.5 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                title="Edit category"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(category._id);
                }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete category"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Children */}
        {hasChildren && (
          <div
            className={`overflow-hidden transition-all duration-200 ${
              isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="border-l-2 border-gray-100 ml-6">
              {category.subcategories!.map((child) => (
                <CategoryItem
                  key={child._id}
                  category={child}
                  level={level + 1}
                  expandedIds={expandedIds}
                  toggleExpand={toggleExpand}
                  selectedCategory={selectedCategory}
                  onSelectCategory={onSelectCategory}
                  variant={variant}
                  onAddSubcategory={onAddSubcategory}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Sidebar variant
  return (
    <div>
      <button
        onClick={handleSelect}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
          isSelected
            ? "bg-cyan-50 text-cyan-700 font-medium"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        {/* Expand/Collapse */}
        {hasChildren && (
          <span
            onClick={handleToggle}
            className="p-0.5 hover:bg-slate-200 rounded transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? "rotate-90" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        )}
        {!hasChildren && <span className="w-5" />}

        <span className="truncate">{category.name}</span>

        {hasChildren && (
          <span className="ml-auto text-xs text-slate-400">
            {category.subcategories!.length}
          </span>
        )}
      </button>

      {/* Children */}
      {hasChildren && (
        <div
          className={`overflow-hidden transition-all duration-200 ${
            isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {category.subcategories!.map((child) => (
            <CategoryItem
              key={child._id}
              category={child}
              level={level + 1}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
              selectedCategory={selectedCategory}
              onSelectCategory={onSelectCategory}
              variant={variant}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryTree({
  categories,
  selectedCategory,
  onSelectCategory,
  variant = "sidebar",
  onAddSubcategory,
  onEdit,
  onDelete,
}: CategoryTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (cats: Category[]) => {
      cats.forEach((cat) => {
        if (cat.subcategories && cat.subcategories.length > 0) {
          allIds.add(cat._id);
          collectIds(cat.subcategories);
        }
      });
    };
    collectIds(categories);
    setExpandedIds(allIds);
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <svg
          className="w-12 h-12 mx-auto mb-3 text-slate-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
        <p>No categories found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Expand/Collapse All Controls */}
      <div className="flex items-center justify-end gap-2 px-4 py-2 border-b border-gray-100">
        <button
          onClick={expandAll}
          className="text-xs text-slate-500 hover:text-cyan-600 transition-colors"
        >
          Expand all
        </button>
        <span className="text-slate-300">|</span>
        <button
          onClick={collapseAll}
          className="text-xs text-slate-500 hover:text-cyan-600 transition-colors"
        >
          Collapse all
        </button>
      </div>

      {/* Category Tree */}
      <div className={variant === "admin" ? "divide-y divide-gray-100" : "py-2"}>
        {categories.map((category) => (
          <CategoryItem
            key={category._id}
            category={category}
            level={0}
            expandedIds={expandedIds}
            toggleExpand={toggleExpand}
            selectedCategory={selectedCategory}
            onSelectCategory={onSelectCategory}
            variant={variant}
            onAddSubcategory={onAddSubcategory}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
