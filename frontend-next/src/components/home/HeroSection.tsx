"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef, TouchEvent } from "react";
import { heroSlideApi, HeroSlide } from "@/services/heroSlideApi";
import { formatAsCurrency } from "@/utils/formatCurrency";

// Default slides to show when no database slides are available
const defaultSlides: HeroSlide[] = [
  {
    id: "1",
    category: "Electronics",
    title: "MacBook Pro",
    highlight: "M3 Chip",
    description: "The most advanced Mac ever. Supercharged by M3 Pro and M3 Max chips for unprecedented performance.",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=800&fit=crop&auto=format",
    price: 1999,
    originalPrice: 2499,
    buttonText: "Shop Now",
    buttonLink: "/shop",
    secondaryButtonText: "Learn More",
    secondaryButtonLink: "#featured",
    isActive: true,
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    category: "Audio",
    title: "Sony WH-1000XM5",
    highlight: "Wireless Headphones",
    description: "Industry-leading noise cancellation with exceptional sound quality and 30-hour battery life.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&auto=format",
    price: 279,
    originalPrice: 399,
    buttonText: "Shop Now",
    buttonLink: "/shop",
    secondaryButtonText: "Learn More",
    secondaryButtonLink: "#featured",
    isActive: true,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    category: "Smart Home",
    title: "HomePod Mini",
    highlight: "Smart Speaker",
    description: "Room-filling 360° audio with Siri intelligence. Your smart home command center.",
    image: "https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800&h=800&fit=crop&auto=format",
    price: 79,
    originalPrice: 99,
    buttonText: "Shop Now",
    buttonLink: "/shop",
    secondaryButtonText: "Learn More",
    secondaryButtonLink: "#featured",
    isActive: true,
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    category: "Gaming",
    title: "PlayStation 5",
    highlight: "Next-Gen Console",
    description: "Experience lightning-fast loading, haptic feedback, and stunning 4K gaming at 120fps.",
    image: "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800&h=800&fit=crop&auto=format",
    price: 449,
    originalPrice: 499,
    buttonText: "Shop Now",
    buttonLink: "/shop",
    secondaryButtonText: "Learn More",
    secondaryButtonLink: "#featured",
    isActive: true,
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function HeroSection() {
  const [slides, setSlides] = useState<HeroSlide[]>(defaultSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await heroSlideApi.getActiveSlides();
        const fetchedSlides = response.data.slides;
        if (fetchedSlides && fetchedSlides.length > 0) {
          // Sort by createdAt descending (most recent first)
          const sortedSlides = [...fetchedSlides].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setSlides(sortedSlides);
        }
      } catch (error) {
        console.error("Failed to fetch hero slides, using defaults:", error);
      }
    };
    fetchSlides();
  }, []);

  const changeSlide = useCallback((newIndex: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setProgress(0);
    setCurrentSlide(newIndex);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    changeSlide((currentSlide + 1) % slides.length);
  }, [currentSlide, slides.length, changeSlide]);

  const prevSlide = useCallback(() => {
    changeSlide((currentSlide - 1 + slides.length) % slides.length);
  }, [currentSlide, slides.length, changeSlide]);

  const goToSlide = (index: number) => {
    if (index !== currentSlide) changeSlide(index);
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
    if (!isAutoPlaying) {
      if (progressInterval.current) clearInterval(progressInterval.current);
      return;
    }

    const duration = 6000;
    const step = 50;
    let elapsed = 0;

    progressInterval.current = setInterval(() => {
      elapsed += step;
      setProgress((elapsed / duration) * 100);
      if (elapsed >= duration) {
        nextSlide();
        elapsed = 0;
      }
    }, step);

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isAutoPlaying, nextSlide, currentSlide]);

  useEffect(() => {
    if (currentSlide >= slides.length) setCurrentSlide(0);
  }, [slides.length, currentSlide]);

  const slide = slides[currentSlide];
  const savings = slide.originalPrice > 0
    ? Math.round((1 - slide.price / slide.originalPrice) * 100)
    : 0;

  return (
    <section
      className="bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-100/40 dark:bg-cyan-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-100/40 dark:bg-violet-900/20 rounded-full blur-3xl" />
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="pt-20 pb-8 sm:pt-24 sm:pb-12 lg:pt-28 lg:pb-16">
          {/* Main Hero Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">

            {/* Left Section - Main Featured Product with Background Image */}
            <div
              className="lg:col-span-3 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl group"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="relative h-[340px] sm:h-[420px] md:h-[480px] lg:h-[520px]">
                {/* Background Images */}
                {slides.map((s, index) => (
                  <div
                    key={s.id}
                    className={`absolute inset-0 transition-all duration-700 ease-out ${
                      index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
                    }`}
                  >
                    <Image
                      src={s.image}
                      alt={`${s.title} ${s.highlight}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                      sizes="(max-width: 1024px) 100vw, 60vw"
                    />
                  </div>
                ))}

                {/* Gradient Overlays - stronger on mobile for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20 sm:from-black/70 sm:via-black/40 sm:to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 sm:from-black/60 sm:to-black/20" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8 lg:p-10">
                  {/* Text Content */}
                  <div className="max-w-lg">
                    {/* Badge */}
                    <div
                      key={`badge-${currentSlide}`}
                      className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 mb-2 sm:mb-4 bg-white/15 backdrop-blur-md rounded-full border border-white/20 animate-fadeIn"
                    >
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full animate-pulse" />
                      <span className="text-[10px] sm:text-xs font-semibold text-white uppercase tracking-wider">
                        {slide.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h1
                      key={`title-${currentSlide}`}
                      className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2 animate-slideUp drop-shadow-lg"
                    >
                      {slide.title}
                    </h1>

                    {/* Highlight */}
                    <p
                      key={`highlight-${currentSlide}`}
                      className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-cyan-400 mb-2 sm:mb-4 animate-slideUp drop-shadow-md"
                      style={{ animationDelay: '0.05s' }}
                    >
                      {slide.highlight}
                    </p>

                    {/* Description - hidden on small mobile */}
                    <p
                      key={`desc-${currentSlide}`}
                      className="text-xs sm:text-sm md:text-base text-white/80 mb-3 sm:mb-6 leading-relaxed animate-slideUp hidden sm:block line-clamp-2 md:line-clamp-none"
                      style={{ animationDelay: '0.1s' }}
                    >
                      {slide.description}
                    </p>

                    {/* Price Card - compact on mobile */}
                    <div
                      key={`price-${currentSlide}`}
                      className="inline-flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-2 sm:py-3 mb-3 sm:mb-6 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/20 animate-slideUp"
                      style={{ animationDelay: '0.15s' }}
                    >
                      <div>
                        <p className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wide mb-0.5">Price</p>
                        <span className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                          {formatAsCurrency(slide.price)}
                        </span>
                      </div>
                      {slide.originalPrice > slide.price && (
                        <>
                          <div className="w-px h-8 sm:h-10 bg-white/20" />
                          <div className="hidden sm:block">
                            <p className="text-xs text-white/60 uppercase tracking-wide mb-0.5">Was</p>
                            <span className="text-base sm:text-lg text-white/50 line-through">
                              {formatAsCurrency(slide.originalPrice)}
                            </span>
                          </div>
                          <span className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 rounded-full shadow-lg">
                            -{savings}%
                          </span>
                        </>
                      )}
                    </div>

                    {/* Buttons - single button on mobile, row on larger */}
                    <div
                      className="flex flex-row gap-2 sm:gap-3 animate-slideUp"
                      style={{ animationDelay: '0.2s' }}
                    >
                      <Link
                        href={slide.buttonLink || "/shop"}
                        className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-7 py-2.5 sm:py-3.5 bg-white text-slate-900 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl hover:bg-cyan-400 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 group"
                      >
                        {slide.buttonText || "Shop Now"}
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                      {slide.secondaryButtonText && (
                        <Link
                          href={slide.secondaryButtonLink || "#"}
                          className="hidden sm:inline-flex items-center justify-center gap-2 px-7 py-3.5 text-white font-semibold rounded-xl border-2 border-white/30 hover:border-white/50 hover:bg-white/10 backdrop-blur-sm transition-all duration-300 group"
                        >
                          {slide.secondaryButtonText}
                          <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Navigation - simpler on mobile */}
                <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 lg:bottom-10 lg:right-10 flex items-center gap-2 sm:gap-3 z-20">
                  {/* Prev Button - smaller on mobile */}
                  <button
                    onClick={prevSlide}
                    className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/15 backdrop-blur-md text-white border border-white/20 hover:bg-white/25 transition-all"
                    aria-label="Previous"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Progress Indicator - simplified on mobile */}
                  <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                    <span className="text-sm font-semibold text-white">
                      {String(currentSlide + 1).padStart(2, '0')}
                    </span>
                    <div className="w-12 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full transition-all duration-100"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-white/50">
                      {String(slides.length).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Mobile progress dots */}
                  <div className="flex sm:hidden items-center gap-1.5 px-2 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          index === currentSlide ? "w-4 bg-cyan-400" : "bg-white/40"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>

                  {/* Next Button - smaller on mobile */}
                  <button
                    onClick={nextSlide}
                    className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/15 backdrop-blur-md text-white border border-white/20 hover:bg-white/25 transition-all"
                    aria-label="Next"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Slide Number Badge - Top Right - hidden on mobile */}
                <div className="absolute top-4 right-4 sm:top-8 sm:right-8 lg:top-10 lg:right-10 hidden sm:block">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-medium text-white">{slides.length} Products</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Next Up Product Preview */}
            <div className="lg:col-span-2 relative h-[420px] sm:h-[480px] lg:h-[520px] hidden lg:block">
              <div className="h-full flex">
                {/* Main Content Area - Next Up Card */}
                <div className="flex-1 relative">
                  {slides.map((s, index) => {
                    const nextIndex = (currentSlide + 1) % slides.length;
                    const isNextUp = index === nextIndex;
                    const discount = s.originalPrice > s.price
                      ? Math.round((1 - s.price / s.originalPrice) * 100)
                      : 0;

                    return (
                      <div
                        key={s.id}
                        className={`absolute inset-0 transition-all duration-500 ${
                          isNextUp ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                        }`}
                      >
                        <button
                          onClick={() => goToSlide(index)}
                          className="group w-full h-full text-left"
                        >
                          <div className="h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden hover:shadow-2xl hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-300">
                            {/* Header Label */}
                            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                              <span className="px-3 py-1.5 bg-cyan-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                Up Next
                              </span>
                            </div>

                            {/* Top Section - Image */}
                            <div className="relative h-[55%] overflow-hidden">
                              <Image
                                src={s.image}
                                alt={s.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="350px"
                              />
                              {/* Subtle gradient overlay for text readability */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                              {/* Discount Badge */}
                              {discount > 0 && (
                                <div className="absolute top-4 right-4 px-3 py-1.5 bg-rose-500 text-white text-sm font-bold rounded-lg shadow-lg">
                                  -{discount}%
                                </div>
                              )}

                              {/* Category Tag */}
                              <div className="absolute bottom-4 left-4">
                                <span className="px-3 py-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-xs font-bold text-slate-700 dark:text-slate-300 rounded-lg uppercase tracking-wider shadow-sm">
                                  {s.category}
                                </span>
                              </div>
                            </div>

                            {/* Bottom Section - Details */}
                            <div className="h-[45%] p-6 flex flex-col">
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                  {s.title}
                                </h3>
                                <p className="text-cyan-600 dark:text-cyan-400 font-medium mb-3">
                                  {s.highlight}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                  {s.description}
                                </p>
                              </div>

                              {/* Price */}
                              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Starting from</p>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {formatAsCurrency(s.price)}
                                  </span>
                                  {s.originalPrice > s.price && (
                                    <span className="text-sm text-slate-400 line-through">
                                      {formatAsCurrency(s.originalPrice)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Side Navigation */}
                <div className="w-16 flex flex-col items-center justify-center gap-3 pl-4">
                  {slides.map((s, index) => {
                    const nextIndex = (currentSlide + 1) % slides.length;
                    const isActive = index === currentSlide;
                    const isNext = index === nextIndex;
                    return (
                      <button
                        key={s.id}
                        onClick={() => goToSlide(index)}
                        className="group relative flex items-center"
                      >
                        {/* Line connector */}
                        <div className={`absolute left-1/2 -translate-x-1/2 w-0.5 transition-all duration-300 ${
                          isActive ? "h-12 bg-cyan-500" : isNext ? "h-10 bg-cyan-300 dark:bg-cyan-700" : "h-6 bg-slate-200 dark:bg-slate-700"
                        }`} />

                        {/* Dot/Circle */}
                        <div className={`relative z-10 rounded-full transition-all duration-300 flex items-center justify-center ${
                          isActive
                            ? "w-10 h-10 bg-cyan-500 shadow-lg shadow-cyan-500/30"
                            : isNext
                              ? "w-8 h-8 bg-cyan-100 dark:bg-cyan-900 border-2 border-cyan-500"
                              : "w-6 h-6 bg-slate-200 dark:bg-slate-700 group-hover:bg-slate-300 dark:group-hover:bg-slate-600"
                        }`}>
                          {isActive ? (
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          ) : isNext ? (
                            <span className="text-cyan-600 dark:text-cyan-400 text-xs font-bold">{index + 1}</span>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold">{index + 1}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mobile & Tablet: Product Quick Access Cards */}
            <div className="lg:hidden mt-4 md:mt-6">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4 px-1">
                <h3 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 dark:text-white">More Products</h3>
                <Link href="/shop" className="text-[10px] sm:text-xs md:text-sm font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                  View All
                  <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Mobile: Compact Thumbnails | Tablet: Detailed Cards */}
              <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                {slides.map((s, index) => {
                  const isActive = index === currentSlide;
                  const discount = s.originalPrice > s.price
                    ? Math.round((1 - s.price / s.originalPrice) * 100)
                    : 0;

                  return (
                    <button
                      key={s.id}
                      onClick={() => goToSlide(index)}
                      className={`group rounded-xl sm:rounded-2xl overflow-hidden bg-white dark:bg-slate-900 transition-all duration-300 border-2 ${
                        isActive
                          ? "border-cyan-500 shadow-lg shadow-cyan-500/20 ring-2 sm:ring-4 ring-cyan-500/10"
                          : "border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-700 shadow-sm sm:shadow-md hover:shadow-lg"
                      }`}
                    >
                      {/* Image Container */}
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={s.image}
                          alt={s.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 80px, 200px"
                        />
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Active indicator - small dot on mobile, badge on tablet */}
                        {isActive && (
                          <>
                            {/* Mobile: Small indicator */}
                            <div className="absolute top-1 left-1 sm:hidden">
                              <span className="w-2 h-2 bg-cyan-500 rounded-full block shadow-lg ring-2 ring-white" />
                            </div>
                            {/* Tablet: Full badge */}
                            <div className="absolute top-2 left-2 hidden sm:block">
                              <span className="px-2 py-0.5 bg-cyan-500 text-white text-[10px] font-bold rounded-md flex items-center gap-1 shadow-lg">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                Playing
                              </span>
                            </div>
                          </>
                        )}

                        {/* Discount badge - hidden on mobile, visible on tablet */}
                        {discount > 0 && (
                          <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                            <span className="px-1 py-0.5 sm:px-2 sm:py-1 bg-rose-500 text-white text-[8px] sm:text-[10px] font-bold rounded sm:rounded-md shadow-lg">
                              -{discount}%
                            </span>
                          </div>
                        )}

                        {/* Bottom info - title overlay on mobile */}
                        <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2 bg-gradient-to-t from-black/80 to-transparent">
                          <p className="text-[9px] sm:text-[10px] font-bold text-white truncate leading-tight">
                            {s.title}
                          </p>
                          <p className="text-[8px] sm:text-[9px] text-cyan-300 font-medium truncate sm:hidden">
                            {formatAsCurrency(s.price)}
                          </p>
                        </div>
                      </div>

                      {/* Content - Hidden on mobile, visible on sm and above */}
                      <div className="hidden sm:block p-2 md:p-3">
                        <p className="text-[10px] md:text-xs text-cyan-600 dark:text-cyan-400 font-medium truncate mb-1">
                          {s.highlight}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">
                            {formatAsCurrency(s.price)}
                          </span>
                          <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center transition-colors ${
                            isActive
                              ? "bg-cyan-500 text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                          }`}>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Trust Bar */}
          <div className="mt-6 sm:mt-10 lg:mt-12">
            {/* Mobile: Grid layout badges */}
            <div className="sm:hidden grid grid-cols-2 gap-2">
              {[
                { icon: "M5 13l4 4L19 7", label: "Free Shipping", color: "bg-emerald-500" },
                { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: "Secure", color: "bg-cyan-500" },
                { icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", label: "Easy Returns", color: "bg-violet-500" },
                { icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z", label: "24/7 Support", color: "bg-amber-500" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                  <div className={`w-7 h-7 ${item.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Tablet and Desktop: Grid layout */}
            <div className="hidden sm:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 lg:p-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {[
                  { icon: "M5 13l4 4L19 7", label: "Free Shipping", sub: "On orders over $50", color: "from-emerald-500 to-green-500" },
                  { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: "Secure Payment", sub: "100% protected", color: "from-cyan-500 to-blue-500" },
                  { icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", label: "Easy Returns", sub: "30-day guarantee", color: "from-violet-500 to-purple-500" },
                  { icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z", label: "24/7 Support", sub: "Dedicated help", color: "from-amber-500 to-orange-500" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 lg:p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm lg:text-base font-bold text-slate-900 dark:text-white truncate">{item.label}</p>
                      <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 truncate">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </section>
  );
}
