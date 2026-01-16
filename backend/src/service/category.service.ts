import { AppError, ErrorCode } from "../middleware/errorHandler";
import Category, { ICategory } from "../models/Category";
import Product from "../models/Product";
import {
  CategoryDTO,
  CategoryListItemDTO,
  CategoryTreeNodeDTO,
  toCategoryDTO,
  toCategoryListDTO,
  toCategoryTreeDTO,
} from "../dto";

// Helper function to generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

export const createCategory = async (payload: Partial<ICategory>): Promise<CategoryDTO> => {
  // Auto-generate slug if not provided
  if (!payload.slug && payload.name) {
    payload.slug = generateSlug(payload.name);
  }

  // Handle empty string parent - should be null/undefined for root categories
  if (payload.parent === ("" as any) || payload.parent === null) {
    delete payload.parent;
  }

  // Check if slug already exists
  if (payload.slug) {
    const existing = await Category.findOne({ slug: payload.slug });
    if (existing) {
      throw new AppError(
        `Category with slug "${payload.slug}" already exists`,
        ErrorCode.SLUG_EXISTS
      );
    }
  }

  const category = new Category(payload);
  const saved = await category.save();
  const populated = await Category.findById(saved._id).populate("parent", "name slug");
  return toCategoryDTO(populated!);
};

export interface CategoryListResult {
  categories: CategoryListItemDTO[];
  total: number;
  page: number;
  limit: number;
}

export const findCategories = async (filter: any = {}, opts: any = {}): Promise<CategoryListResult> => {
  const { page = 1, limit = 100, sort = "name" } = opts;
  const skip = (page - 1) * limit;
  const docs = await Category.find(filter)
    .populate("parent", "name slug")
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .lean();
  const total = await Category.countDocuments(filter);
  return {
    categories: toCategoryListDTO(docs),
    total,
    page,
    limit: Number(limit),
  };
};

// Get all categories in a tree structure with product counts
export const getCategoryTree = async (): Promise<CategoryTreeNodeDTO[]> => {
  const categories = await Category.find({ isActive: true })
    .sort("name")
    .lean();

  // Get product counts for all categories
  const productCounts = await Product.aggregate([
    { $match: { category: { $exists: true, $ne: null } } },
    { $group: { _id: "$category", count: { $sum: 1 } } }
  ]);

  // Create a map of category ID to product count
  const countMap = new Map<string, number>();
  productCounts.forEach((item: any) => {
    countMap.set(item._id.toString(), item.count);
  });

  // Build tree structure
  const categoryMap = new Map();
  const tree: any[] = [];

  // First pass: create map of all categories with product counts
  categories.forEach((cat: any) => {
    const productCount = countMap.get(cat._id.toString()) || 0;
    categoryMap.set(cat._id.toString(), { ...cat, productCount, subcategories: [] });
  });

  // Second pass: build tree
  categories.forEach((cat: any) => {
    const category = categoryMap.get(cat._id.toString());
    if (cat.parent) {
      const parent = categoryMap.get(cat.parent.toString());
      if (parent) {
        parent.subcategories.push(category);
      } else {
        // Parent not found or inactive, treat as root
        tree.push(category);
      }
    } else {
      tree.push(category);
    }
  });

  // Third pass: calculate total product counts including subcategories
  const calculateTotalProducts = (category: any): number => {
    let total = category.productCount || 0;
    for (const sub of category.subcategories) {
      total += calculateTotalProducts(sub);
    }
    category.totalProductCount = total;
    return total;
  };

  tree.forEach(calculateTotalProducts);

  return toCategoryTreeDTO(tree);
};

export const findCategoryById = async (id: string): Promise<CategoryDTO> => {
  const category = await Category.findById(id).populate("parent", "name slug");
  if (!category) {
    throw new AppError("Category not found", ErrorCode.CATEGORY_NOT_FOUND);
  }
  return toCategoryDTO(category);
};

export const findCategoryBySlug = async (slug: string): Promise<CategoryDTO> => {
  const category = await Category.findOne({ slug }).populate("parent", "name slug");
  if (!category) {
    throw new AppError("Category not found", ErrorCode.CATEGORY_NOT_FOUND);
  }
  return toCategoryDTO(category);
};

export const updateCategory = async (id: string, update: Partial<ICategory>): Promise<CategoryDTO> => {
  // Check if category exists
  const existing = await Category.findById(id);
  if (!existing) {
    throw new AppError("Category not found", ErrorCode.CATEGORY_NOT_FOUND);
  }

  // Auto-generate slug if name is updated and slug is not provided
  if (update.name && !update.slug) {
    update.slug = generateSlug(update.name);
  }

  // Check if new slug conflicts with existing category
  if (update.slug && update.slug !== existing.slug) {
    const slugConflict = await Category.findOne({ slug: update.slug, _id: { $ne: id } });
    if (slugConflict) {
      throw new AppError(
        `Category with slug "${update.slug}" already exists`,
        ErrorCode.SLUG_EXISTS
      );
    }
  }

  // Clean up the update object - handle empty string for parent field
  const cleanedUpdate: Record<string, any> = { ...update };
  const unsetFields: Record<string, any> = {};

  // Handle parent field - empty string should unset the field (make it a root category)
  if ("parent" in cleanedUpdate) {
    if (
      cleanedUpdate.parent === "" ||
      cleanedUpdate.parent === null ||
      cleanedUpdate.parent === undefined
    ) {
      delete cleanedUpdate.parent;
      unsetFields.parent = 1;
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

  // If nothing to update, just return the existing document
  if (Object.keys(updateQuery).length === 0) {
    const cat = await Category.findById(id).populate("parent", "name slug");
    return toCategoryDTO(cat!);
  }

  const updated = await Category.findByIdAndUpdate(id, updateQuery, { new: true }).populate(
    "parent",
    "name slug"
  );
  return toCategoryDTO(updated!);
};

export const deleteCategory = async (id: string): Promise<void> => {
  // Check if category exists
  const existing = await Category.findById(id);
  if (!existing) {
    throw new AppError("Category not found", ErrorCode.CATEGORY_NOT_FOUND);
  }

  // Recursively get all descendant category IDs
  const getAllDescendantIds = async (parentId: string): Promise<string[]> => {
    const children = await Category.find({ parent: parentId }).select("_id").lean();
    const childIds = children.map((c) => c._id.toString());

    // Recursively get descendants of each child
    const descendantIds: string[] = [];
    for (const childId of childIds) {
      const descendants = await getAllDescendantIds(childId);
      descendantIds.push(...descendants);
    }

    return [...childIds, ...descendantIds];
  };

  // Get all descendant IDs
  const descendantIds = await getAllDescendantIds(id);

  // Delete all descendants first, then the parent
  if (descendantIds.length > 0) {
    await Category.deleteMany({ _id: { $in: descendantIds } });
  }

  // Delete the category itself
  await Category.findByIdAndDelete(id);
};

// Get subcategories of a category
export const getSubcategories = async (parentId: string): Promise<CategoryListItemDTO[]> => {
  // Verify parent exists
  const parent = await Category.findById(parentId);
  if (!parent) {
    throw new AppError("Parent category not found", ErrorCode.CATEGORY_NOT_FOUND);
  }

  const subcategories = await Category.find({ parent: parentId, isActive: true })
    .sort("name")
    .lean();

  return toCategoryListDTO(subcategories);
};
