"use client";
import React, { useState } from "react";
import ComponentCard from "./common/ComponentCard";
import Label from "./form/Label";
import Input from "./form/input/InputField";
import { CategoryType } from "@/libs/products.types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema } from "@/libs/validations/category";
import { updateCategory } from "@/libs/actions/categories/write";

type Props = {
  onClose: () => void;
  data: CategoryType; // Assuming you have a Category type defined
};

const CategoryEditModal = ({ data, onClose }: Props) => {
  console.log("Category data in modal:", data);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,

    formState: { errors, isSubmitting },
  } = useForm<CategoryType>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      id: data.id,
      name: data.name || "",
      slug: data.slug || "",
      parentId: data.parentId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  async function onSubmit(data: CategoryType) {
    console.log("Submitting form with data:", data);
    setServerError("");

    const res = await updateCategory(data);

    if (!res.success) {
      setServerError("Failed to update category");
      return;
    }

    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center pb-[5dvh] justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[85vh] bg-white dark:bg-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-gray-700 sticky top-0 z-10">
          <h2 className="text-lg font-semibold dark:text-white">
            Edit Category
            <span className="text-gray-600 dark:text-gray-400 ml-1">
              [{data.name}]
            </span>
          </h2>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
          >
            ✕
          </button>
        </header>
        <div className="px-6  py-4 overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <ComponentCard>
              <div>
                <Label>Name</Label>
                <Input {...register("name")} />
                {errors.name && <p>{errors.name.message}</p>}
              </div>
              {/* Slug */}
              <div>
                <Label>Slug</Label>
                <Input {...register("slug")} />
                {errors.slug && <p>{errors.slug.message}</p>}
              </div>
            </ComponentCard>

            {/* Server Error */}
            {serverError && <p style={{ color: "red" }}>{serverError}</p>}

            {/* Buttons */}
            <div className="flex gap-2.5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="border text-sm
              rounded-lg bg-blue-500 hover:bg-blue-600 py-2 px-3"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryEditModal;
