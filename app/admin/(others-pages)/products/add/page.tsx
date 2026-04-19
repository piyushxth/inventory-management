"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productCreateSchema,
  TProductCreate,
} from "@/libs/zod_schema/products/productCreate";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Label from "@/components/admin/form/Label";
import Input from "@/components/admin/form/input/InputField";
import TextArea from "@/components/admin/form/input/TextArea";
import Select from "@/components/admin/form/Select";
import ComponentCard from "@/components/admin/common/ComponentCard";
import Button from "@/components/admin/ui/button/Button";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import { Modal } from "@/components/admin/ui/modal";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { z as zodZ } from "zod";
import { VariantFields } from "@/components/client/VariantFields";

interface Category {
  _id: string;
  name: string;
  description: string;
}

interface CategoryFormData {
  name: string;
  description: string;
}

type FormData = zodZ.infer<typeof productCreateSchema>;

// Custom Dropzone Component
const ImageDropzone: React.FC<{
  images: File[];
  onImagesChange: (images: File[]) => void;
  errors?: any;
}> = ({ images, onImagesChange, errors }) => {
  const onDrop = (acceptedFiles: File[]) => {
    // Add new images to existing ones
    onImagesChange([...images, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
      "image/svg+xml": [],
    },
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center">
          <svg
            className="w-12 h-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-lg font-medium text-gray-700 mb-2">
            {isDragActive ? "Drop images here" : "Drag & drop images here"}
          </p>
          <p className="text-sm text-gray-500">or click to browse files</p>
        </div>
      </div>

      {/* Display selected images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((file, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`Product image ${index + 1}`}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
              <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
            </div>
          ))}
        </div>
      )}

      {errors && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
    </div>
  );
};

export default function AddProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(productCreateSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      costPrice: 0,
      basePrice: 0,
      mainImage: [],
      tags: [],
      variants: [
        {
          color: "",
          images: [],
          options: [{ size: "", price: 0, quantity: 0, sku: "" }],
        },
      ],
    },
  });

  // For variants
  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  // Sync with form
  useEffect(() => {
    // Convert file objects to URLs or filenames if you’re uploading later
    setValue(
      "mainImage",
      selectedImages.map((file) => file.name),
    );
  }, [selectedImages, setValue]);

  // Category form
  const {
    register: registerCategory,
    handleSubmit: handleSubmitCategory,
    formState: { errors: categoryErrors },
    reset: resetCategoryForm,
    watch: watchCategory,
    setValue: setValueCategory,
  } = useForm<CategoryFormData>();

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/categories");
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const mutation = useMutation({
    mutationFn: async (data: TProductCreate) => {
      setIsLoading(true);
      try {
        const response = await axios.post("/api/products", data);
        return response.data;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (response) => {
      console.log("Product created successfully:", response.data);
      alert("Product created successfully!");
      // Reset form
      setValue("name", "");
      setValue("description", "");
      setValue("category", "");
      setValue("costPrice", 0);
      setValue("basePrice", 0);
      setValue("mainImage", []);
      setValue("variants", [
        {
          color: "",
          colorHex: "",
          images: [],
          options: [{ size: "", price: 0, quantity: 0, sku: "" }],
        },
      ]);
      setSelectedImages([]);
    },
    onError: (error: any) => {
      console.error("Error creating product:", error);
      if (error.response?.data?.message) {
        alert(`Failed to create product: ${error.response.data.message}`);
      } else {
        alert("Failed to create product. Please try again.");
      }
    },
  });

  const categoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      setIsCreatingCategory(true);
      try {
        const response = await axios.post("/api/categories", data);
        return response.data;
      } finally {
        setIsCreatingCategory(false);
      }
    },
    onSuccess: (data) => {
      // Add the new category to the list
      setCategories((prev) => [...prev, data.data]);
      // Set the new category as selected
      setValue("category", data.data._id);
      // Close modal and reset form
      setIsCategoryModalOpen(false);
      resetCategoryForm();
      alert("Category created successfully!");
    },
    onError: (error: any) => {
      console.error("Error creating category:", error);
      alert(
        error.response?.data?.message ||
          "Failed to create category. Please try again.",
      );
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      console.log("Form data before validation:", data);

      // Basic field validations
      if (!data.name || data.name.trim() === "") {
        alert("Product name is required.");
        return;
      }

      if (!data.description || data.description.trim() === "") {
        alert("Product description is required.");
        return;
      }

      if (!data.category || data.category.trim() === "") {
        alert("Product category is required.");
        return;
      }

      if (data.costPrice < 0) {
        alert("Cost price must be zero or positive.");
        return;
      }

      if (data.basePrice < 0) {
        alert("Base price must be zero or positive.");
        return;
      }

      // Validate variants explicitly
      if (!data.variants || data.variants.length === 0) {
        alert("At least one variant is required.");
        return;
      }

      // Validate each variant
      for (let i = 0; i < data.variants.length; i++) {
        const variant = data.variants[i];
        if (!variant.color || variant.color.trim() === "") {
          alert(`Variant ${i + 1}: Color is required.`);
          return;
        }

        if (!variant.options || variant.options.length === 0) {
          alert(`Variant ${i + 1}: At least one size option is required.`);
          return;
        }

        // Validate each option in the variant
        for (let j = 0; j < variant.options.length; j++) {
          const option = variant.options[j];
          if (!option.size || option.size.trim() === "") {
            alert(`Variant ${i + 1}, Option ${j + 1}: Size is required.`);
            return;
          }

          if (option.price < 0) {
            alert(
              `Variant ${i + 1}, Option ${j + 1}: Price must be zero or positive.`,
            );
            return;
          }

          if (option.quantity < 0) {
            alert(
              `Variant ${i + 1}, Option ${j + 1}: Quantity must be zero or positive.`,
            );
            return;
          }

          if (!option.sku || option.sku.trim() === "") {
            alert(`Variant ${i + 1}, Option ${j + 1}: SKU is required.`);
            return;
          }
        }
      }

      // First, validate the form data without images
      const formDataWithoutImages = {
        ...data,
        mainImage: selectedImages.length > 0 ? ["temp"] : [], // Temporary value for validation
      };

      const preValidationResult = productCreateSchema.safeParse(
        formDataWithoutImages,
      );
      if (!preValidationResult.success) {
        console.error("Pre-validation errors:", preValidationResult.error);

        // Check if the error is related to images
        const imageErrors = preValidationResult.error.issues.filter((issue) =>
          issue.path.includes("mainImage"),
        );

        if (imageErrors.length > 0 && selectedImages.length === 0) {
          alert("Please select at least one image for the product.");
          return;
        }

        alert("Please check the form data and try again.");
        return;
      }

      // If we get here, the form data is valid except for images
      // Now handle image upload
      if (selectedImages.length === 0) {
        alert("Please select at least one image for the product.");
        return;
      }

      let uploadedImageUrls: string[] = [];
      const formData = new FormData();
      formData.append("entityType", "products");

      // Append each image file
      selectedImages.forEach((image) => {
        formData.append("gallery", image);
      });

      const uploadRes = await fetch("/api/upload-demo", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Image upload failed");

      const uploadResult = await uploadRes.json();
      uploadedImageUrls = uploadResult.files?.gallery || [];

      // Create final data with uploaded images
      const finalData: TProductCreate = {
        ...data,
        mainImage: uploadedImageUrls,
      };

      console.log("Final data with uploaded images:", finalData);

      // Validate the final data
      const finalValidationResult = productCreateSchema.safeParse(finalData);
      if (!finalValidationResult.success) {
        console.error("Final validation errors:", finalValidationResult.error);
        alert("Please check the form data and try again.");
        return;
      }
      console.log("Final validated data ready for submission:", finalData);
      // Submit the validated data
      mutation.mutate(finalData);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to create product. Please try again.");
    }
  };

  const onSubmitCategory = (data: CategoryFormData) => {
    categoryMutation.mutate(data);
  };

  // Convert categories to options format for Select component
  const categoryOptions = categories.map((category) => ({
    value: category._id,
    label: category.name,
  }));

  return (
    <div className="p-6">
      <PageBreadcrumb pageTitle="Add Product" />

      <form
        className="flex flex-col gap-10"
        onSubmit={handleSubmit(onSubmit, (err) =>
          console.log("Validation errors:", err),
        )}
      >
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Product Details */}
          <ComponentCard title="Product Details">
            <div className="space-y-4">
              <div className="flex flex-col">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Enter product name"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col">
                <Label htmlFor="description">Description</Label>
                <TextArea
                  value={watch("description") || ""}
                  onChange={(value) => setValue("description", value)}
                  placeholder="Enter product description"
                  className={errors.description ? "border-red-500" : ""}
                  rows={4}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="category">Category</Label>
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 3.75C12.4142 3.75 12.75 4.08579 12.75 4.5V11.25H19.5C19.9142 11.25 20.25 11.5858 20.25 12C20.25 12.4142 19.9142 12.75 19.5 12.75H12.75V19.5C12.75 19.9142 12.4142 20.25 12 20.25C11.5858 20.25 11.25 19.9142 11.25 19.5V12.75H4.5C4.08579 12.75 3.75 12.4142 3.75 12C3.75 11.5858 4.08579 11.25 4.5 11.25H11.25V4.5C11.25 4.08579 11.5858 3.75 12 3.75Z"
                        fill="currentColor"
                      />
                    </svg>
                    Add Category
                  </button>
                </div>
                <Select
                  options={categoryOptions}
                  placeholder="Select a category"
                  onChange={(value) => setValue("category", value)}
                  className={errors.category ? "border-red-500" : ""}
                />
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>
            </div>
          </ComponentCard>

          {/* Pricing */}
          <ComponentCard title="Pricing">
            <div className="space-y-4">
              <div className="flex flex-col">
                <Label htmlFor="costPrice">Cost Price</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  {...register("costPrice", { valueAsNumber: true })}
                  placeholder="0.00"
                  className={errors.costPrice ? "border-red-500" : ""}
                />
                {errors.costPrice && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.costPrice.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col">
                <Label htmlFor="basePrice">Selling Price</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  {...register("basePrice", { valueAsNumber: true })}
                  placeholder="0.00"
                  className={errors.basePrice ? "border-red-500" : ""}
                />
                {errors.basePrice && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.basePrice.message}
                  </p>
                )}
              </div>
            </div>
          </ComponentCard>
        </div>

        {/* Images */}
        <ComponentCard title="Product Images">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <Label>Product Images</Label>
              <ImageDropzone
                images={selectedImages}
                onImagesChange={setSelectedImages}
                errors={errors.mainImage}
              />
            </div>
          </div>
        </ComponentCard>

        {/* Variants */}
        <ComponentCard title="Product Variants">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="category">Variant</Label>
              <button
                type="button"
                onClick={() =>
                  appendVariant({
                    color: "",
                    colorHex: "",

                    images: [],
                    options: [{ size: "", price: 0, quantity: 0, sku: "" }],
                  })
                }
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 3.75C12.4142 3.75 12.75 4.08579 12.75 4.5V11.25H19.5C19.9142 11.25 20.25 11.5858 20.25 12C20.25 12.4142 19.9142 12.75 19.5 12.75H12.75V19.5C12.75 19.9142 12.4142 20.25 12 20.25C11.5858 20.25 11.25 19.9142 11.25 19.5V12.75H4.5C4.08579 12.75 3.75 12.4142 3.75 12C3.75 11.5858 4.08579 11.25 4.5 11.25H11.25V4.5C11.25 4.08579 11.5858 3.75 12 3.75Z"
                    fill="currentColor"
                  />
                </svg>
                Add Variant
              </button>
            </div>

            {/* Loop through Variants */}

            {variantFields.map((field, index) => (
              <VariantFields
                key={field.id}
                control={control}
                register={register}
                variantIndex={index}
                removeVariant={() => removeVariant(index)}
              />
            ))}

            {errors.variants && (
              <p className="text-red-500 text-sm mt-1">
                {errors.variants.message}
              </p>
            )}
          </div>
        </ComponentCard>

        {/* Submit Button */}
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50 font-medium"
          >
            {isSubmitting || isLoading ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>

      {/* Category Creation Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        className="max-w-md w-full mx-4"
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Category</h2>
          <form
            onSubmit={handleSubmitCategory(onSubmitCategory)}
            className="space-y-4"
          >
            <div className="flex flex-col">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                {...registerCategory("name", {
                  required: "Category name is required",
                })}
                placeholder="Enter category name"
                className={categoryErrors.name ? "border-red-500" : ""}
              />
              {categoryErrors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {categoryErrors.name.message}
                </p>
              )}
            </div>

            <div className="flex flex-col">
              <Label htmlFor="categoryDescription">Description</Label>
              <TextArea
                value={watchCategory("description") || ""}
                onChange={(value) => setValueCategory("description", value)}
                placeholder="Enter category description"
                className={categoryErrors.description ? "border-red-500" : ""}
                rows={3}
              />
              {categoryErrors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {categoryErrors.description.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatingCategory}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isCreatingCategory ? "Creating..." : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
