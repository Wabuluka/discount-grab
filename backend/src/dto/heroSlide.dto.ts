/**
 * HeroSlide DTOs
 */

import { IHeroSlide } from "../models/HeroSlide";

export interface HeroSlideDTO {
  id: string;
  title: string;
  highlight: string;
  description: string;
  category: string;
  image: string;
  price: number;
  originalPrice: number;
  buttonText: string;
  buttonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface HeroSlideListItemDTO {
  id: string;
  title: string;
  highlight: string;
  category: string;
  image: string;
  isActive: boolean;
  order: number;
}

/**
 * Transform a HeroSlide document to full HeroSlideDTO
 */
export function toHeroSlideDTO(slide: IHeroSlide | any): HeroSlideDTO {
  return {
    id: slide._id?.toString?.() || slide._id || slide.id || "",
    title: slide.title,
    highlight: slide.highlight,
    description: slide.description,
    category: slide.category,
    image: slide.image,
    price: slide.price,
    originalPrice: slide.originalPrice,
    buttonText: slide.buttonText || "Shop Now",
    buttonLink: slide.buttonLink || "/shop",
    secondaryButtonText: slide.secondaryButtonText,
    secondaryButtonLink: slide.secondaryButtonLink,
    isActive: slide.isActive ?? true,
    order: slide.order || 0,
    createdAt: new Date(slide.createdAt).toISOString(),
    updatedAt: new Date(slide.updatedAt).toISOString(),
  };
}

/**
 * Transform a HeroSlide document to list item DTO
 */
export function toHeroSlideListItemDTO(slide: IHeroSlide | any): HeroSlideListItemDTO {
  return {
    id: slide._id?.toString?.() || slide._id || slide.id || "",
    title: slide.title,
    highlight: slide.highlight,
    category: slide.category,
    image: slide.image,
    isActive: slide.isActive ?? true,
    order: slide.order || 0,
  };
}

/**
 * Transform array of hero slides to DTOs
 */
export function toHeroSlideListDTO(slides: (IHeroSlide | any)[]): HeroSlideDTO[] {
  return slides.map(toHeroSlideDTO);
}
