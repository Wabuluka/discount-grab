"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { addToCart } from "@/store/slices/cartSlice";
import { useGeo } from "@/providers/GeoProvider";
import { useShipping } from "@/hooks/useShipping";
import type { Product, ProductCategory } from "@/types/product";
import { getProductId } from "@/types/product";

interface ProductClientProps {
  product: Product;
}

const getCategoryInfo = (category: ProductCategory | string | undefined): { id: string; name: string } | null => {
  if (!category) return null;
  if (typeof category === "string") return { id: category, name: category };
  return { id: category.id || category._id || "", name: category.name };
};

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

export default function ProductClient({ product }: ProductClientProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { loading: cartLoading } = useAppSelector((state) => state.cart);
  const { convertPrice, formatPrice, geoInfo } = useGeo();
  const { data: shippingInfo } = useShipping(product.salePrice || product.price);

  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);

  const saleCountdown = useCountdown(product.discountEndDate);
  const productId = getProductId(product);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    if (!productId) return;

    try {
      await dispatch(addToCart({ productId, quantity })).unwrap();
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch {
      // Error handled by redux
    }
  };

  const images = product.images?.length ? product.images : ["https://via.placeholder.com/600x600?text=No+Image"];

  const nextImage = useCallback(() => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const hasSpecs = product.specs && Object.keys(product.specs).length > 0;
  const displayPrice = product.isOnSale && product.salePrice != null ? product.salePrice : product.price;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Breadcrumb */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
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
            {getCategoryInfo(product.category) && (
              <>
                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <Link href={`/shop?category=${getCategoryInfo(product.category)?.id}`} className="text-gray-500 hover:text-cyan-600 transition-colors">
                  {getCategoryInfo(product.category)?.name}
                </Link>
              </>
            )}
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 dark:text-gray-100 font-medium truncate max-w-[200px]">{product.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Gallery Section */}
            <div className="p-6 lg:p-10 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-700/50">
              <div className="relative mb-6">
                <div
                  className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-xl group cursor-pointer border border-gray-200 dark:border-gray-600"
                  onClick={() => setIsLightboxOpen(true)}
                  onMouseEnter={() => setIsZooming(true)}
                  onMouseLeave={() => setIsZooming(false)}
                  onMouseMove={handleMouseMove}
                >
                  <Image
                    alt={product.title}
                    src={images[selectedImage]}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />

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

                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                      <div className="bg-red-600 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
                        Out of Stock
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

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

                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm">
                      {selectedImage + 1} / {images.length}
                    </div>
                  )}
                </div>

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

              {images.length > 1 && (
                <div className="relative bg-white dark:bg-gray-700 rounded-xl p-2 shadow-sm border border-gray-100 dark:border-gray-600">
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
                          alt={`${product.title} view ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="72px"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Product Details Section */}
            <div className="p-6 lg:p-10 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                {getCategoryInfo(product.category) && (
                  <Link
                    href={`/shop?category=${getCategoryInfo(product.category)?.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 text-cyan-700 dark:text-cyan-400 text-xs font-bold rounded-full uppercase tracking-wider hover:from-cyan-100 hover:to-blue-100 transition-all"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    {getCategoryInfo(product.category)?.name}
                  </Link>
                )}
                <span className="text-xs text-gray-400 font-mono">SKU: {productId.slice(-8).toUpperCase()}</span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                {product.title}
              </h1>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${star <= 4 ? "text-amber-400" : "text-gray-200 dark:text-gray-600"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">4.0 (24 reviews)</span>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-green-600 font-medium">{product.salesCount} sold</span>
              </div>

              {/* Price Section with Geo Currency */}
              <div className="rounded-2xl p-6 mb-6 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
                {product.isOnSale && product.salePrice != null ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm font-semibold rounded-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {product.discountPercent}% OFF
                      </span>
                      {saleCountdown && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Ends in {saleCountdown.days > 0 ? `${saleCountdown.days}d ` : ""}
                          {String(saleCountdown.hours).padStart(2, "0")}:
                          {String(saleCountdown.minutes).padStart(2, "0")}:
                          {String(saleCountdown.seconds).padStart(2, "0")}
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-4">
                      <span className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(convertPrice(product.salePrice))}
                      </span>
                      <span className="text-xl text-gray-400 line-through">
                        {formatPrice(convertPrice(product.price))}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-green-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm font-medium">
                        You save {formatPrice(convertPrice(product.price - product.salePrice))}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-600">
                      Tax included. Shipping calculated at checkout.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-end gap-3">
                      <span className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(convertPrice(product.price))}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Tax included. Shipping calculated at checkout.</p>
                  </>
                )}
              </div>

              {/* Shipping Info */}
              {shippingInfo && geoInfo && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        {shippingInfo.isFreeShipping ? (
                          "Free shipping to " + geoInfo.country
                        ) : (
                          <>
                            Shipping to {geoInfo.country}: {formatPrice(convertPrice(shippingInfo.shippingCost))}
                          </>
                        )}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Estimated delivery: {shippingInfo.estimatedDays} business days
                        {!shippingInfo.isFreeShipping && shippingInfo.amountToFreeShipping > 0 && (
                          <span className="ml-2">
                            (Add {formatPrice(convertPrice(shippingInfo.amountToFreeShipping))} for free shipping)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stock Status */}
              <div className="mb-6">
                {product.stock > 0 ? (
                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                    <div className="flex h-4 w-4 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                    </div>
                    <div>
                      <span className="text-green-800 dark:text-green-200 font-semibold">In Stock</span>
                      <span className="text-green-600 dark:text-green-400 ml-2">
                        {product.stock > 10 ? "Ready to ship" : `Only ${product.stock} left!`}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                    <span className="h-4 w-4 rounded-full bg-red-500"></span>
                    <div>
                      <span className="text-red-800 dark:text-red-200 font-semibold">Out of Stock</span>
                      <span className="text-red-600 dark:text-red-400 ml-2">Notify me when available</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Quantity
                </label>
                <div className="flex items-center">
                  <button
                    className="w-14 h-14 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-l-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                    </svg>
                  </button>
                  <div className="w-20 h-14 flex items-center justify-center bg-gray-50 dark:bg-gray-600 border-y border-gray-200 dark:border-gray-500 font-bold text-xl text-gray-900 dark:text-white">
                    {quantity}
                  </div>
                  <button
                    className="w-14 h-14 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-r-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock || product.stock === 0}
                  >
                    <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  {product.stock > 0 && product.stock <= 10 && (
                    <span className="ml-4 text-sm text-amber-600 font-medium">
                      Only {product.stock} left in stock
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
                      : product.stock === 0
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-xl shadow-cyan-600/30 hover:shadow-2xl hover:shadow-cyan-600/40 hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                  onClick={handleAddToCart}
                  disabled={cartLoading || product.stock === 0}
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
                  className="w-16 h-16 flex items-center justify-center bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-2xl hover:border-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all group"
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
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white dark:bg-gray-600 rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-gray-100">Free Shipping</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Orders $50+</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white dark:bg-gray-600 rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-gray-100">Secure Payment</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">256-bit SSL</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white dark:bg-gray-600 rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-gray-100">Easy Returns</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">30-day policy</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white dark:bg-gray-600 rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-gray-100">24/7 Support</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Live chat</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="flex border-b border-gray-200 dark:border-gray-700 px-6 lg:px-10 overflow-x-auto">
              <button
                onClick={() => setActiveTab("description")}
                className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "description"
                    ? "border-cyan-600 text-cyan-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
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
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
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
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Reviews (24)
              </button>
            </div>

            <div className="p-6 lg:p-10">
              {activeTab === "description" && (
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                    {product.description}
                  </p>
                </div>
              )}

              {activeTab === "specs" && hasSpecs && (
                <div className="max-w-2xl">
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {Object.entries(product.specs!).map(([key, value]) => (
                        <tr key={key}>
                          <td className="py-4 pr-4 text-sm font-medium text-gray-500 dark:text-gray-400 w-1/3">{key}</td>
                          <td className="py-4 text-sm text-gray-900 dark:text-gray-100">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="max-w-3xl">
                  <div className="flex items-center gap-8 mb-8 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                    <div className="text-center">
                      <div className="text-5xl font-black text-gray-900 dark:text-white">4.0</div>
                      <div className="flex items-center justify-center gap-0.5 my-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-5 h-5 ${star <= 4 ? "text-amber-400" : "text-gray-200 dark:text-gray-600"}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">24 reviews</div>
                    </div>
                  </div>
                  <button className="w-full py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
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
          <button
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-50"
            onClick={() => setIsLightboxOpen(false)}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="absolute top-4 left-4 text-white/80 text-sm font-medium">
            {selectedImage + 1} / {images.length}
          </div>

          <div
            className="relative w-full h-full max-w-5xl max-h-[85vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[selectedImage]}
              alt={product.title}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

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

          <div className="absolute bottom-4 right-4 text-white/50 text-xs hidden lg:block">
            Use arrow keys to navigate - ESC to close
          </div>
        </div>
      )}
    </div>
  );
}
