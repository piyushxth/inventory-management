"use client";

import React from "react";
import { useForm } from "react-hook-form";

import ComponentCard from "./common/ComponentCard";
import Label from "./form/Label";
import Input from "./form/input/InputField";

type Props = {
  onClose: () => void;
};

type Tab = "general" | "variants";

type ProductCreateInput = {
  name: string;
  slug: string;
  description: string;
};

const ProductAddModal = ({ onClose }: Props) => {
  const [activeTab, setActiveTab] = React.useState<Tab>("general");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductCreateInput>({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  const onSubmit = async (data: ProductCreateInput) => {
    console.log(data);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Add Product
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Create and manage your product details
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-gray-100 dark:hover:bg-white/[0.05]"
          >
            <span className="text-lg text-gray-500 dark:text-gray-400">✕</span>
          </button>
        </header>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition ${
                activeTab === "general"
                  ? "border-blue-500 text-blue-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              General
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("variants")}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition ${
                activeTab === "variants"
                  ? "border-blue-500 text-blue-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Variants
            </button>
          </div>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {/* GENERAL TAB */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <ComponentCard>
                  <div className="space-y-5">
                    {/* Name */}
                    <div>
                      <Label>Name</Label>

                      <Input
                        placeholder="Nike Air Max"
                        {...register("name", {
                          required: "Name is required",
                        })}
                      />

                      {errors.name && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Slug */}
                    <div>
                      <Label>Slug</Label>

                      <Input
                        placeholder="nike-air-max"
                        {...register("slug", {
                          required: "Slug is required",
                        })}
                      />

                      {errors.slug && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.slug.message}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <Label>Description</Label>

                      <textarea
                        rows={5}
                        placeholder="Write product description..."
                        className="w-full rounded-xl border border-gray-300 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        {...register("description")}
                      />

                      {errors.description && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.description.message}
                        </p>
                      )}
                    </div>
                  </div>
                </ComponentCard>
              </div>
            )}

            {/* VARIANTS TAB */}
            {activeTab === "variants" && (
              <ComponentCard>
                <div className="flex min-h-[300px] items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-white">
                      Variants
                    </h3>

                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Variant management will be added here.
                    </p>
                  </div>
                </div>
              </ComponentCard>
            )}
          </div>

          {/* Footer */}
          <footer className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-blue-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Product"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default ProductAddModal;
