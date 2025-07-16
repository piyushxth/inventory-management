"use client";
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Label from "@/components/admin/form/Label";
import Input from "@/components/admin/form/input/InputField";
import TextArea from "@/components/admin/form/input/TextArea";
import Select from "@/components/admin/form/Select";
import ComponentCard from "@/components/admin/common/ComponentCard";
import Button from "@/components/admin/ui/button/Button";
import {
  TProductCreate,
  productCreateSchema,
} from "@/libs/zod_schema/products/productCreate";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { z } from "zod";

interface Category {
  _id: string;
  name: string;
  description: string;
}

// Temporary schema for form validation (without image requirement)
const formValidationSchema = productCreateSchema.omit({ images: true }).extend({
  images: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formValidationSchema>;

// Custom Dropzone Component for Edit
const ImageDropzone: React.FC<{
  existingImages: string[];
  newImages: File[];
  onNewImagesChange: (images: File[]) => void;
  onExistingImagesChange: (images: string[]) => void;
  errors?: any;
}> = ({
  existingImages,
  newImages: newImageFiles,
  onNewImagesChange,
  onExistingImagesChange,
  errors,
}) => {
  const onDrop = (acceptedFiles: File[]) => {
    // Add new images to existing ones
    onNewImagesChange([...newImageFiles, ...acceptedFiles]);
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

  const removeNewImage = (index: number) => {
    const updatedNewImages = newImageFiles.filter(
      (_: File, i: number) => i !== index
    );
    onNewImagesChange(updatedNewImages);
  };

  const removeExistingImage = (index: number) => {
    const newExistingImages = existingImages.filter(
      (_: string, i: number) => i !== index
    );
    onExistingImagesChange(newExistingImages);
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
            {isDragActive ? "Drop images here" : "Drag & drop new images here"}
          </p>
          <p className="text-sm text-gray-500">or click to browse files</p>
        </div>
      </div>

      {/* Display existing images */}
      {existingImages.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">Existing Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {existingImages.map((imageUrl, index) => (
              <div key={`existing-${index}`} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={imageUrl}
                    alt={`Existing product image ${index + 1}`}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {imageUrl.split("/").pop()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Display new images */}
      {newImageFiles.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">
            New Images (to be uploaded)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {newImageFiles.map((file, index) => (
              <div key={`new-${index}`} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`New product image ${index + 1}`}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {file.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {errors && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
    </div>
  );
};

const ProductEditForm = ({ product }: { product: TProductCreate }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>(
    product.images || []
  );
  const [newImages, setNewImages] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    control,
  } = useForm<FormData>({
    resolver: zodResolver(formValidationSchema),
    defaultValues: {
      ...product,
      // Handle category - if it's an object, extract the _id, otherwise use as is
      category:
        typeof product.category === "object" && product.category !== null
          ? (product.category as any)._id
          : product.category,
      // Ensure we have at least one variant
      variants:
        product.variants && product.variants.length > 0
          ? product.variants
          : [{ size: "", color: "", quantity: 0, sku: "" }],
      // Ensure we have images array
      images: product.images || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

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

  // Update form images when existingImages changes
  useEffect(() => {
    setValue("images", existingImages);
  }, [existingImages, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      console.log("=== FORM SUBMISSION TRIGGERED ===");
      console.log("Form submitted with data:", data);
      console.log("Existing images:", existingImages);
      console.log("New images:", newImages);

      let finalImageUrls = [...existingImages];

      // Upload new images if any
      if (newImages.length > 0) {
        const formData = new FormData();
        formData.append("entityType", "products");

        // Append each new image file
        newImages.forEach((image: File) => {
          formData.append("gallery", image);
        });

        const uploadRes = await fetch("/api/upload-demo", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Image upload failed");

        const uploadResult = await uploadRes.json();
        const uploadedUrls = uploadResult.files?.gallery || [];

        // Add new uploaded URLs to existing ones
        finalImageUrls = [...existingImages, ...uploadedUrls];
      }

      const finalData: TProductCreate = {
        ...data,
        images: finalImageUrls,
      };

      console.log("Final data", finalData);
      const result = productCreateSchema.safeParse(finalData);
      if (result.success) {
        setIsLoading(true);
        try {
          const response = await axios.put(
            `/api/products/${data._id}`,
            finalData
          );
          console.log("API response:", response);
          if (response.data.success) {
            alert("Product updated successfully!");
          }
          console.log("Product updated:", finalData);
        } catch (error) {
          console.error("Error updating Product:", error);
          alert("Error updating product. Please try again.");
        } finally {
          setIsLoading(false);
        }
      } else {
        console.error("Validation errors:", result.error);
        alert("Please check the form data and try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to upload images. Please try again.");
    }
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
              <Label htmlFor="category">Category</Label>
              <Select
                options={categoryOptions}
                placeholder="Select a category"
                onChange={(value) => setValue("category", value)}
                className={errors.category ? "border-red-500" : ""}
                defaultValue={
                  typeof product.category === "object" &&
                  product.category !== null
                    ? (product.category as any)._id
                    : product.category
                }
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
              existingImages={existingImages}
              newImages={newImages}
              onNewImagesChange={setNewImages}
              onExistingImagesChange={setExistingImages}
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
                  <Label htmlFor={`variants.${index}.quantity`}>Quantity</Label>
                  <Input
                    type="number"
                    {...register(`variants.${index}.quantity`, {
                      valueAsNumber: true,
                    })}
                    placeholder="0"
                    className={
                      errors.variants?.[index]?.quantity ? "border-red-500" : ""
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
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50 font-medium"
        >
          {isSubmitting || isLoading ? "Updating..." : "Update Product"}
        </button>
      </div>
    </form>
  );
};

export default ProductEditForm;
