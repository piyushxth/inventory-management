"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import Label from "@/components/admin/form/Label";
import Input from "@/components/admin/form/input/InputField";
import TextArea from "@/components/admin/form/input/TextArea";
import ComponentCard from "@/components/admin/common/ComponentCard";

// Category validation schema
const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface Category {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const CategoryEditForm = ({ category }: { category: Category }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category.name,
      description: category.description,
    },
  });

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setIsLoading(true);
      const response = await axios.put(`/api/categories/${category._id}`, data);

      if (response.data.success) {
        alert("Category updated successfully!");
        router.push("/admin/categories");
      } else {
        alert(response.data.message || "Failed to update category");
      }
    } catch (error: any) {
      console.error("Error updating category:", error);
      alert(
        error.response?.data?.message ||
          "Error updating category. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
      <ComponentCard title="Category Information">
        <div className="space-y-4">
          <div className="flex flex-col">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter category name"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col">
            <Label htmlFor="description">Description</Label>
            <TextArea
              value={watch("description") || ""}
              onChange={(value) => setValue("description", value)}
              placeholder="Enter category description"
              className={errors.description ? "border-red-500" : ""}
              rows={4}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>
      </ComponentCard>

      {/* Submit Button */}
      <div className="flex justify-end mt-6">
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50 font-medium"
        >
          {isSubmitting || isLoading ? "Updating..." : "Update Category"}
        </button>
      </div>
    </form>
  );
};

export default CategoryEditForm;
