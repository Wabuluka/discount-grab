import { Document, model, Schema } from "mongoose";

export interface IHeroSlide extends Document {
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
}

const heroSlideSchema = new Schema<IHeroSlide>(
  {
    title: { type: String, required: true },
    highlight: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    buttonText: { type: String, default: "Shop Now" },
    buttonLink: { type: String, default: "/shop" },
    secondaryButtonText: { type: String },
    secondaryButtonLink: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

export default model<IHeroSlide>("HeroSlide", heroSlideSchema);
