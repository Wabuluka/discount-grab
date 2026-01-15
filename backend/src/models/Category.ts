import { Document, model, Schema, Types } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  parent?: Types.ObjectId;
  image?: string;
  isActive: boolean;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    parent: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    image: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for faster queries
categorySchema.index({ parent: 1 });
categorySchema.index({ name: "text" });

// Virtual for getting subcategories
categorySchema.virtual("subcategories", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent",
});

// Ensure virtuals are included in JSON output
categorySchema.set("toJSON", { virtuals: true });
categorySchema.set("toObject", { virtuals: true });

export default model<ICategory>("Category", categorySchema);
