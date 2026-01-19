import HeroSlide, { IHeroSlide } from "../models/HeroSlide";
import { HeroSlideDTO, toHeroSlideDTO, toHeroSlideListDTO } from "../dto";

export interface HeroSlideListResult {
  slides: HeroSlideDTO[];
  total: number;
}

export const createHeroSlide = async (payload: Partial<IHeroSlide>): Promise<HeroSlideDTO> => {
  const slide = new HeroSlide(payload);
  const saved = await slide.save();
  return toHeroSlideDTO(saved);
};

export const findAllHeroSlides = async (opts: { activeOnly?: boolean } = {}): Promise<HeroSlideListResult> => {
  const filter: any = {};
  if (opts.activeOnly) {
    filter.isActive = true;
  }

  const docs = await HeroSlide.find(filter).sort({ order: 1, createdAt: -1 }).lean();
  const total = docs.length;

  return {
    slides: toHeroSlideListDTO(docs),
    total,
  };
};

export const findActiveHeroSlides = async (): Promise<HeroSlideDTO[]> => {
  const docs = await HeroSlide.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean();
  return toHeroSlideListDTO(docs);
};

export const findHeroSlideById = async (id: string): Promise<HeroSlideDTO | null> => {
  const slide = await HeroSlide.findById(id).lean();
  if (!slide) return null;
  return toHeroSlideDTO(slide);
};

export const updateHeroSlide = async (
  id: string,
  update: Partial<IHeroSlide>
): Promise<HeroSlideDTO | null> => {
  const slide = await HeroSlide.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!slide) return null;
  return toHeroSlideDTO(slide);
};

export const deleteHeroSlide = async (id: string): Promise<boolean> => {
  const result = await HeroSlide.findByIdAndDelete(id);
  return !!result;
};

export const reorderHeroSlides = async (
  orderedIds: string[]
): Promise<HeroSlideDTO[]> => {
  const updates = orderedIds.map((id, index) =>
    HeroSlide.findByIdAndUpdate(id, { order: index }, { new: true })
  );
  await Promise.all(updates);

  const docs = await HeroSlide.find({ isActive: true }).sort({ order: 1 }).lean();
  return toHeroSlideListDTO(docs);
};

export const toggleHeroSlideActive = async (id: string): Promise<HeroSlideDTO | null> => {
  const slide = await HeroSlide.findById(id);
  if (!slide) return null;

  slide.isActive = !slide.isActive;
  await slide.save();
  return toHeroSlideDTO(slide);
};
