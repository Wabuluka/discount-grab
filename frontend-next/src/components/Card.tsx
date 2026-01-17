"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { addToCart } from "@/store/slices/cartSlice";
import { formatAsCurrency } from "@/utils/formatCurrency";

type CardItem = {
  _id?: string;
  id?: string;
  title: string;
  category?: { _id?: string; id?: string; name: string; slug: string } | string;
  price: number;
  salePrice?: number | null;
  discountPercent?: number;
  isOnSale?: boolean;
  images?: string[];
  stock: number;
};

// Helper to get item ID (handles both _id and id from backend)
const getItemId = (item: CardItem): string => item.id || item._id || "";

// Helper to get category name
const getCategoryName = (category: CardItem["category"]): string | null => {
  if (!category) return null;
  if (typeof category === "string") return category;
  return category.name;
};

const PLACEHOLDER_IMAGE = "/placeholder-product.svg";

export const Card = ({ item }: { item: CardItem }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { loading } = useAppSelector((state) => state.cart);
  const [adding, setAdding] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }

    setAdding(true);
    try {
      await dispatch(addToCart({ productId: getItemId(item), quantity: 1 })).unwrap();
    } finally {
      setAdding(false);
    }
  };

  const imageUrl = imageError || !item.images?.[0] ? PLACEHOLDER_IMAGE : item.images[0];

  return (
    <div className="group flex flex-col h-full">
      {/* Image container */}
      <figure className="relative aspect-[4/5] sm:aspect-square bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-t-xl sm:rounded-t-2xl overflow-hidden">
        <Link href={`/product/${getItemId(item)}`} className="block w-full h-full">
          <Image
            src={imageUrl}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            onError={() => setImageError(true)}
          />
          {/* Overlay on hover */}
          <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300`} />
        </Link>

        {/* Sale badge */}
        {item.isOnSale && item.discountPercent && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-0.5 sm:px-3 sm:py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] sm:text-xs font-bold rounded-full shadow-lg">
            -{item.discountPercent}%
          </div>
        )}

        {/* Stock badges */}
        {item.stock === 0 && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-0.5 sm:px-3 sm:py-1 bg-red-500 text-white text-[10px] sm:text-xs font-semibold rounded-full shadow-lg">
            Out of Stock
          </div>
        )}
        {item.stock > 0 && item.stock <= 5 && !item.isOnSale && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-0.5 sm:px-3 sm:py-1 bg-orange-500 text-white text-[10px] sm:text-xs font-semibold rounded-full shadow-lg">
            Only {item.stock} left
          </div>
        )}

        {/* Quick add button - visible on hover (desktop) or always visible (mobile) */}
        <button
          className={`absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 py-2 sm:py-2.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 opacity-100 translate-y-0 sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed`}
          onClick={handleAddToCart}
          disabled={loading || adding || item.stock === 0}
        >
          {adding ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="hidden sm:inline">Adding...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </figure>

      {/* Content */}
      <div className="flex flex-col flex-1 p-2.5 sm:p-4 bg-white dark:bg-slate-800 rounded-b-xl sm:rounded-b-2xl">
        {/* Category */}
        {getCategoryName(item.category) && (
          <span className="text-cyan-600 dark:text-cyan-400 text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-1">
            {getCategoryName(item.category)}
          </span>
        )}

        {/* Title */}
        <Link href={`/product/${getItemId(item)}`}>
          <h2 className="text-slate-900 dark:text-slate-100 text-sm sm:text-base font-semibold hover:text-cyan-600 dark:hover:text-cyan-400 line-clamp-2 transition-colors leading-tight sm:leading-normal">
            {item.title}
          </h2>
        </Link>

        {/* Price and action */}
        <div className="flex justify-between items-center mt-auto pt-2 sm:pt-3">
          <div className="flex flex-col">
            {item.isOnSale && item.salePrice != null ? (
              <>
                <span className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 line-through">
                  {formatAsCurrency(item.price)}
                </span>
                <span className="text-base sm:text-lg font-bold text-red-600 dark:text-red-500">
                  {formatAsCurrency(item.salePrice)}
                </span>
              </>
            ) : (
              <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {formatAsCurrency(item.price)}
              </span>
            )}
          </div>

          {/* Small cart button for desktop */}
          <button
            className="hidden sm:flex p-2 sm:p-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg sm:rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            onClick={handleAddToCart}
            disabled={loading || adding || item.stock === 0}
            aria-label="Add to cart"
          >
            {adding ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
