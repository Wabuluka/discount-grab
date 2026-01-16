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
  const products = useAppSelector((state) => state.products);
  const data = products.items as Product[];
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

  if (data.length === 0) {
    return null;
  }

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-sm text-cyan-600 font-medium uppercase tracking-widest mb-3">
            Featured Products
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Trending This Week
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
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
                  ? "bg-slate-900 text-white shadow-lg"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
                    ? "bg-slate-900 text-white shadow-lg"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Products grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <Card item={item} />
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No products found in this category</p>
            <button
              onClick={() => setActiveFilter("all")}
              className="mt-3 text-cyan-600 font-medium hover:underline"
            >
              View all products
            </button>
          </div>
        )}

        {/* View all button */}
        <div className="text-center mt-12">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors"
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
