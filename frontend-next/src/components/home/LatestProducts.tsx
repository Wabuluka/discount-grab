"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { addToCart } from "@/store/slices/cartSlice";
import { productApi } from "@/services/productApi";
import { formatAsCurrency } from "@/utils/formatCurrency";
import type { Product } from "@/types/product";
import { getProductId } from "@/types/product";

const PLACEHOLDER_IMAGE = "/placeholder-product.svg";

// Helper to get category name
const getCategoryName = (product: Product): string | null => {
  if (!product.category) return null;
  if (typeof product.category === "string") return null;
  return product.category.name;
};

interface ProductCardProps {
  product: Product;
  index: number;
}

function ProductCard({ product, index }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { loading } = useAppSelector((state) => state.cart);
  const [adding, setAdding] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }

    setAdding(true);
    try {
      await dispatch(addToCart({ productId: getProductId(product), quantity: 1 })).unwrap();
    } finally {
      setAdding(false);
    }
  };

  const imageUrl = imageError || !product.images?.[0] ? PLACEHOLDER_IMAGE : product.images[0];

  return (
    <div
      className="group"
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700">
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-slate-50 dark:bg-slate-900">
          <Link href={`/product/${getProductId(product)}`} className="block h-full">
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className={`object-cover transition-transform duration-500 ${isHovered ? "scale-105" : "scale-100"}`}
              onError={() => setImageError(true)}
            />
          </Link>

          {/* NEW Badge */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-2.5 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-md">
              NEW
            </span>
          </div>

          {/* Sale Badge */}
          {product.isOnSale && product.discountPercent && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center px-2.5 py-1 bg-red-500 text-white text-xs font-semibold rounded-md">
                -{product.discountPercent}%
              </span>
            </div>
          )}

          {/* Quick Actions - Appear on hover */}
          <div
            className={`absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent transition-all duration-300 ${
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                disabled={loading || adding || product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-slate-900 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                {adding ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Add to Cart
                  </>
                )}
              </button>
              <Link
                href={`/product/${getProductId(product)}`}
                className="flex items-center justify-center p-2.5 bg-white/90 text-slate-900 rounded-lg hover:bg-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          {getCategoryName(product) && (
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
              {getCategoryName(product)}
            </p>
          )}

          {/* Title */}
          <Link href={`/product/${getProductId(product)}`}>
            <h3 className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-2">
              {product.title}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            {product.isOnSale && product.salePrice != null ? (
              <>
                <span className="text-lg font-semibold text-slate-900 dark:text-white">
                  {formatAsCurrency(product.salePrice)}
                </span>
                <span className="text-sm text-slate-400 line-through">
                  {formatAsCurrency(product.price)}
                </span>
              </>
            ) : (
              <span className="text-lg font-semibold text-slate-900 dark:text-white">
                {formatAsCurrency(product.price)}
              </span>
            )}
          </div>

          {/* Low Stock Warning */}
          {product.stock > 0 && product.stock <= 5 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
              Only {product.stock} left
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Skeleton loader
function ProductSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 animate-pulse">
      <div className="aspect-[4/5] bg-slate-200 dark:bg-slate-700" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </div>
  );
}

export default function LatestProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const response = await productApi.getLatestProducts({ limit: 4 });
        setProducts((response.data.products || []).slice(0, 4));
      } catch (err) {
        setError("Failed to load latest products");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProducts();
  }, []);

  if (!loading && products.length === 0 && !error) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white">
              Latest Arrivals
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Fresh styles just added to our collection
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            View All
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Products Grid */}
        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {loading
            ? [...Array(4)].map((_, i) => <ProductSkeleton key={i} />)
            : products.map((product, index) => (
                <ProductCard key={getProductId(product)} product={product} index={index} />
              ))}
        </div>
      </div>
    </section>
  );
}
