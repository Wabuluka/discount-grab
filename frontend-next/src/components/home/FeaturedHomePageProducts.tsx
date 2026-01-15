"use client";

import { useAppSelector } from "@/store/store";
import { Card } from "@/components/Card";
import type { Product } from "@/types/product";
import Link from "next/link";

export default function FeaturedHomePageProducts() {
  const products = useAppSelector((state) => state.products);
  const data = products.items as Product[];

  if (data.length === 0) {
    return null;
  }

  // Limit to 8 featured products for home page
  const featuredProducts = data.slice(0, 8);

  return (
    <section className="relative py-20 md:py-28 bg-white overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="relative container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 rounded-full mb-4">
              <svg
                className="w-4 h-4 text-cyan-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
              <span className="text-cyan-600 text-sm font-medium">
                Featured Products
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Trending{" "}
              <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                Electronics
              </span>
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl">
              Discover our handpicked selection of the latest and most popular
              electronics. Quality guaranteed.
            </p>
          </div>

          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all duration-300 shrink-0"
          >
            View All Products
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-3 mb-10">
          <button className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium rounded-full shadow-lg shadow-cyan-500/25 transition-all duration-300">
            All Products
          </button>
          <button className="px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-full hover:bg-slate-200 transition-all duration-300">
            Smartphones
          </button>
          <button className="px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-full hover:bg-slate-200 transition-all duration-300">
            Laptops
          </button>
          <button className="px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-full hover:bg-slate-200 transition-all duration-300">
            Audio
          </button>
          <button className="px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-full hover:bg-slate-200 transition-all duration-300">
            Accessories
          </button>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredProducts.map((item) => (
            <div
              key={item._id}
              className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-cyan-100 transition-all duration-300 overflow-hidden"
            >
              <Card item={item} />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-cyan-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">Limited Time Offer</p>
                <p className="text-slate-400 text-sm">
                  Get up to 40% off on selected items
                </p>
              </div>
            </div>
            <Link
              href="/shop"
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
