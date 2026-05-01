"use client";

import { ProductDetail, ProductGeneralInfo } from "@/libs/products.types";
import { useState } from "react";

interface Props {
  product: ProductDetail;
  onClose: () => void;
  onBack?: () => void; // optional: go back to actions modal
}

export default function ProductGeneralModal({
  product,
  onClose,
  onBack,
}: Props) {
  const [form, setForm] = useState<ProductGeneralInfo>({
    id: product.id,
    name: product.name || "",
    slug: product.slug || "",
    description: product.description || "",
    isOnSale: product.isOnSale || false,
    category: {
      id: product.category?.id || "",
      name: product.category?.name || "",
      slug: product.category?.slug || "",
    },
    gender: {
      id: product.gender?.id || "",
      label: product.gender?.label || "",
      slug: product.gender?.slug || "",
    },
    images: product.images.map((img) => ({
      id: img.id,
      url: img.url,
      isPrimary: img.isPrimary,
      sortOrder: img.sortOrder,
      variantId: img.variantId,
    })),
  });

  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  async function handleSubmit() {
    try {
      setLoading(true);

      // 🔥 call your write action here
      // await updateProductGeneral(product.id, form);

      console.log("Submitting:", product.id, form);

      onClose(); // close after save
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      {/* Container */}
      <div
        className="w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b bg-white sticky top-0 z-10">
          <h2 className="text-lg font-semibold">
            Edit Product
            <span className="text-gray-500 ml-1">[{product.name}]</span>
          </h2>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
          >
            ✕
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Slug</label>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          {/* Category + Gender Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Category
              </label>
              <input
                name="categorySlug"
                value={form.category.slug}
                onChange={handleChange}
                placeholder="e.g. shirts"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Gender
              </label>
              <input
                name="genderSlug"
                value={form.gender.slug}
                onChange={handleChange}
                placeholder="e.g. men"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Publish Toggle */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Published</p>
              <p className="text-xs text-gray-500">
                Make this product visible to customers
              </p>
            </div>

            <input
              type="checkbox"
              name="isPublished"
              checked={form.isOnSale}
              onChange={handleChange}
              className="w-5 h-5"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-white">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
