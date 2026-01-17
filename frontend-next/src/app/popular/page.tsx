"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/Card";
import { useGetPopularProducts } from "@/hooks/useGetPopularProducts";
import { categoryApi, Category, getCategoryId } from "@/services/categoryApi";
import { formatAsCurrency } from "@/utils/formatCurrency";
import type { Product } from "@/types/product";
import { getProductId } from "@/types/product";

type ViewMode = "grid" | "list";

const ITEMS_PER_PAGE = 12;

export default function PopularProductsPage() {
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const { data, isLoading } = useGetPopularProducts({
    page,
    limit: ITEMS_PER_PAGE,
    category: selectedCategory !== "all" ? selectedCategory : undefined,
  });

  const products = data?.products || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getCategoryTree();
        setCategories(response.data.data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Flatten categories for dropdown
  const flattenCategories = (cats: Category[], parentName?: string): { _id: string; name: string; displayName: string }[] => {
    const result: { _id: string; name: string; displayName: string }[] = [];
    cats.forEach((cat) => {
      const catId = getCategoryId(cat);
      const displayName = parentName ? `${parentName} → ${cat.name}` : cat.name;
      result.push({ _id: catId, name: cat.name, displayName });
      if (cat.subcategories && cat.subcategories.length > 0) {
        result.push(...flattenCategories(cat.subcategories, cat.name));
      }
    });
    return result;
  };

  const flatCategories = flattenCategories(categories);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-900 mt-20">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <nav className="flex items-center gap-2 text-amber-100 text-sm mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="text-white">Popular Products</span>
          </nav>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <svg
                className="w-8 h-8"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              Popular Products
            </h1>
          </div>
          <p className="text-amber-100 text-lg max-w-2xl">
            Discover our best-selling products loved by customers worldwide. Sorted by popularity based on sales.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters Bar */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Category Filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="appearance-none w-full sm:w-56 px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all cursor-pointer pr-10"
                  disabled={categoriesLoading}
                >
                  <option value="all">All Categories</option>
                  {flatCategories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.displayName}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-slate-600 text-amber-600 dark:text-amber-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
                aria-label="Grid view"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-white dark:bg-slate-600 text-amber-600 dark:text-amber-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
                aria-label="List view"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Active Filter */}
          {selectedCategory !== "all" && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Filter:</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm">
                {flatCategories.find((c) => c._id === selectedCategory)?.name || selectedCategory}
                <button
                  onClick={() => handleCategoryChange("all")}
                  className="ml-1 hover:text-amber-900 dark:hover:text-amber-300"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-600 dark:text-slate-400">
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-amber-500 dark:border-amber-400 border-t-transparent rounded-full animate-spin"></span>
                Loading popular products...
              </span>
            ) : (
              <>
                Showing{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {products.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {total}
                </span>{" "}
                popular products
              </>
            )}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700"
              >
                <div className="aspect-square bg-slate-100 dark:bg-slate-700 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded animate-pulse w-1/2" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-6 bg-slate-100 dark:bg-slate-700 rounded animate-pulse w-24" />
                    <div className="h-10 w-10 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && products.length > 0 && (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "flex flex-col gap-4"
            }
          >
            {products.map((item: Product, index: number) => (
              <div
                key={getProductId(item)}
                className={`relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:border-slate-200 dark:hover:border-slate-600 transition-all duration-300 ${
                  viewMode === "list" ? "flex flex-row" : ""
                }`}
              >
                {/* Popularity rank badge */}
                {(page === 1 && index < 3) && (
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] sm:text-xs font-bold rounded-full shadow-lg">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    #{index + 1}
                  </div>
                )}
                {/* Sales count badge */}
                {item.salesCount > 0 && (
                  <div className={`absolute ${(page === 1 && index < 3) ? 'top-10' : 'top-2'} right-2 sm:top-3 sm:right-3 z-10 px-2 py-1 bg-green-500/90 text-white text-[10px] sm:text-xs font-medium rounded-full`}>
                    {item.salesCount} sold
                  </div>
                )}
                {viewMode === "grid" ? (
                  <Card item={item} />
                ) : (
                  <ListCard item={item} rank={page === 1 ? index + 1 : undefined} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  // Show first page, last page, current page, and pages around current
                  return p === 1 || p === totalPages || Math.abs(p - page) <= 1;
                })
                .map((p, index, array) => {
                  // Add ellipsis if there's a gap
                  const showEllipsisBefore = index > 0 && p - array[index - 1] > 1;
                  return (
                    <span key={p} className="flex items-center">
                      {showEllipsisBefore && (
                        <span className="px-2 text-slate-400 dark:text-slate-500">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(p)}
                        className={`min-w-[40px] h-10 rounded-lg font-medium transition-colors ${
                          p === page
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                            : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  );
                })}
            </div>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && products.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-slate-400 dark:text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No popular products yet
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
              {selectedCategory !== "all"
                ? "No popular products found in this category. Try selecting a different category."
                : "Popular products will appear here once customers start purchasing."}
            </p>
            {selectedCategory !== "all" && (
              <button
                onClick={() => handleCategoryChange("all")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
              >
                View all categories
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// List view card component
function ListCard({ item, rank }: { item: Product; rank?: number }) {
  const [imageError, setImageError] = useState(false);

  const getCategoryName = (category: Product["category"]): string | null => {
    if (!category) return null;
    if (typeof category === "string") return category;
    return category.name;
  };

  return (
    <div className="flex flex-col sm:flex-row w-full">
      <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0 bg-slate-100 dark:bg-slate-700">
        <Link href={`/product/${getProductId(item)}`}>
          <Image
            src={
              imageError || !item.images?.[0]
                ? "/placeholder-product.svg"
                : item.images[0]
            }
            alt={item.title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        </Link>
        {rank && rank <= 3 && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            #{rank}
          </div>
        )}
        {item.stock === 0 && (
          <span className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
            Out of Stock
          </span>
        )}
      </div>
      <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
        <div>
          <Link href={`/product/${getProductId(item)}`}>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 hover:text-amber-600 dark:hover:text-amber-400 transition-colors mb-2">
              {item.title}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mb-2">
            {getCategoryName(item.category) && (
              <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-md">
                {getCategoryName(item.category)}
              </span>
            )}
            {item.salesCount > 0 && (
              <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-md">
                {item.salesCount} sold
              </span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2">
            {item.description}
          </p>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
            {formatAsCurrency(item.price)}
          </span>
          <div className="flex items-center gap-3">
            {item.stock > 0 && (
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                In Stock
              </span>
            )}
            <Link
              href={`/product/${getProductId(item)}`}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
