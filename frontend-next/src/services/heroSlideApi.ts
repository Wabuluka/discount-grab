import api from "./api";

export interface HeroSlide {
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

export interface HeroSlideListItem {
  id: string;
  title: string;
  highlight: string;
  category: string;
  image: string;
  isActive: boolean;
  order: number;
}

export interface CreateHeroSlidePayload {
  title: string;
  highlight: string;
  description: string;
  category: string;
  image: string;
  price: number;
  originalPrice: number;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateHeroSlidePayload extends Partial<CreateHeroSlidePayload> {}

export const heroSlideApi = {
  // Public - get active slides for display
  getActiveSlides: () => api.get<{ slides: HeroSlide[] }>("/hero-slides/active"),

  // Admin - list all slides
  getAllSlides: (activeOnly?: boolean) =>
    api.get<{ slides: HeroSlide[]; total: number }>("/hero-slides", {
      params: { activeOnly },
    }),

  // Admin - get single slide
  getSlide: (id: string) => api.get<{ data: HeroSlide }>(`/hero-slides/${id}`),

  // Admin - create slide
  createSlide: (payload: CreateHeroSlidePayload) =>
    api.post<{ data: HeroSlide }>("/hero-slides", payload),

  // Admin - update slide
  updateSlide: (id: string, payload: UpdateHeroSlidePayload) =>
    api.put<{ data: HeroSlide }>(`/hero-slides/${id}`, payload),

  // Admin - delete slide
  deleteSlide: (id: string) => api.delete(`/hero-slides/${id}`),

  // Admin - reorder slides
  reorderSlides: (orderedIds: string[]) =>
    api.post<{ slides: HeroSlide[] }>("/hero-slides/reorder", { orderedIds }),

  // Admin - toggle active status
  toggleActive: (id: string) =>
    api.patch<{ data: HeroSlide }>(`/hero-slides/${id}/toggle-active`),
};
