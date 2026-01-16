"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef, TouchEvent } from "react";

interface Slide {
  id: number;
  category: string;
  title: string;
  highlight: string;
  description: string;
  image: string;
  price: string;
  originalPrice: string;
}

const slides: Slide[] = [
  {
    id: 1,
    category: "Electronics",
    title: "MacBook Pro",
    highlight: "M3 Chip",
    description: "The most advanced Mac ever. Supercharged by M3 Pro and M3 Max chips for unprecedented performance.",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=800&fit=crop&auto=format",
    price: "$1,999",
    originalPrice: "$2,499",
  },
  {
    id: 2,
    category: "Audio",
    title: "Sony WH-1000XM5",
    highlight: "Wireless",
    description: "Industry-leading noise cancellation with exceptional sound quality and 30-hour battery life.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&auto=format",
    price: "$279",
    originalPrice: "$399",
  },
  {
    id: 3,
    category: "Smart Home",
    title: "HomePod Mini",
    highlight: "Smart Speaker",
    description: "Room-filling 360° audio with Siri intelligence. Your smart home command center.",
    image: "https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800&h=800&fit=crop&auto=format",
    price: "$79",
    originalPrice: "$99",
  },
  {
    id: 4,
    category: "Gaming",
    title: "PlayStation 5",
    highlight: "Console",
    description: "Experience lightning-fast loading, haptic feedback, and stunning 4K gaming at 120fps.",
    image: "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800&h=800&fit=crop&auto=format",
    price: "$449",
    originalPrice: "$499",
  },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextSlide() : prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const slide = slides[currentSlide];
  const savings = Math.round(
    (1 - parseFloat(slide.price.replace(/[^0-9.]/g, "")) / parseFloat(slide.originalPrice.replace(/[^0-9.]/g, ""))) * 100
  );

  return (
    <section
      className="relative min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 py-24 lg:py-0">

          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left space-y-8 max-w-xl">
            {/* Category badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 rounded-full">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{slide.category}</span>
            </div>

            {/* Main heading */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                {slide.title}
              </h1>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
                {slide.highlight}
              </p>
            </div>

            {/* Description */}
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              {slide.description}
            </p>

            {/* Price section */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <span className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white">{slide.price}</span>
              <span className="text-xl text-slate-400 line-through">{slide.originalPrice}</span>
              <span className="px-3 py-1.5 text-sm font-bold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50 rounded-lg">
                SAVE {savings}%
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/shop"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-lg font-semibold rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 shadow-lg shadow-slate-900/20 dark:shadow-white/20 transition-all duration-200"
              >
                Shop Now
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="#featured"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg font-semibold rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
              >
                View Details
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-4">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Free Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">2-Year Warranty</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Easy Returns</span>
              </div>
            </div>
          </div>

          {/* Right Content - Product Showcase */}
          <div
            className="flex-1 w-full max-w-lg lg:max-w-2xl"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="relative">
              {/* Main image card */}
              <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-[2rem] p-4 sm:p-6 shadow-2xl shadow-slate-900/10 dark:shadow-black/30">
                {/* Image */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
                  {slides.map((s, index) => (
                    <div
                      key={s.id}
                      className={`absolute inset-0 transition-all duration-500 ease-out ${
                        index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
                      }`}
                    >
                      <Image
                        src={s.image}
                        alt={`${s.title} ${s.highlight}`}
                        fill
                        className="object-cover"
                        priority={index === 0}
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  ))}
                </div>

                {/* Navigation controls */}
                <div className="absolute inset-x-4 sm:inset-x-6 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none">
                  <button
                    onClick={prevSlide}
                    className="pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-lg hover:scale-110 active:scale-95 transition-transform"
                    aria-label="Previous slide"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextSlide}
                    className="pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-lg hover:scale-110 active:scale-95 transition-transform"
                    aria-label="Next slide"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Slide counter */}
                <div className="absolute top-8 sm:top-10 right-8 sm:right-10 px-4 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-lg">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {String(currentSlide + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                  </span>
                </div>
              </div>

              {/* Slide indicators */}
              <div className="flex justify-center items-center gap-3 mt-8">
                {slides.map((s, index) => (
                  <button
                    key={s.id}
                    onClick={() => goToSlide(index)}
                    className={`group relative h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? "w-12 bg-gradient-to-r from-blue-600 to-violet-600"
                        : "w-3 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
                    }`}
                    aria-label={`Go to slide ${index + 1}: ${s.title}`}
                  />
                ))}
              </div>

              {/* Product thumbnails */}
              <div className="hidden sm:flex justify-center gap-4 mt-8">
                {slides.map((s, index) => (
                  <button
                    key={s.id}
                    onClick={() => goToSlide(index)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden transition-all duration-300 ${
                      index === currentSlide
                        ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900"
                        : "opacity-50 hover:opacity-80"
                    }`}
                  >
                    <Image
                      src={s.image}
                      alt={s.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none" />
    </section>
  );
}
