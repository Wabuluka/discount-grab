"use client";

import { Card } from "@/components/Card";
import { useGetProducts } from "@/hooks/useGetProducts";
import type { Product } from "@/types/product";
import { getProductId } from "@/types/product";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { categoryApi, Category, getCategoryId } from "@/services/categoryApi";

type SortOption = "newest" | "price-low" | "price-high" | "name";
type ViewMode = "grid" | "list";

// Helper to get category ID from product
const getProductCategoryId = (product: Product): string | null => {
  if (!product.category) return null;
  if (typeof product.category === "string") return product.category;
  if (typeof product.category === "object" && product.category !== null) {
    return (product.category as { _id: string })._id;
  }
  return null;
};

// Helper to get category name from product
const getProductCategoryName = (product: Product): string | null => {
  if (!product.category) return null;
  if (typeof product.category === "string") return product.category;
  if (typeof product.category === "object" && product.category !== null) {
    return (product.category as { name: string }).name;
  }
  return null;
};

// Get all category IDs including children (for filtering by parent)
const getCategoryAndChildrenIds = (category: Category): string[] => {
  const ids: string[] = [getCategoryId(category)];
  if (category.subcategories) {
    category.subcategories.forEach((sub) => {
      ids.push(...getCategoryAndChildrenIds(sub));
    });
  }
  return ids;
};

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data, isLoading: productsLoading } = useGetProducts();
  const [category, setCategory] = useState<Category | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Fetch category by slug
  useEffect(() => {
    const fetchCategory = async () => {
      setCategoryLoading(true);
      setCategoryError(null);
      try {
        const response = await categoryApi.getCategoryBySlug(slug);
        setCategory(response.data.data);
      } catch (err) {
        console.error("Failed to fetch category:", err);
        setCategoryError("Category not found");
      } finally {
        setCategoryLoading(false);
      }
    };
    if (slug) {
      fetchCategory();
    }
  }, [slug]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!data?.products || !category) return [];

    // Get all category IDs (including subcategories)
    const categoryIds = getCategoryAndChildrenIds(category);

    let products = (data.products as Product[]).filter((p) => {
      const productCategoryId = getProductCategoryId(p);
      return productCategoryId && categoryIds.includes(productCategoryId);
    });

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        products.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        products.sort((a, b) => b.price - a.price);
        break;
      case "name":
        products.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "newest":
      default:
        products.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    return products;
  }, [data?.products, category, searchQuery, sortBy]);

  const isLoading = categoryLoading || productsLoading;

  // Loading state
  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-50 to-white mt-20">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-slate-600">Loading category...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (categoryError || !category) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-50 to-white mt-20">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Category Not Found
          </h1>
          <p className="text-slate-500 mb-6">
            The category &quot;{slug}&quot; doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white mt-20">
      {/* Hero Banner */}
      <div className="bg-linear-to-r from-cyan-600 via-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <nav className="flex items-center gap-2 text-cyan-100 text-sm mb-4">
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
            <Link href="/shop" className="hover:text-white transition-colors">
              Shop
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
            {category.parent && (
              <>
                <Link
                  href={`/category/${category.parent.slug}`}
                  className="hover:text-white transition-colors"
                >
                  {category.parent.name}
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
              </>
            )}
            <span className="text-white">{category.name}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-cyan-100 text-lg max-w-2xl">
              {category.description}
            </p>
          )}
          {category.totalProductCount !== undefined && (
            <p className="text-cyan-200 mt-2">
              {category.totalProductCount} products in this category
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Subcategories */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Subcategories
            </h2>
            <div className="flex flex-wrap gap-3">
              {category.subcategories.map((sub) => (
                <Link
                  key={sub._id}
                  href={`/category/${sub.slug}`}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:border-cyan-500 hover:text-cyan-600 transition-colors"
                >
                  {sub.name}
                  {sub.productCount !== undefined && (
                    <span className="ml-2 text-slate-400 text-sm">
                      ({sub.productCount})
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder={`Search in ${category.name}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none w-full sm:w-48 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all cursor-pointer pr-10"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
              <svg
                className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
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

            {/* View Toggle */}
            <div className="flex bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-cyan-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
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
                    ? "bg-white text-cyan-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
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
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-600">
            {productsLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></span>
                Loading products...
              </span>
            ) : (
              <>
                Showing{" "}
                <span className="font-semibold text-slate-900">
                  {filteredProducts.length}
                </span>{" "}
                {filteredProducts.length === 1 ? "product" : "products"}
                {searchQuery && (
                  <span className="text-slate-400"> (filtered)</span>
                )}
              </>
            )}
          </p>
          <Link
            href="/shop"
            className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
          >
            View All Products
          </Link>
        </div>

        {/* Loading State */}
        {productsLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100"
              >
                <div className="aspect-square bg-slate-100 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-slate-100 rounded animate-pulse w-1/2" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-6 bg-slate-100 rounded animate-pulse w-24" />
                    <div className="h-10 w-10 bg-slate-100 rounded-xl animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!productsLoading && filteredProducts.length > 0 && (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "flex flex-col gap-4"
            }
          >
            {filteredProducts.map((item: Product) => (
              <div
                key={getProductId(item)}
                className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all duration-300 ${
                  viewMode === "list" ? "flex flex-row" : ""
                }`}
              >
                {viewMode === "grid" ? (
                  <Card item={item} />
                ) : (
                  <ListCard item={item} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!productsLoading && filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              No products found
            </h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              {searchQuery
                ? "Try adjusting your search to find what you're looking for."
                : `No products are currently available in ${category.name}.`}
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// List view card component
function ListCard({ item }: { item: Product }) {
  const { formatAsCurrency } = require("@/utils/formatCurrency");
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row w-full">
      <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0 bg-slate-100">
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
        {item.stock === 0 && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
            Out of Stock
          </span>
        )}
      </div>
      <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
        <div>
          <Link href={`/product/${getProductId(item)}`}>
            <h3 className="text-lg font-semibold text-slate-900 hover:text-cyan-600 transition-colors mb-2">
              {item.title}
            </h3>
          </Link>
          {getProductCategoryName(item) && (
            <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md mb-2">
              {getProductCategoryName(item)}
            </span>
          )}
          <p className="text-slate-500 text-sm line-clamp-2">
            {item.description}
          </p>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <span className="text-xl font-bold text-cyan-600">
            {formatAsCurrency(item.price)}
          </span>
          <div className="flex items-center gap-3">
            {item.stock > 0 && (
              <span className="text-sm text-green-600 font-medium">
                In Stock
              </span>
            )}
            <Link
              href={`/product/${getProductId(item)}`}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm font-medium"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
