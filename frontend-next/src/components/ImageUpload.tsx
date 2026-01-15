"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { uploadApi } from "@/services/uploadApi";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  maxImages?: number;
  single?: boolean;
  onDeleteFromS3?: boolean;
}

export default function ImageUpload({
  value = [],
  onChange,
  folder = "uploads",
  maxImages = 5,
  single = false,
  onDeleteFromS3 = true,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);

    try {
      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!file.type.startsWith("image/")) {
          setError("Only image files are allowed");
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          setError("File size must be less than 5MB");
          continue;
        }

        if (!single && value.length + newUrls.length >= maxImages) {
          setError(`Maximum ${maxImages} images allowed`);
          break;
        }

        const result = await uploadApi.uploadFile(file, folder);
        newUrls.push(result.url);

        if (single) break;
      }

      if (newUrls.length > 0) {
        if (single) {
          onChange(newUrls);
        } else {
          onChange([...value, ...newUrls]);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = async (index: number) => {
    const urlToRemove = value[index];
    setDeleting(index);
    setError(null);

    try {
      if (onDeleteFromS3 && urlToRemove) {
        await uploadApi.deleteFile(urlToRemove);
      }

      const newUrls = value.filter((_, i) => i !== index);
      onChange(newUrls);
    } catch (err: any) {
      const newUrls = value.filter((_, i) => i !== index);
      onChange(newUrls);
      setError("Image removed but S3 deletion may have failed");
    } finally {
      setDeleting(null);
    }
  };

  const handleRemoveAll = async () => {
    if (value.length === 0) return;

    setError(null);

    if (onDeleteFromS3) {
      try {
        const result = await uploadApi.deleteMultipleFiles(value);
        if (result.data.failed.length > 0) {
          setError(`${result.data.failed.length} image(s) may not have been deleted from storage`);
        }
      } catch {
        setError("Some images may not have been deleted from storage");
      }
    }

    onChange([]);
  };

  // File drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  // Image reorder handlers
  const handleImageDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleImageDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleImageDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newUrls = [...value];
    const [draggedItem] = newUrls.splice(draggedIndex, 1);
    newUrls.splice(dropIndex, 0, draggedItem);
    onChange(newUrls);

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleImageDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Move image to first position (make it default)
  const makeDefault = (index: number) => {
    if (index === 0) return;
    const newUrls = [...value];
    const [item] = newUrls.splice(index, 1);
    newUrls.unshift(item);
    onChange(newUrls);
  };

  const canAddMore = single ? value.length === 0 : value.length < maxImages;

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      {canAddMore && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
            transition-all duration-200
            ${dragOver
              ? "border-cyan-500 bg-cyan-50"
              : "border-gray-300 hover:border-cyan-400 hover:bg-gray-50"
            }
            ${uploading ? "pointer-events-none opacity-60" : ""}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={!single}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF, WebP up to 5MB
                  {!single && ` (max ${maxImages} images)`}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Image Preview Grid */}
      {value.length > 0 && (
        <div className="space-y-3">
          {/* Reorder hint and Remove All Button */}
          {!single && value.length > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                Drag images to reorder. First image is the default.
              </p>
              <button
                type="button"
                onClick={handleRemoveAll}
                className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove all
              </button>
            </div>
          )}

          <div className={`grid gap-3 ${single ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"}`}>
            {value.map((url, index) => (
              <div
                key={url}
                draggable={!single && value.length > 1}
                onDragStart={(e) => handleImageDragStart(e, index)}
                onDragOver={(e) => handleImageDragOver(e, index)}
                onDragLeave={handleImageDragLeave}
                onDrop={(e) => handleImageDrop(e, index)}
                onDragEnd={handleImageDragEnd}
                className={`relative group rounded-xl overflow-hidden border-2 ${
                  single ? "aspect-video" : "aspect-square"
                } ${deleting === index ? "opacity-50" : ""} ${
                  draggedIndex === index ? "opacity-50 scale-95" : ""
                } ${
                  dragOverIndex === index ? "border-cyan-500 border-dashed" : "border-gray-200"
                } ${
                  index === 0 && !single ? "ring-2 ring-cyan-500 ring-offset-2" : ""
                } ${!single && value.length > 1 ? "cursor-grab active:cursor-grabbing" : ""} transition-all duration-200`}
              >
                <Image
                  src={url}
                  alt={`Image ${index + 1}`}
                  fill
                  className="object-cover pointer-events-none"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />

                {/* Default badge for first image */}
                {index === 0 && !single && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-cyan-500 text-white text-xs font-medium rounded-md shadow-lg">
                    Default
                  </div>
                )}

                {/* Make default button for non-first images */}
                {index !== 0 && !single && (
                  <button
                    type="button"
                    onClick={() => makeDefault(index)}
                    className="absolute top-2 left-2 px-2 py-1 bg-white/90 text-gray-700 text-xs font-medium rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    Set as default
                  </button>
                )}

                {/* Delete button or loading spinner */}
                {deleting === index ? (
                  <div className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    disabled={deleting !== null}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                {/* Drag handle indicator */}
                {!single && value.length > 1 && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                    {index + 1} / {value.length}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
