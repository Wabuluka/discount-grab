import Product, { IProduct } from "../models/Product";
import { AppError, ErrorCode } from "../middleware/errorHandler";
import {
  ProductDTO,
  ProductListItemDTO,
  toProductDTO,
  toProductListDTO,
} from "../dto";

export interface ProductListResult {
  products: ProductListItemDTO[];
  total: number;
  page: number;
  limit: number;
}

export const createProduct = async (payload: Partial<IProduct>): Promise<ProductDTO> => {
  // Handle empty string category - should be undefined for no category
  if (payload.category === ("" as any) || payload.category === null) {
    delete payload.category;
  }

  const p = new Product(payload);
  const saved = await p.save();
  // Populate category before returning
  const populated = await Product.findById(saved._id).populate("category", "name slug");
  if (!populated) {
    throw new AppError("Failed to create product", ErrorCode.INTERNAL_ERROR);
  }
  return toProductDTO(populated);
};

export const findProducts = async (filter: any = {}, opts: any = {}): Promise<ProductListResult> => {
  const { page = 1, limit = 20, sort = "-createdAt" } = opts;
  const skip = (page - 1) * limit;
  const docs = await Product.find(filter)
    .populate("category", "name slug")
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .lean();
  const total = await Product.countDocuments(filter);
  return {
    products: toProductListDTO(docs),
    total,
    page,
    limit: Number(limit),
  };
};

export const findProductById = async (id: string): Promise<ProductDTO | null> => {
  const product = await Product.findById(id).populate("category", "name slug parent");
  if (!product) return null;
  return toProductDTO(product);
};

export const updateProduct = async (id: string, update: Partial<IProduct>): Promise<ProductDTO | null> => {
  // Clean up the update object - convert empty strings to null/undefined for ObjectId fields
  const cleanedUpdate: Record<string, any> = { ...update };
  const unsetFields: Record<string, any> = {};

  // Handle category field - empty string should unset the field
  if ("category" in cleanedUpdate) {
    if (
      cleanedUpdate.category === "" ||
      cleanedUpdate.category === null ||
      cleanedUpdate.category === undefined
    ) {
      delete cleanedUpdate.category;
      unsetFields.category = 1;
    }
  }

  // Build the update query
  const updateQuery: Record<string, any> = {};
  if (Object.keys(cleanedUpdate).length > 0) {
    updateQuery.$set = cleanedUpdate;
  }
  if (Object.keys(unsetFields).length > 0) {
    updateQuery.$unset = unsetFields;
  }

  // If nothing to update, just return the existing document with populated category
  if (Object.keys(updateQuery).length === 0) {
    const existing = await Product.findById(id).populate("category", "name slug");
    if (!existing) return null;
    return toProductDTO(existing);
  }

  const product = await Product.findByIdAndUpdate(id, updateQuery, { new: true }).populate(
    "category",
    "name slug"
  );
  if (!product) return null;
  return toProductDTO(product);
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  const result = await Product.findByIdAndDelete(id);
  return !!result;
};
