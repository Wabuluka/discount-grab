"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

interface Slide {
  id: number;
  badge: string;
  title: string[];
  description: string;
  image: string;
  discount: string;
  gradientFrom: string;
  gradientTo: string;
  accentColor: string;
}

const slides: Slide[] = [
  {
    id: 1,
    badge: "New Tech Arrivals 2025",
    title: ["Next-Gen", "Electronics", "For You"],
    description:
      "Discover cutting-edge gadgets, premium audio gear, and smart home devices. Experience technology that transforms your everyday life.",
    image:
      "https://png.pngtree.com/png-clipart/20240909/original/pngtree-there-is-a-discount-on-electrical-appliances-png-image_15978152.png",
    discount: "Up to 40% OFF",
    gradientFrom: "from-cyan-500",
    gradientTo: "to-blue-600",
    accentColor: "cyan",
  },
  {
    id: 2,
    badge: "Premium Audio Collection",
    title: ["Immersive", "Sound", "Experience"],
    description:
      "Studio-quality headphones, wireless earbuds, and premium speakers. Elevate your audio journey with crystal-clear sound.",
    image:
      "https://png.pngtree.com/png-clipart/20230914/original/pngtree-wireless-headphones-pink-vector-png-image_12159481.png",
    discount: "30% OFF Today",
    gradientFrom: "from-purple-500",
    gradientTo: "to-pink-600",
    accentColor: "purple",
  },
  {
    id: 3,
    badge: "Smart Home Essentials",
    title: ["Connected", "Living", "Spaces"],
    description:
      "Transform your home with intelligent devices. From smart lights to security systems, automate your lifestyle effortlessly.",
    image:
      "https://png.pngtree.com/png-clipart/20230418/original/pngtree-smart-home-flat-illustration-png-image_9065025.png",
    discount: "Save $200+",
    gradientFrom: "from-emerald-500",
    gradientTo: "to-teal-600",
    accentColor: "emerald",
  },
  {
    id: 4,
    badge: "Gaming Gear Sale",
    title: ["Level Up", "Your", "Gaming"],
    description:
      "High-performance gaming peripherals, consoles, and accessories. Dominate every game with pro-grade equipment.",
    image:
      "https://png.pngtree.com/png-clipart/20230914/original/pngtree-game-controller-joystick-gamepad-for-video-game-console-png-image_12152656.png",
    discount: "50% OFF Select",
    gradientFrom: "from-orange-500",
    gradientTo: "to-red-600",
    accentColor: "orange",
  },
];

const accentColors: Record<string, { badge: string; text: string; glow: string; button: string }> = {
  cyan: {
    badge: "bg-blue-500/10 border-blue-500/20",
    text: "text-cyan-400",
    glow: "from-cyan-500/20 to-blue-500/20",
    button: "from-cyan-500 to-blue-600 shadow-cyan-500/25 hover:shadow-cyan-500/40",
  },
  purple: {
    badge: "bg-purple-500/10 border-purple-500/20",
    text: "text-purple-400",
    glow: "from-purple-500/20 to-pink-500/20",
    button: "from-purple-500 to-pink-600 shadow-purple-500/25 hover:shadow-purple-500/40",
  },
  emerald: {
    badge: "bg-emerald-500/10 border-emerald-500/20",
    text: "text-emerald-400",
    glow: "from-emerald-500/20 to-teal-500/20",
    button: "from-emerald-500 to-teal-600 shadow-emerald-500/25 hover:shadow-emerald-500/40",
  },
  orange: {
    badge: "bg-orange-500/10 border-orange-500/20",
    text: "text-orange-400",
    glow: "from-orange-500/20 to-red-500/20",
    button: "from-orange-500 to-red-600 shadow-orange-500/25 hover:shadow-orange-500/40",
  },
};

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const nextSlide = useCallback(() => {
    setDirection("right");
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection("left");
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? "right" : "left");
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const slide = slides[currentSlide];
  const colors = accentColors[slide.accentColor];

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-[600px] md:min-h-[700px] pt-16 md:pt-20"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r ${colors.glow} rounded-full blur-3xl transition-all duration-1000`}
        />
        <div
          className={`absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r ${colors.glow} rounded-full blur-3xl transition-all duration-1000`}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-600/5 to-cyan-600/5 rounded-full blur-3xl" />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="relative container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          {/* Left content */}
          <div className="flex-1 text-center lg:text-left space-y-8">
            {/* Badge */}
            <div
              key={`badge-${slide.id}`}
              className={`inline-flex items-center gap-2 px-4 py-2 ${colors.badge} border rounded-full backdrop-blur-sm animate-fade-in`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors.text} opacity-75`}
                  style={{ backgroundColor: "currentColor" }}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${colors.text}`}
                  style={{ backgroundColor: "currentColor" }}
                ></span>
              </span>
              <span className={`${colors.text} text-sm font-medium tracking-wide`}>
                {slide.badge}
              </span>
            </div>

            {/* Heading */}
            <h1
              key={`title-${slide.id}`}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight animate-slide-up"
            >
              <span className="text-white">{slide.title[0]}</span>
              <br />
              <span
                className={`bg-gradient-to-r ${slide.gradientFrom} ${slide.gradientTo} bg-clip-text text-transparent`}
              >
                {slide.title[1]}
              </span>
              <br />
              <span className="text-white">{slide.title[2]}</span>
            </h1>

            {/* Description */}
            <p
              key={`desc-${slide.id}`}
              className="text-slate-400 text-lg sm:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-delay"
            >
              {slide.description}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-8 py-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">500+</div>
                <div className="text-slate-500 text-sm">Products</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">50K+</div>
                <div className="text-slate-500 text-sm">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-slate-500 text-sm">Support</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/shop"
                className={`group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r ${colors.button} text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition-all duration-300`}
              >
                Shop Now
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
              <Link
                href="#deals"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
              >
                <svg
                  className={`w-5 h-5 ${colors.text}`}
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
                Today&apos;s Deals
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center lg:justify-start gap-6 pt-4">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Free Shipping
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                2-Year Warranty
              </div>
            </div>
          </div>

          {/* Right content - Product showcase with slider */}
          <div className="flex-1 relative">
            <div className="relative">
              {/* Glow effect behind image */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${colors.glow} rounded-3xl blur-2xl scale-95 transition-all duration-700`}
              />

              {/* Main product card */}
              <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl">
                {/* Sale badge */}
                <div className="absolute -top-3 -right-3 z-10">
                  <div
                    key={`discount-${slide.id}`}
                    className={`bg-gradient-to-r ${slide.gradientFrom} ${slide.gradientTo} text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg animate-bounce-subtle`}
                  >
                    {slide.discount}
                  </div>
                </div>

                {/* Slider container */}
                <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden">
                  {slides.map((s, index) => (
                    <div
                      key={s.id}
                      className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                        index === currentSlide
                          ? "opacity-100 scale-100 translate-x-0"
                          : direction === "right"
                          ? index < currentSlide
                            ? "opacity-0 scale-95 -translate-x-full"
                            : "opacity-0 scale-95 translate-x-full"
                          : index < currentSlide
                          ? "opacity-0 scale-95 -translate-x-full"
                          : "opacity-0 scale-95 translate-x-full"
                      }`}
                    >
                      <Image
                        src={s.image}
                        alt={s.title.join(" ")}
                        fill
                        className="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                        priority={index === 0}
                      />
                    </div>
                  ))}
                </div>

                {/* Slider navigation arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 border border-white/10"
                  aria-label="Previous slide"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 border border-white/10"
                  aria-label="Next slide"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {/* Floating feature cards */}
                <div className="absolute -left-4 top-1/4 bg-slate-800/90 backdrop-blur-sm border border-white/10 rounded-2xl p-3 shadow-xl hidden md:block animate-float">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${colors.badge} rounded-xl flex items-center justify-center`}>
                      <svg
                        className={`w-5 h-5 ${colors.text}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white text-sm font-semibold">Fast Charging</div>
                      <div className="text-slate-400 text-xs">65W Support</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-4 bottom-1/4 bg-slate-800/90 backdrop-blur-sm border border-white/10 rounded-2xl p-3 shadow-xl hidden md:block animate-float-delay">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white text-sm font-semibold">Genuine Products</div>
                      <div className="text-slate-400 text-xs">100% Authentic</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide indicators */}
              <div className="flex justify-center gap-3 mt-6">
                {slides.map((s, index) => (
                  <button
                    key={s.id}
                    onClick={() => goToSlide(index)}
                    className={`relative h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? `w-8 bg-gradient-to-r ${slide.gradientFrom} ${slide.gradientTo}`
                        : "w-2 bg-white/30 hover:bg-white/50"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  >
                    {index === currentSlide && (
                      <span className="absolute inset-0 rounded-full animate-pulse-glow" />
                    )}
                  </button>
                ))}
              </div>

              {/* Auto-play indicator */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                    isAutoPlaying
                      ? "bg-white/10 text-white/70 hover:bg-white/20"
                      : "bg-white/5 text-white/40 hover:bg-white/10"
                  }`}
                >
                  {isAutoPlaying ? (
                    <>
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                      </span>
                      Auto-playing
                    </>
                  ) : (
                    <>
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-slate-500"></span>
                      </span>
                      Paused
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-auto text-white/5"
          viewBox="0 0 1440 120"
          fill="currentColor"
          preserveAspectRatio="none"
        >
          <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
        </svg>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes bounce-subtle {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes pulse-glow {
          0%,
          100% {
            opacity: 0.5;
            box-shadow: 0 0 0 0 currentColor;
          }
          50% {
            opacity: 0.8;
            box-shadow: 0 0 10px 2px currentColor;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.6s ease-out 0.2s forwards;
          opacity: 0;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delay {
          animation: float 3s ease-in-out 1.5s infinite;
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
