"use client";

import { Card } from "@/components/Card";
import { useGetProducts } from "@/hooks/useGetProducts";
import type { Product } from "@/types/product";
import { getProductId } from "@/types/product";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { categoryApi, Category, getCategoryId } from "@/services/categoryApi";
import CategoryTree from "@/components/CategoryTree";

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

// Flatten categories tree for dropdown with parent info
interface FlatCategory extends Category {
  parentName?: string;
}

const flattenCategories = (categories: Category[], parentName?: string): FlatCategory[] => {
  const result: FlatCategory[] = [];
  categories.forEach((cat) => {
    // Only set parentName if it's a valid non-empty string
    const validParentName = parentName && parentName.trim() ? parentName : undefined;
    const flatCat: FlatCategory = { ...cat, parentName: validParentName };
    result.push(flatCat);
    if (cat.subcategories && cat.subcategories.length > 0) {
      // Only pass cat.name if it's a valid string
      const nextParentName = cat.name && cat.name.trim() ? cat.name : undefined;
      result.push(...flattenCategories(cat.subcategories, nextParentName));
    }
  });
  return result;
};

// Get all category IDs including children (for filtering by parent)
const getCategoryAndChildrenIds = (
  categories: Category[],
  targetId: string
): string[] => {
  const ids: string[] = [];

  const findAndCollect = (cats: Category[]): boolean => {
    for (const cat of cats) {
      if (getCategoryId(cat) === targetId) {
        // Found the target, collect it and all children
        const collectIds = (c: Category) => {
          ids.push(getCategoryId(c));
          if (c.subcategories) {
            c.subcategories.forEach(collectIds);
          }
        };
        collectIds(cat);
        return true;
      }
      if (cat.subcategories && findAndCollect(cat.subcategories)) {
        return true;
      }
    }
    return false;
  };

  findAndCollect(categories);
  return ids;
};

function ShopPageContent() {
  const { data, isLoading } = useGetProducts();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Read category from URL on mount
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  // Update URL when category changes
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId === "all") {
      params.delete("category");
    } else {
      params.set("category", categoryId);
    }
    const newUrl = params.toString() ? `/shop?${params.toString()}` : "/shop";
    router.push(newUrl, { scroll: false });
  };

  // Fetch categories from database
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

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!data?.products) return [];

    let products = [...data.products] as Product[];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    // Category filter (include products from child categories)
    if (selectedCategory !== "all") {
      const categoryIds = getCategoryAndChildrenIds(categories, selectedCategory);
      products = products.filter((p) => {
        const productCategoryId = getProductCategoryId(p);
        return productCategoryId && categoryIds.includes(productCategoryId);
      });
    }

    // Price range filter
    products = products.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

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
  }, [data?.products, searchQuery, selectedCategory, sortBy, priceRange, categories]);

  const clearFilters = () => {
    setSearchQuery("");
    handleCategoryChange("all");
    setSortBy("newest");
    setPriceRange([0, 10000000]);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "all" ||
    priceRange[0] > 0 ||
    priceRange[1] < 10000000;

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-900 mt-20">
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
            <span className="text-white">Shop</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Explore Our Collection
          </h1>
          <p className="text-cyan-100 text-lg max-w-2xl">
            Discover the latest electronics from top brands. Quality products at
            unbeatable prices.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Category Sidebar - Desktop */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 sticky top-24">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-cyan-600 dark:text-cyan-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                  Categories
                </h2>
              </div>
              {categoriesLoading ? (
                <div className="p-6 text-center">
                  <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : (
                <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                  <div className="py-2">
                    <button
                      onClick={() => handleCategoryChange("all")}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors ${
                        selectedCategory === "all"
                          ? "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 font-medium border-l-2 border-cyan-600 dark:border-cyan-400"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
                      }`}
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
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        />
                      </svg>
                      All Categories
                    </button>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-700">
                    <CategoryTree
                      categories={categories}
                      selectedCategory={selectedCategory}
                      onSelectCategory={(id) => handleCategoryChange(id)}
                      variant="sidebar"
                    />
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Mobile Category Sidebar */}
          <div
            className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
              sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div
              className={`absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-slate-900 shadow-xl transform transition-transform duration-300 ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">Categories</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="overflow-y-auto h-[calc(100%-65px)]">
                <div className="py-2">
                  <button
                    onClick={() => {
                      handleCategoryChange("all");
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors ${
                      selectedCategory === "all"
                        ? "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 font-medium"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    All Categories
                  </button>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-700">
                  <CategoryTree
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={(id) => {
                      handleCategoryChange(id);
                      setSidebarOpen(false);
                    }}
                    variant="sidebar"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
        {/* Search and Filters Bar */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Mobile Category Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
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
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
              Browse Categories
            </button>

            {/* Search Input */}
            <div className="relative flex-1">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500"
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
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-transparent transition-all"
              />
            </div>

            {/* Category Filter - Hidden on desktop since we have sidebar */}
            <div className="relative lg:hidden">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="appearance-none w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-transparent transition-all cursor-pointer pr-10"
                disabled={categoriesLoading}
              >
                <option value="all">All Categories</option>
                {flattenCategories(categories).map((cat) => (
                  <option key={getCategoryId(cat)} value={getCategoryId(cat)}>
                    {cat.parentName && cat.parentName !== "undefined"
                      ? `${cat.parentName} → ${cat.name}`
                      : cat.name || "Unnamed Category"}
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

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none w-full lg:w-48 px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-transparent transition-all cursor-pointer pr-10"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
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

            {/* View Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-slate-600 text-cyan-600 dark:text-cyan-400 shadow-sm"
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
                    ? "bg-white dark:bg-slate-600 text-cyan-600 dark:text-cyan-400 shadow-sm"
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

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-full text-sm">
                  Search: {searchQuery}
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-1 hover:text-cyan-900"
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
              )}
              {selectedCategory !== "all" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm">
                  {flattenCategories(categories).find((c) => getCategoryId(c) === selectedCategory)?.name || selectedCategory}
                  <button
                    onClick={() => handleCategoryChange("all")}
                    className="ml-1 hover:text-blue-900"
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
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline ml-2"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-600 dark:text-slate-400">
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-cyan-500 dark:border-cyan-400 border-t-transparent rounded-full animate-spin"></span>
                Loading products...
              </span>
            ) : (
              <>
                Showing{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {filteredProducts.length}
                </span>{" "}
                {filteredProducts.length === 1 ? "product" : "products"}
                {hasActiveFilters && (
                  <span className="text-slate-400 dark:text-slate-500"> (filtered)</span>
                )}
              </>
            )}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
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
        {!isLoading && filteredProducts.length > 0 && (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                : "flex flex-col gap-4"
            }
          >
            {filteredProducts.map((item: Product) => (
              <div
                key={getProductId(item)}
                className={`bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:border-slate-200 dark:hover:border-slate-600 transition-all duration-300 ${
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
        {!isLoading && filteredProducts.length === 0 && (
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No products found
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
              {hasActiveFilters
                ? "Try adjusting your search or filter criteria to find what you're looking for."
                : "Check back later for new products."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Clear all filters
              </button>
            )}
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}

// List view card component
function ListCard({ item }: { item: Product }) {
  const { formatAsCurrency } = require("@/utils/formatCurrency");
  const [imageError, setImageError] = useState(false);
  const Image = require("next/image").default;
  const Link = require("next/link").default;

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
        {item.stock === 0 && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
            Out of Stock
          </span>
        )}
      </div>
      <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
        <div>
          <Link href={`/product/${getProductId(item)}`}>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors mb-2">
              {item.title}
            </h3>
          </Link>
          {getProductCategoryName(item) && (
            <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-md mb-2">
              {getProductCategoryName(item)}
            </span>
          )}
          <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2">
            {item.description}
          </p>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <span className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
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

// Loading fallback for Suspense
function ShopPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-slate-200 dark:bg-slate-700 rounded-xl h-64"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopPageLoading />}>
      <ShopPageContent />
    </Suspense>
  );
}
