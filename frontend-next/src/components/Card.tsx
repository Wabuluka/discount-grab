"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { addToCart } from "@/store/slices/cartSlice";
import { formatAsCurrency } from "@/utils/formatCurrency";

type CardItem = {
  _id: string;
  title: string;
  category?: { _id: string; name: string; slug: string } | string;
  price: number;
  images?: string[];
  stock: number;
};

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
      await dispatch(addToCart({ productId: item._id, quantity: 1 })).unwrap();
    } finally {
      setAdding(false);
    }
  };

  const imageUrl = imageError || !item.images?.[0] ? PLACEHOLDER_IMAGE : item.images[0];

  return (
    <div className="flex flex-col h-full">
      <figure className="relative aspect-square bg-slate-100 rounded-t-2xl overflow-hidden">
        <Link href={`/product/${item._id}`} className="block w-full h-full">
          <Image
            src={imageUrl}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        </Link>
        {item.stock === 0 && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
            Out of Stock
          </div>
        )}
        {item.stock > 0 && item.stock <= 5 && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
            Only {item.stock} left
          </div>
        )}
      </figure>
      <div className="flex flex-col flex-1 p-4">
        <Link href={`/product/${item._id}`}>
          <h2 className="text-slate-900 font-semibold hover:text-cyan-600 line-clamp-2 transition-colors mb-1">
            {item.title}
          </h2>
        </Link>
        {getCategoryName(item.category) && (
          <span className="text-slate-500 text-sm mb-3">{getCategoryName(item.category)}</span>
        )}
        <div className="flex justify-between items-center mt-auto pt-3 border-t border-slate-100">
          <span className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            {formatAsCurrency(item.price)}
          </span>
          <button
            className="p-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            onClick={handleAddToCart}
            disabled={loading || adding || item.stock === 0}
            aria-label="Add to cart"
          >
            {adding ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
