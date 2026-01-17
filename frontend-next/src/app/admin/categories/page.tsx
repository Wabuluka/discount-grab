"use client";

import { useEffect, useState } from "react";
import { categoryApi, Category, CreateCategoryPayload, getCategoryId } from "@/services/categoryApi";
import ImageUpload from "@/components/ImageUpload";
import CategoryTree from "@/components/CategoryTree";

type ModalMode = "add" | "edit" | null;

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [flatCategories, setFlatCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CreateCategoryPayload>({
    name: "",
    slug: "",
    description: "",
    parent: null,
    image: "",
    isActive: true,
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Fetch both tree and flat list
      const [treeResponse, flatResponse] = await Promise.all([
        categoryApi.getCategoryTree(),
        categoryApi.getCategories(),
      ]);
      setCategories(treeResponse.data.data);
      setFlatCategories(flatResponse.data.categories);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Get parent categories (those without a parent)
  const parentCategories = flatCategories.filter((c) => !c.parent);

  // Filter tree categories based on search
  const filterTree = (cats: Category[], query: string): Category[] => {
    if (!query) return cats;
    const lowerQuery = query.toLowerCase();

    return cats.reduce<Category[]>((acc, cat) => {
      const matches = cat.name.toLowerCase().includes(lowerQuery) ||
                      cat.slug.toLowerCase().includes(lowerQuery);
      const filteredChildren = cat.subcategories
        ? filterTree(cat.subcategories, query)
        : [];

      if (matches || filteredChildren.length > 0) {
        acc.push({
          ...cat,
          subcategories: filteredChildren.length > 0 ? filteredChildren : cat.subcategories,
        });
      }
      return acc;
    }, []);
  };

  const filteredCategories = filterTree(categories, searchQuery);

  const openAddModal = (parentId?: string) => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      parent: parentId || null,
      image: "",
      isActive: true,
    });
    setModalMode("add");
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      parent: category.parent ? (category.parent.id || category.parent._id || null) : null,
      image: category.image || "",
      isActive: category.isActive,
    });
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      parent: null,
      image: "",
      isActive: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modalMode === "add") {
        await categoryApi.createCategory(formData);
      } else if (modalMode === "edit" && selectedCategory) {
        await categoryApi.updateCategory(getCategoryId(selectedCategory), formData);
      }
      await fetchCategories();
      closeModal();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      await categoryApi.deleteCategory(id);
      await fetchCategories();
      setDeleteConfirm(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete category");
    } finally {
      setSaving(false);
    }
  };

  // Find category by ID in tree structure
  const findCategoryById = (cats: Category[], id: string): Category | null => {
    for (const cat of cats) {
      if (getCategoryId(cat) === id) return cat;
      if (cat.subcategories) {
        const found = findCategoryById(cat.subcategories, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Count total categories including subcategories
  const countCategories = (cats: Category[]): number => {
    return cats.reduce((count, cat) => {
      return count + 1 + (cat.subcategories ? countCategories(cat.subcategories) : 0);
    }, 0);
  };

  const totalCount = countCategories(categories);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 mt-1">Manage product categories and subcategories</p>
        </div>
        <button
          onClick={() => openAddModal()}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Category
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Categories</p>
          <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Parent Categories</p>
          <p className="text-2xl font-bold text-cyan-600">{categories.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Subcategories</p>
          <p className="text-2xl font-bold text-blue-600">{totalCount - categories.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {flatCategories.filter((c) => c.isActive).length}
          </p>
        </div>
      </div>

      {/* Categories Tree View */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-500">Loading categories...</span>
            </div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <p className="text-gray-500">
              {searchQuery ? "No categories match your search" : "No categories found"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => openAddModal()}
                className="mt-4 text-cyan-600 hover:text-cyan-700 font-medium"
              >
                Create your first category
              </button>
            )}
          </div>
        ) : (
          <CategoryTree
            categories={filteredCategories}
            variant="admin"
            onAddSubcategory={(parentId) => openAddModal(parentId)}
            onEdit={(category) => openEditModal(category)}
            onDelete={(categoryId) => setDeleteConfirm(categoryId)}
          />
        )}
      </div>

      {/* Slide-in Panel Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          modalMode ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeModal}
      />

      {/* Slide-in Panel from Right */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-lg bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
          modalMode ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Panel Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === "add" ? "Add New Category" : "Edit Category"}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {modalMode === "add"
                  ? formData.parent
                    ? "Create a new subcategory"
                    : "Create a new top-level category"
                  : "Update category details"}
              </p>
            </div>
            <button
              onClick={closeModal}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Panel Body - Scrollable */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter category name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                      }))
                    }
                    placeholder="auto-generated-from-name"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate from name</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter category description (optional)"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none resize-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Parent Category</label>
                <select
                  value={formData.parent || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, parent: e.target.value || null }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                >
                  <option value="">None (Top-level category)</option>
                  {parentCategories
                    .filter((c) => getCategoryId(c) !== (selectedCategory ? getCategoryId(selectedCategory) : null))
                    .map((category) => (
                      <option key={getCategoryId(category)} value={getCategoryId(category)}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category Image</label>
                <ImageUpload
                  value={formData.image ? [formData.image] : []}
                  onChange={(urls) => setFormData((prev) => ({ ...prev, image: urls[0] || "" }))}
                  folder="categories"
                  single
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active
                </label>
                <span className="text-xs text-gray-500">
                  (Inactive categories won&apos;t appear in the store)
                </span>
              </div>
            </div>

            {/* Panel Footer - Fixed at bottom */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-cyan-400 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-cyan-600/25"
                >
                  {saving && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {modalMode === "add" ? "Create Category" : "Update Category"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Category</h3>
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this category? This action cannot be undone.
                  Categories with subcategories cannot be deleted.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={saving}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
