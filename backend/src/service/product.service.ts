import Product, { IProduct } from "../models/Product";

export const createProduct = async (payload: Partial<IProduct>) => {
  // Handle empty string category - should be undefined for no category
  if (payload.category === "" || payload.category === null) {
    delete payload.category;
  }

  const p = new Product(payload);
  const saved = await p.save();
  // Populate category before returning
  return await Product.findById(saved._id).populate("category", "name slug");
};

export const findProducts = async (filter: any = {}, opts: any = {}) => {
  const { page = 1, limit = 20, sort = "-createdAt" } = opts;
  const skip = (page - 1) * limit;
  const docs = await Product.find(filter)
    .populate("category", "name slug")
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .lean();
  const total = await Product.countDocuments(filter);
  return { docs, total, page, limit: Number(limit) };
};

export const findProductById = async (id: string) =>
  Product.findById(id).populate("category", "name slug parent");

export const updateProduct = async (id: string, update: Partial<IProduct>) => {
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
    return Product.findById(id).populate("category", "name slug");
  }

  return Product.findByIdAndUpdate(id, updateQuery, { new: true }).populate(
    "category",
    "name slug"
  );
};

export const deleteProduct = (id: string) => Product.findByIdAndDelete(id);
