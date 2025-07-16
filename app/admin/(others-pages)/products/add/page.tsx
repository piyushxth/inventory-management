"use client";

import React, { useEffect, useState } from "react";
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
import { z } from "zod";
import { z as zodZ } from "zod";

interface Category {
  _id: string;
  name: string;
  description: string;
}

interface CategoryFormData {
  name: string;
  description: string;
}

// Temporary schema for form validation (without image requirement)
const formValidationSchema = productCreateSchema.omit({ images: true }).extend({
  images: z.array(z.string()).optional(),
});

type FormData = zodZ.infer<typeof formValidationSchema>;

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
    resolver: zodResolver(formValidationSchema),
    defaultValues: {
      images: [],
      variants: [{ size: "", color: "", quantity: 0, sku: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

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
    onSuccess: () => {
      alert("Product created successfully!");
      // Reset form
      setValue("name", "");
      setValue("description", "");
      setValue("category", "");
      setValue("cost_price", 0);
      setValue("selling_price", 0);
      setValue("availableQuantity", 0);
      setValue("images", []);
      setValue("variants", [{ size: "", color: "", quantity: 0, sku: "" }]);
      setSelectedImages([]);
    },
    onError: (error) => {
      console.error("Error creating product:", error);
      alert("Failed to create product. Please try again.");
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
          "Failed to create category. Please try again."
      );
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      console.log("data", data);
      let uploadedImageUrls: string[] = [];

      if (selectedImages.length > 0) {
        const formData = new FormData();
        formData.append("entityType", "products");

        // Append each image file
        selectedImages.forEach((image, index) => {
          formData.append("gallery", image);
        });

        const uploadRes = await fetch("/api/upload-demo", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Image upload failed");

        const uploadResult = await uploadRes.json();
        uploadedImageUrls = uploadResult.files?.gallery || [];

        const finalData: TProductCreate = {
          ...data,
          images: uploadedImageUrls,
        };

        console.log("Final data", finalData);
        const result = productCreateSchema.safeParse(finalData);
        if (result.success) {
          mutation.mutate(finalData);
        } else {
          console.error("Validation errors:", result.error);
          alert("Please check the form data and try again.");
        }
      } else {
        // If no images selected, show error
        alert("Please select at least one image for the product.");
        return;
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to upload images. Please try again.");
    }
  };

  const onSubmitCategory = (data: CategoryFormData) => {
    categoryMutation.mutate(data);
  };

  const addVariant = () => {
    append({
      size: "",
      color: "",
      quantity: 0,
      sku: "",
    });
  };

  // Convert categories to options format for Select component
  const categoryOptions = categories.map((category) => ({
    value: category._id,
    label: category.name,
  }));

  return (
    <div className="p-6">
      <PageBreadcrumb pageTitle="Add Product" />

      <form onSubmit={handleSubmit(onSubmit)}>
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
                <Label htmlFor="cost_price">Cost Price</Label>
                <Input
                  id="cost_price"
                  type="number"
                  step="0.01"
                  {...register("cost_price", { valueAsNumber: true })}
                  placeholder="0.00"
                  className={errors.cost_price ? "border-red-500" : ""}
                />
                {errors.cost_price && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.cost_price.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col">
                <Label htmlFor="selling_price">Selling Price</Label>
                <Input
                  id="selling_price"
                  type="number"
                  step="0.01"
                  {...register("selling_price", { valueAsNumber: true })}
                  placeholder="0.00"
                  className={errors.selling_price ? "border-red-500" : ""}
                />
                {errors.selling_price && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.selling_price.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col">
                <Label htmlFor="availableQuantity">Available Quantity</Label>
                <Input
                  id="availableQuantity"
                  type="number"
                  {...register("availableQuantity", { valueAsNumber: true })}
                  placeholder="0"
                  className={errors.availableQuantity ? "border-red-500" : ""}
                />
                {errors.availableQuantity && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.availableQuantity.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col">
                <Label htmlFor="initialStock">Initial Stock</Label>
                <Input
                  id="initialStock"
                  type="number"
                  {...register("initialStock", { valueAsNumber: true })}
                  placeholder="0"
                  className={errors.initialStock ? "border-red-500" : ""}
                />
                {errors.initialStock && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.initialStock.message}
                  </p>
                )}
              </div>
            </div>
          </ComponentCard>
        </div>

        {/* Images */}
        <ComponentCard title="Product Images">
          <div className="space-y-4">
            <div className="flex flex-col">
              <Label>Product Images</Label>
              <ImageDropzone
                images={selectedImages}
                onImagesChange={setSelectedImages}
                errors={errors.images}
              />
            </div>
          </div>
        </ComponentCard>

        {/* Variants */}
        <ComponentCard title="Product Variants">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Variants</Label>
              <Button
                onClick={addVariant}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Add Variant
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="border p-4 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Variant {index + 1}</h4>
                  <Button
                    onClick={() => remove(index)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <Label htmlFor={`variants.${index}.size`}>Size</Label>
                    <Input
                      {...register(`variants.${index}.size`)}
                      placeholder="e.g., S, M, L, XL"
                      className={
                        errors.variants?.[index]?.size ? "border-red-500" : ""
                      }
                    />
                    {errors.variants?.[index]?.size && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.variants[index]?.size?.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <Label htmlFor={`variants.${index}.color`}>Color</Label>
                    <Input
                      {...register(`variants.${index}.color`)}
                      placeholder="e.g., Red, Blue, Black"
                      className={
                        errors.variants?.[index]?.color ? "border-red-500" : ""
                      }
                    />
                    {errors.variants?.[index]?.color && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.variants[index]?.color?.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <Label htmlFor={`variants.${index}.quantity`}>
                      Quantity
                    </Label>
                    <Input
                      type="number"
                      {...register(`variants.${index}.quantity`, {
                        valueAsNumber: true,
                      })}
                      placeholder="0"
                      className={
                        errors.variants?.[index]?.quantity
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {errors.variants?.[index]?.quantity && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.variants[index]?.quantity?.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <Label htmlFor={`variants.${index}.sku`}>SKU</Label>
                    <Input
                      {...register(`variants.${index}.sku`)}
                      placeholder="e.g., TSHIRT-BLK-M"
                      className={
                        errors.variants?.[index]?.sku ? "border-red-500" : ""
                      }
                    />
                    {errors.variants?.[index]?.sku && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.variants[index]?.sku?.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
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
