import { Document, model, Schema, Types } from "mongoose";

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  category?: Types.ObjectId;
  specs?: Record<string, string>;
  salesCount: number;
  // Discount fields
  discountPercent?: number;
  discountStartDate?: Date;
  discountEndDate?: Date;
}

const productSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    images: [{ type: String }],
    stock: { type: Number, default: 0 },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    specs: { type: Schema.Types.Mixed },
    salesCount: { type: Number, default: 0, index: true },
    // Discount fields
    discountPercent: { type: Number, min: 0, max: 100, default: 0 },
    discountStartDate: { type: Date },
    discountEndDate: { type: Date },
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text" });
export default model<IProduct>("Product", productSchema);
