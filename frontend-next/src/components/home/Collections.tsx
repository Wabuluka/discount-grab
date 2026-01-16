"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { categoryApi, Category } from "@/services/categoryApi";

// Default collection images for categories without images
const defaultCollectionImages: Record<string, string> = {
  electronics:
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
  phones:
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
  laptops:
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
  audio:
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
  gaming:
    "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&q=80",
  accessories:
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
  wearables:
    "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=80",
  cameras:
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
  tablets:
    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80",
  default:
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
};

// Color themes for categories
const categoryColors = [
  {
    gradient: "from-cyan-500 to-blue-600",
    bg: "bg-cyan-500/20",
    border: "border-cyan-400/30",
    glow: "shadow-cyan-500/20",
  },
  {
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-500/20",
    border: "border-violet-400/30",
    glow: "shadow-violet-500/20",
  },
  {
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-500/20",
    border: "border-emerald-400/30",
    glow: "shadow-emerald-500/20",
  },
  {
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-amber-500/20",
    border: "border-amber-400/30",
    glow: "shadow-amber-500/20",
  },
  {
    gradient: "from-rose-500 to-pink-600",
    bg: "bg-rose-500/20",
    border: "border-rose-400/30",
    glow: "shadow-rose-500/20",
  },
  {
    gradient: "from-indigo-500 to-blue-600",
    bg: "bg-indigo-500/20",
    border: "border-indigo-400/30",
    glow: "shadow-indigo-500/20",
  },
];

// Get image for a category based on name/slug
const getCategoryImage = (category: Category): string => {
  const slug = category.slug?.toLowerCase() || category.name.toLowerCase();

  if (defaultCollectionImages[slug]) {
    return defaultCollectionImages[slug];
  }

  for (const key of Object.keys(defaultCollectionImages)) {
    if (slug.includes(key) || key.includes(slug)) {
      return defaultCollectionImages[key];
    }
  }

  return defaultCollectionImages.default;
};

// Get image for category - prefer database image, fallback to default
const getDisplayImage = (category: Category): string => {
  if (category.image) {
    return category.image;
  }
  return getCategoryImage(category);
};

export default function Collections() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getCategoryTree();
        const rootCategories = response.data.data.filter(
          (cat: Category) => !cat.parent
        );
        setCategories(rootCategories.slice(0, 6));
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-20 md:py-28 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="h-10 w-56 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse mx-auto mb-4" />
            <div className="h-5 w-80 bg-slate-100 dark:bg-slate-600 rounded-lg animate-pulse mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] bg-slate-200 dark:bg-slate-700 rounded-3xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-20 md:py-28 bg-slate-50 dark:bg-slate-800 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-14 md:mb-18">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium rounded-full mb-6 shadow-sm">
            <svg
              className="w-4 h-4 text-cyan-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            Shop by Category
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-5 tracking-tight">
            Explore Our{" "}
            <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
              Collections
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Discover premium products across our carefully curated categories
          </p>
        </div>

        {/* Collections Grid - Bento style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {categories.map((category, index) => {
            const colorTheme = categoryColors[index % categoryColors.length];
            const productCount =
              category.totalProductCount || category.productCount || 0;

            return (
              <Link
                key={category._id}
                href={`/shop?category=${category._id}`}
                className={`group relative rounded-3xl overflow-hidden bg-white dark:bg-slate-700 shadow-lg hover:shadow-2xl ${colorTheme.glow} transition-all duration-500 hover:-translate-y-1`}
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={getDisplayImage(category)}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Colored overlay on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${colorTheme.gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-500`}
                  />

                  {/* Product Count Badge */}
                  <div className="absolute top-4 right-4">
                    <div
                      className={`px-3 py-1.5 ${colorTheme.bg} backdrop-blur-md border ${colorTheme.border} rounded-full`}
                    >
                      <span className="text-white text-xs font-semibold">
                        {productCount} {productCount === 1 ? "item" : "items"}
                      </span>
                    </div>
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:translate-x-1 transition-transform duration-300">
                      {category.name}
                    </h3>

                    {/* Shop Now Button */}
                    <div className="flex items-center gap-2 text-white/90 group-hover:text-white">
                      <span className="text-sm font-medium tracking-wide uppercase">
                        Shop Now
                      </span>
                      <svg
                        className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300"
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
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-14">
          <Link
            href="/shop"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold rounded-2xl hover:bg-slate-800 dark:hover:bg-white transition-all duration-300 shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:shadow-slate-900/20"
          >
            <span>View All Categories</span>
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <svg
                className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform"
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
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
