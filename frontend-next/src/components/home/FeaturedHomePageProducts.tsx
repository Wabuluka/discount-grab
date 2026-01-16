"use client";

import { useState, useMemo } from "react";
import { useAppSelector } from "@/store/store";
import { Card } from "@/components/Card";
import type { Product } from "@/types/product";
import Link from "next/link";

// Helper to get category name from product
const getCategoryName = (product: Product): string | null => {
  if (!product.category) return null;
  if (typeof product.category === "string") return null;
  return product.category.name;
};

export default function FeaturedHomePageProducts() {
  const { items, loading } = useAppSelector((state) => state.products);
  const data = (items || []) as Product[];
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Get unique categories from products
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    data.forEach((product) => {
      const categoryName = getCategoryName(product);
      if (categoryName) {
        categorySet.add(categoryName);
      }
    });
    return Array.from(categorySet).slice(0, 4);
  }, [data]);

  // Filter products based on selected category
  const filteredProducts = useMemo(() => {
    if (activeFilter === "all") {
      return data.slice(0, 8);
    }
    return data
      .filter((product) => getCategoryName(product) === activeFilter)
      .slice(0, 8);
  }, [data, activeFilter]);

  // Don't render anything if not loading and no products
  if (!loading && data.length === 0) {
    return null;
  }

  return (
    <section className="py-20 md:py-28 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-sm text-cyan-600 dark:text-cyan-400 font-medium uppercase tracking-widest mb-3">
            Featured Products
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Trending This Week
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Discover our most popular products loved by customers
          </p>
        </div>

        {/* Category filters */}
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                activeFilter === "all"
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  activeFilter === category
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Products grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
          {loading
            ? [...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-pulse"
                >
                  <div className="aspect-square bg-slate-200 dark:bg-slate-700" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                  </div>
                </div>
              ))
            : filteredProducts.map((item) => (
                <div
                  key={item._id}
                  className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-cyan-200 dark:hover:border-cyan-700 hover:shadow-xl hover:shadow-cyan-500/10 dark:hover:shadow-cyan-400/5 transition-all duration-300 overflow-hidden"
                >
                  <Card item={item} />
                </div>
              ))}
        </div>

        {/* Empty state */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">No products found in this category</p>
            <button
              onClick={() => setActiveFilter("all")}
              className="mt-3 text-cyan-600 dark:text-cyan-400 font-medium hover:underline"
            >
              View all products
            </button>
          </div>
        )}

        {/* View all button */}
        <div className="text-center mt-12">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-medium rounded-xl hover:bg-slate-800 dark:hover:bg-white transition-colors"
          >
            View All Products
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
