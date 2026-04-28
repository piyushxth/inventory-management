"use client";

import { useState } from "react";

type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category?: { name: string; slug: string };
  gender?: { label: string; slug: string };
  isPublished: boolean;
};

interface Props {
  product: Product;
  onClose: () => void;
  onBack?: () => void; // optional: go back to actions modal
}

export default function ProductGeneralModal({
  product,
  onClose,
  onBack,
}: Props) {
  const [form, setForm] = useState({
    name: product.name || "",
    slug: product.slug || "",
    description: product.description || "",
    categorySlug: product.category?.slug || "",
    genderSlug: product.gender?.slug || "",
    isPublished: product.isPublished ?? true,
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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-6">
        {/* Header */}
        <header className="sticky top-0 flex justify-between items-center p-6">
          Edit General Information [{product.name}]
          {onBack && (
            <button
              onClick={onBack}
              className="text-sm text-gray-500 hover:underline"
            >
              ← Back
            </button>
          )}
        </header>

        {/* Form */}
        <div className="space-y-4 overflow-y-auto max-h-[70vh] px-6">
          {/* Name */}
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm mb-1">Slug</label>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm mb-1">Category</label>
            <input
              name="categorySlug"
              value={form.categorySlug}
              onChange={handleChange}
              placeholder="e.g. shirts"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm mb-1">Gender</label>
            <input
              name="genderSlug"
              value={form.genderSlug}
              onChange={handleChange}
              placeholder="e.g. men"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Publish */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isPublished"
              checked={form.isPublished}
              onChange={handleChange}
            />
            <label className="text-sm">Published</label>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200">
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
