"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/store";
import { fetchProducts } from "@/store/slices/productsSlice";
import HeroSection from "@/components/home/HeroSection";
import Collections from "@/components/home/Collections";
import About from "@/components/home/About";
import FeaturedHomePageProducts from "@/components/home/FeaturedHomePageProducts";

export default function HomePage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <div>
      <HeroSection />
      <Collections />
      <About />
      <FeaturedHomePageProducts />
    </div>
  );
}
