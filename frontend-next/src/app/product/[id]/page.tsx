"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { addToCart } from "@/store/slices/cartSlice";
import { useSingleProduct } from "@/hooks/useSingleProduct";
import { formatAsCurrency } from "@/utils/formatCurrency";
import type { ProductCategory } from "@/types/product";
import { getProductId } from "@/types/product";

// Helper to get category info
const getCategoryInfo = (category: ProductCategory | string | undefined): { id: string; name: string } | null => {
  if (!category) return null;
  if (typeof category === "string") return { id: category, name: category };
  return { id: category.id || category._id || "", name: category.name };
};

// Countdown timer hook for sale end date
function useCountdown(endDate: string | null | undefined) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    if (!endDate) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const end = new Date(endDate).getTime();
      const now = new Date().getTime();
      const difference = end - now;

      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return timeLeft;
}

export default function SingleProductPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const dispatch = useAppDispatch();
  const product = useSingleProduct(id ?? "");
  const { data, isLoading } = product;
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { loading: cartLoading } = useAppSelector((state) => state.cart);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);

  // Countdown for sale end date
  const saleCountdown = useCountdown(data?.discountEndDate);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    if (!id) return;

    try {
      await dispatch(addToCart({ productId: id, quantity })).unwrap();
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch {
      // Error is handled by redux
    }
  };

  // Image navigation
  const images = data?.images?.length ? data.images : ["https://via.placeholder.com/600x600?text=No+Image"];

  const nextImage = useCallback(() => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") setIsLightboxOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, nextImage, prevImage]);

  // Handle zoom on hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex justify-center items-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-cyan-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <div className="text-center">
            <p className="text-gray-900 font-semibold text-lg">Loading Product</p>
            <p className="text-gray-500 text-sm">Please wait a moment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col justify-center items-center px-4">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Product Not Found</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            The product you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-xl hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-600/25 hover:shadow-xl hover:shadow-cyan-600/30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Browse Products
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hasSpecs = data.specs && Object.keys(data.specs).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-cyan-600 transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/shop" className="text-gray-500 hover:text-cyan-600 transition-colors">
              Shop
            </Link>
            {getCategoryInfo(data.category) && (
              <>
                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <Link href={`/shop?category=${getCategoryInfo(data.category)?.id}`} className="text-gray-500 hover:text-cyan-600 transition-colors">
                  {getCategoryInfo(data.category)?.name}
                </Link>
              </>
            )}
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{data.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Gallery Section */}
            <div className="p-6 lg:p-10 bg-gradient-to-br from-gray-50 to-gray-100/50">
              {/* Main Image with Zoom */}
              <div className="relative mb-6">
                <div
                  className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-xl group cursor-pointer border border-gray-200"
                  onClick={() => setIsLightboxOpen(true)}
                  onMouseEnter={() => setIsZooming(true)}
                  onMouseLeave={() => setIsZooming(false)}
                  onMouseMove={handleMouseMove}
                >
                  {/* Main Image */}
                  <Image
                    alt={data.title}
                    src={images[selectedImage]}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />

                  {/* Zoom Lens Effect (Desktop) */}
                  {isZooming && (
                    <div
                      className="absolute inset-0 hidden lg:block pointer-events-none"
                      style={{
                        background: `url(${images[selectedImage]}) no-repeat`,
                        backgroundSize: "250%",
                        backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                        opacity: 1,
                      }}
                    />
                  )}

                  {/* Out of Stock Overlay */}
                  {data.stock === 0 && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                      <div className="bg-red-600 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
                        Out of Stock
                      </div>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

                  {/* Expand Icon */}
                  <button
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLightboxOpen(true);
                    }}
                  >
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </button>

                  {/* Image Counter Badge */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm">
                      {selectedImage + 1} / {images.length}
                    </div>
                  )}
                </div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 z-10"
                    >
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 z-10"
                    >
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="relative bg-white rounded-xl p-2 shadow-sm border border-gray-100">
                  <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative w-16 h-16 sm:w-18 sm:h-18 flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200 ${
                          selectedImage === index
                            ? "ring-2 ring-cyan-500 ring-offset-1 shadow-md"
                            : "border border-gray-200 hover:border-cyan-400 opacity-50 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${data.title} view ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="72px"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile Dots Indicator */}
              {images.length > 1 && (
                <div className="flex justify-center mt-4 lg:hidden">
                  <div className="flex gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          selectedImage === index
                            ? "bg-cyan-600 w-8"
                            : "bg-gray-300 w-2 hover:bg-gray-400"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Product Details Section */}
            <div className="p-6 lg:p-10 flex flex-col">
              {/* Category Badge & SKU */}
              <div className="flex items-center justify-between mb-4">
                {getCategoryInfo(data.category) && (
                  <Link
                    href={`/shop?category=${getCategoryInfo(data.category)?.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 text-xs font-bold rounded-full uppercase tracking-wider hover:from-cyan-100 hover:to-blue-100 transition-all"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    {getCategoryInfo(data.category)?.name}
                  </Link>
                )}
                <span className="text-xs text-gray-400 font-mono">SKU: {getProductId(data).slice(-8).toUpperCase()}</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {data.title}
              </h1>

              {/* Rating Placeholder */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${star <= 4 ? "text-amber-400" : "text-gray-200"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-500">4.0 (24 reviews)</span>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-green-600 font-medium">142 sold</span>
              </div>

              {/* Price Section */}
              <div className="rounded-2xl p-6 mb-6 bg-gray-50 border border-gray-100">
                {data.isOnSale && data.salePrice != null ? (
                  <div className="space-y-4">
                    {/* Discount Badge */}
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm font-semibold rounded-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {data.discountPercent}% OFF
                      </span>
                      {saleCountdown && (
                        <span className="text-sm text-gray-500">
                          Ends in {saleCountdown.days > 0 ? `${saleCountdown.days}d ` : ""}
                          {String(saleCountdown.hours).padStart(2, "0")}:
                          {String(saleCountdown.minutes).padStart(2, "0")}:
                          {String(saleCountdown.seconds).padStart(2, "0")}
                        </span>
                      )}
                    </div>

                    {/* Prices */}
                    <div className="flex items-baseline gap-4">
                      <span className="text-4xl lg:text-5xl font-bold text-gray-900">
                        {formatAsCurrency(data.salePrice)}
                      </span>
                      <span className="text-xl text-gray-400 line-through">
                        {formatAsCurrency(data.price)}
                      </span>
                    </div>

                    {/* Savings */}
                    <div className="flex items-center gap-2 text-green-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm font-medium">
                        You save {formatAsCurrency(data.price - data.salePrice)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 pt-3 border-t border-gray-200">
                      Tax included. Shipping calculated at checkout.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-end gap-3">
                      <span className="text-4xl lg:text-5xl font-bold text-gray-900">
                        {formatAsCurrency(data.price)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Tax included. Shipping calculated at checkout.</p>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {data.stock > 0 ? (
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex h-4 w-4 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                    </div>
                    <div>
                      <span className="text-green-800 font-semibold">In Stock</span>
                      <span className="text-green-600 ml-2">
                        {data.stock > 10 ? "Ready to ship" : `Only ${data.stock} left!`}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                    <span className="h-4 w-4 rounded-full bg-red-500"></span>
                    <div>
                      <span className="text-red-800 font-semibold">Out of Stock</span>
                      <span className="text-red-600 ml-2">Notify me when available</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Quantity
                </label>
                <div className="flex items-center">
                  <button
                    className="w-14 h-14 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-l-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                    </svg>
                  </button>
                  <div className="w-20 h-14 flex items-center justify-center bg-gray-50 border-y border-gray-200 font-bold text-xl text-gray-900">
                    {quantity}
                  </div>
                  <button
                    className="w-14 h-14 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-r-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setQuantity((q) => Math.min(data.stock, q + 1))}
                    disabled={quantity >= data.stock || data.stock === 0}
                  >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  {data.stock > 0 && data.stock <= 10 && (
                    <span className="ml-4 text-sm text-amber-600 font-medium">
                      Only {data.stock} left in stock
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-8">
                <button
                  className={`flex-1 h-16 flex items-center justify-center gap-3 rounded-2xl font-bold text-lg transition-all duration-300 ${
                    addedToCart
                      ? "bg-green-500 text-white scale-[1.02]"
                      : data.stock === 0
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-xl shadow-cyan-600/30 hover:shadow-2xl hover:shadow-cyan-600/40 hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                  onClick={handleAddToCart}
                  disabled={cartLoading || data.stock === 0}
                >
                  {cartLoading ? (
                    <div className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : addedToCart ? (
                    <>
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>
                <button
                  className="w-16 h-16 flex items-center justify-center bg-white border-2 border-gray-200 rounded-2xl hover:border-pink-300 hover:bg-pink-50 transition-all group"
                  aria-label="Add to wishlist"
                >
                  <svg
                    className="w-7 h-7 text-gray-400 group-hover:text-pink-500 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button
                  className="w-16 h-16 flex items-center justify-center bg-white border-2 border-gray-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
                  aria-label="Share product"
                >
                  <svg
                    className="w-7 h-7 text-gray-400 group-hover:text-blue-500 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Free Shipping</p>
                    <p className="text-xs text-gray-500">Orders $50+</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Secure Payment</p>
                    <p className="text-xs text-gray-500">256-bit SSL</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Easy Returns</p>
                    <p className="text-xs text-gray-500">30-day policy</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">24/7 Support</p>
                    <p className="text-xs text-gray-500">Live chat</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="border-t border-gray-200">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-200 px-6 lg:px-10 overflow-x-auto">
              <button
                onClick={() => setActiveTab("description")}
                className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "description"
                    ? "border-cyan-600 text-cyan-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Description
              </button>
              {hasSpecs && (
                <button
                  onClick={() => setActiveTab("specs")}
                  className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === "specs"
                      ? "border-cyan-600 text-cyan-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Specifications
                </button>
              )}
              <button
                onClick={() => setActiveTab("reviews")}
                className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "reviews"
                    ? "border-cyan-600 text-cyan-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Reviews (24)
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6 lg:p-10">
              {activeTab === "description" && (
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {data.description}
                  </p>
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Premium Quality</h4>
                        <p className="text-sm text-gray-500">Made with the finest materials</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Fast Delivery</h4>
                        <p className="text-sm text-gray-500">Ships within 24 hours</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Satisfaction Guaranteed</h4>
                        <p className="text-sm text-gray-500">100% money-back guarantee</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "specs" && hasSpecs && (
                <div className="max-w-2xl">
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(data.specs!).map(([key, value]) => (
                        <tr key={key}>
                          <td className="py-4 pr-4 text-sm font-medium text-gray-500 w-1/3">{key}</td>
                          <td className="py-4 text-sm text-gray-900">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="max-w-3xl">
                  {/* Reviews Summary */}
                  <div className="flex items-center gap-8 mb-8 p-6 bg-gray-50 rounded-2xl">
                    <div className="text-center">
                      <div className="text-5xl font-black text-gray-900">4.0</div>
                      <div className="flex items-center justify-center gap-0.5 my-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-5 h-5 ${star <= 4 ? "text-amber-400" : "text-gray-200"}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <div className="text-sm text-gray-500">24 reviews</div>
                    </div>
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 w-3">{rating}</span>
                          <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full"
                              style={{ width: rating === 5 ? "45%" : rating === 4 ? "30%" : rating === 3 ? "15%" : rating === 2 ? "7%" : "3%" }}
                            />
                          </div>
                          <span className="text-sm text-gray-500 w-8">
                            {rating === 5 ? "45%" : rating === 4 ? "30%" : rating === 3 ? "15%" : rating === 2 ? "7%" : "3%"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sample Review */}
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          J
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">John D.</span>
                            <span className="text-xs text-gray-400">Verified Buyer</span>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg key={star} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-xs text-gray-400">2 weeks ago</span>
                          </div>
                          <p className="text-gray-600">
                            Excellent product! Exactly as described and arrived quickly. The quality exceeded my expectations. Would definitely recommend to others.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button className="mt-6 w-full py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                    Load More Reviews
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-50"
            onClick={() => setIsLightboxOpen(false)}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 text-white/80 text-sm font-medium">
            {selectedImage + 1} / {images.length}
          </div>

          {/* Main Image */}
          <div
            className="relative w-full h-full max-w-5xl max-h-[85vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[selectedImage]}
              alt={data.title}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-xl backdrop-blur-sm">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(index);
                  }}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden transition-all ${
                    selectedImage === index
                      ? "ring-2 ring-white scale-110"
                      : "opacity-50 hover:opacity-80"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Keyboard Hint */}
          <div className="absolute bottom-4 right-4 text-white/50 text-xs hidden lg:block">
            Use arrow keys to navigate • ESC to close
          </div>
        </div>
      )}
    </div>
  );
}
