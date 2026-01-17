"use client";

import Link from "next/link";
import { Card } from "@/components/Card";
import { useGetPopularProducts } from "@/hooks/useGetPopularProducts";
import { getProductId } from "@/types/product";

export default function PopularProducts() {
  const { data, isLoading } = useGetPopularProducts({ limit: 4 });
  const products = data?.products || [];

  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <section className="py-20 md:py-28 bg-slate-50 dark:bg-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-sm text-cyan-600 dark:text-cyan-400 font-medium uppercase tracking-widest mb-3">
            Best Sellers
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Most Popular Products
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Our top-selling products loved by customers worldwide
          </p>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
          {isLoading
            ? [...Array(4)].map((_, i) => (
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
            : products.map((item, index) => (
                <div
                  key={getProductId(item)}
                  className="relative bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-cyan-200 dark:hover:border-cyan-700 hover:shadow-xl hover:shadow-cyan-500/10 dark:hover:shadow-cyan-400/5 transition-all duration-300 overflow-hidden"
                >
                  {/* Popularity badge */}
                  {index < 3 && (
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
                  <Card item={item} />
                </div>
              ))}
        </div>

        {/* View all button */}
        <div className="text-center mt-12">
          <Link
            href="/popular"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
          >
            View All Popular Products
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
