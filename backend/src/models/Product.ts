import { Document, model, Schema, Types } from "mongoose";

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  category?: Types.ObjectId;
  specs?: Record<string, string>;
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
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text" });
export default model<IProduct>("Product", productSchema);
