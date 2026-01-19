"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { heroSlideApi, HeroSlide, CreateHeroSlidePayload } from "@/services/heroSlideApi";
import { uploadApi } from "@/services/uploadApi";
import ImageUpload from "@/components/ImageUpload";
import { formatAsCurrency } from "@/utils/formatCurrency";

type ModalMode = "add" | "edit" | null;

export default function AdminHeroSlidesPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedSlide, setSelectedSlide] = useState<HeroSlide | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [initialImage, setInitialImage] = useState<string>("");

  const [formData, setFormData] = useState<CreateHeroSlidePayload>({
    title: "",
    highlight: "",
    description: "",
    category: "",
    image: "",
    price: 0,
    originalPrice: 0,
    buttonText: "Shop Now",
    buttonLink: "/shop",
    secondaryButtonText: "",
    secondaryButtonLink: "",
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const response = await heroSlideApi.getAllSlides();
      setSlides(response.data.slides || []);
    } catch (err) {
      setError("Failed to load hero slides");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({
      title: "",
      highlight: "",
      description: "",
      category: "",
      image: "",
      price: 0,
      originalPrice: 0,
      buttonText: "Shop Now",
      buttonLink: "/shop",
      secondaryButtonText: "",
      secondaryButtonLink: "",
      isActive: true,
      order: slides.length,
    });
    setInitialImage("");
    setFormError(null);
    setModalMode("add");
  };

  const openEditModal = (slide: HeroSlide) => {
    setSelectedSlide(slide);
    setFormData({
      title: slide.title,
      highlight: slide.highlight,
      description: slide.description,
      category: slide.category,
      image: slide.image,
      price: slide.price,
      originalPrice: slide.originalPrice,
      buttonText: slide.buttonText,
      buttonLink: slide.buttonLink,
      secondaryButtonText: slide.secondaryButtonText || "",
      secondaryButtonLink: slide.secondaryButtonLink || "",
      isActive: slide.isActive,
      order: slide.order,
    });
    setInitialImage(slide.image);
    setFormError(null);
    setModalMode("edit");
  };

  const closeModal = async () => {
    // Cleanup uploaded images if canceling
    if (modalMode === "add" && formData.image) {
      try {
        await uploadApi.deleteFile(formData.image);
      } catch (err) {
        console.error("Failed to cleanup uploaded image:", err);
      }
    }
    if (modalMode === "edit" && formData.image !== initialImage && formData.image) {
      try {
        await uploadApi.deleteFile(formData.image);
      } catch (err) {
        console.error("Failed to cleanup uploaded image:", err);
      }
    }
    setModalMode(null);
    setSelectedSlide(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      if (modalMode === "add") {
        await heroSlideApi.createSlide(formData);
      } else if (modalMode === "edit" && selectedSlide) {
        // If image changed, delete the old one
        if (formData.image !== initialImage && initialImage) {
          try {
            await uploadApi.deleteFile(initialImage);
          } catch (err) {
            console.error("Failed to delete old image:", err);
          }
        }
        await heroSlideApi.updateSlide(selectedSlide.id, formData);
      }
      await fetchSlides();
      setModalMode(null);
      setSelectedSlide(null);
    } catch (err: any) {
      setFormError(err.response?.data?.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSubmitting(true);
    try {
      const slide = slides.find((s) => s.id === id);
      await heroSlideApi.deleteSlide(id);
      // Delete the image from storage
      if (slide?.image) {
        try {
          await uploadApi.deleteFile(slide.image);
        } catch (err) {
          console.error("Failed to delete image:", err);
        }
      }
      await fetchSlides();
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      await heroSlideApi.toggleActive(slide.id);
      await fetchSlides();
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageChange = (urls: string[]) => {
    setFormData((prev) => ({ ...prev, image: urls[0] || "" }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Slides</h1>
          <p className="text-gray-500 mt-1">Manage homepage hero carousel slides</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Slide
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Slides Grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-500">Loading slides...</span>
            </div>
          </div>
        ) : slides.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 mb-4">No hero slides yet</p>
            <button
              onClick={openAddModal}
              className="text-cyan-600 hover:text-cyan-700 font-medium"
            >
              Create your first slide
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {slides.map((slide, index) => (
              <div key={slide.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                {/* Order number */}
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-medium text-gray-600">
                  {index + 1}
                </div>

                {/* Image preview */}
                <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {slide.image ? (
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      width={96}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{slide.title}</h3>
                    <span className="text-xs text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded">
                      {slide.highlight}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{slide.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400">{slide.category}</span>
                    <span className="text-xs font-medium text-gray-900">{formatAsCurrency(slide.price)}</span>
                    {slide.originalPrice > slide.price && (
                      <span className="text-xs text-gray-400 line-through">{formatAsCurrency(slide.originalPrice)}</span>
                    )}
                  </div>
                </div>

                {/* Status */}
                <button
                  onClick={() => handleToggleActive(slide)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    slide.isActive
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {slide.isActive ? "Active" : "Inactive"}
                </button>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(slide)}
                    className="p-2 text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(slide.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full-screen Modal Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          modalMode ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeModal}
      />

      {/* Full-screen Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 transition-all duration-300 ${
          modalMode ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col transform transition-all duration-300 ${
            modalMode ? "scale-100" : "scale-95"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-t-2xl">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === "add" ? "Create New Hero Slide" : "Edit Hero Slide"}
              </h2>
              <p className="text-gray-500 mt-1">
                {modalMode === "add"
                  ? "Add a new slide to your homepage hero carousel"
                  : "Update the details of this hero slide"}
              </p>
            </div>
            <button
              onClick={closeModal}
              className="p-3 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Body - Scrollable */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-8">
              {/* Form Error Message */}
              {formError && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-600">{formError}</p>
                </div>
              )}

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Content */}
                <div className="space-y-6">
                  {/* Basic Information Section */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                        <p className="text-sm text-gray-500">Main content displayed on the slide</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                        <input
                          type="text"
                          required
                          value={formData.title}
                          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., MacBook Pro"
                          className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                        />
                        <p className="text-xs text-gray-400 mt-1.5">The main headline of the slide</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Highlight Text</label>
                        <input
                          type="text"
                          required
                          value={formData.highlight}
                          onChange={(e) => setFormData((prev) => ({ ...prev, highlight: e.target.value }))}
                          placeholder="e.g., M3 Chip"
                          className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                        />
                        <p className="text-xs text-gray-400 mt-1.5">Accent text shown in gradient color</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Category Badge</label>
                        <input
                          type="text"
                          required
                          value={formData.category}
                          onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                          placeholder="e.g., Electronics"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                        />
                        <p className="text-xs text-gray-400 mt-1.5">Small label shown above the title</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea
                          required
                          rows={4}
                          value={formData.description}
                          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                          placeholder="Enter a compelling description that highlights the key features..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none resize-none transition-all text-gray-900 placeholder:text-gray-400"
                        />
                        <p className="text-xs text-gray-400 mt-1.5">Supporting text below the title</p>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Section */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Pricing</h3>
                        <p className="text-sm text-gray-500">Display price with optional discount</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Sale Price (UGX)</label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="1"
                          value={formData.price}
                          onChange={(e) => setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                          placeholder="0"
                          className="w-full px-4 py-3 text-lg font-semibold border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                        />
                        <p className="text-xs text-gray-400 mt-1.5">Current displayed price</p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price (UGX)</label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="1"
                          value={formData.originalPrice}
                          onChange={(e) => setFormData((prev) => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }))}
                          placeholder="0"
                          className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                        />
                        <p className="text-xs text-gray-400 mt-1.5">Strikethrough price for discount</p>
                      </div>
                    </div>

                    {formData.originalPrice > formData.price && formData.originalPrice > 0 && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700">
                          <span className="font-semibold">Savings:</span>{" "}
                          {Math.round((1 - formData.price / formData.originalPrice) * 100)}% off ({formatAsCurrency(formData.originalPrice - formData.price)} saved)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Image & Buttons */}
                <div className="space-y-6">
                  {/* Image Upload Section */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Slide Image</h3>
                        <p className="text-sm text-gray-500">Main visual for the carousel</p>
                      </div>
                    </div>

                    <ImageUpload
                      value={formData.image ? [formData.image] : []}
                      onChange={handleImageChange}
                      folder="hero-slides"
                      maxImages={1}
                    />
                    <p className="text-sm text-gray-500 mt-4">
                      Recommended: 800x800 pixels, square format works best for the carousel display.
                    </p>
                  </div>

                  {/* Call to Action Buttons Section */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Call to Action</h3>
                        <p className="text-sm text-gray-500">Buttons displayed on the slide</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      {/* Primary Button */}
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Primary Button</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Button Text</label>
                            <input
                              type="text"
                              value={formData.buttonText}
                              onChange={(e) => setFormData((prev) => ({ ...prev, buttonText: e.target.value }))}
                              placeholder="Shop Now"
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Link URL</label>
                            <input
                              type="text"
                              value={formData.buttonLink}
                              onChange={(e) => setFormData((prev) => ({ ...prev, buttonLink: e.target.value }))}
                              placeholder="/shop"
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Secondary Button */}
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Secondary Button (Optional)</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Button Text</label>
                            <input
                              type="text"
                              value={formData.secondaryButtonText}
                              onChange={(e) => setFormData((prev) => ({ ...prev, secondaryButtonText: e.target.value }))}
                              placeholder="View Details"
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Link URL</label>
                            <input
                              type="text"
                              value={formData.secondaryButtonLink}
                              onChange={(e) => setFormData((prev) => ({ ...prev, secondaryButtonLink: e.target.value }))}
                              placeholder="#featured"
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Toggle */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.isActive ? "bg-green-100" : "bg-gray-200"}`}>
                          <svg className={`w-5 h-5 ${formData.isActive ? "text-green-600" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Visibility</h3>
                          <p className="text-sm text-gray-500">
                            {formData.isActive ? "Slide is visible on the homepage" : "Slide is hidden from the homepage"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          formData.isActive ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${
                            formData.isActive ? "translate-x-7" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer - Fixed at bottom */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-5 rounded-b-2xl">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {modalMode === "add" ? "Fill in all required fields to create the slide" : "Changes will be saved immediately"}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 disabled:bg-cyan-400 transition-colors flex items-center gap-2 font-semibold shadow-lg shadow-cyan-600/25"
                  >
                    {submitting && (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {modalMode === "add" ? "Create Slide" : "Save Changes"}
                  </button>
                </div>
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
                <h3 className="text-lg font-semibold text-gray-900">Delete Slide</h3>
                <p className="text-sm text-gray-500">Are you sure you want to delete this slide? This action cannot be undone.</p>
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
                disabled={submitting}
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
